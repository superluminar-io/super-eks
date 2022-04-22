import { Stack, aws_ec2 as ec2, aws_eks as eks, aws_iam as iam, aws_route53 as r53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { InternalNodegroup } from '../config/cluster';
import { NodeTaint } from '../types/cluster';
import { AwsLoadBalancerController } from './aws-load-balancer-controller';
import * as ema from './eks-managed-addon';
import { ExternalDNS } from './external-dns';
import { ExternalSecrets } from './external-secrets';
import { FluentBit } from './fluent-bit';

export { VpcCniAddonVersion } from './eks-managed-addon';

/**
 * Constructor properties for SuperEks.
 * Get merged with `defaultSuperEksProps`.
 */
export interface SuperEksProps {
  /**
   * Wrapper for all cluster props>
   */
  readonly clusterProps?: eks.ClusterProps;

  /**
   * Additional Roles that should be granted cluster admin privileges.
   * Can also be added manually after cluster creation by using `cluster.awsAuth.addMastersRole(role)`.
   */
  readonly adminRoles?: iam.IRole[];

  /**
   * A hosted zone for DNS management. Records in this zone will be created for your workloads by 'external-dns'.
   */
  readonly hostedZone: r53.IHostedZone;

  /**
   * Config for the Nodegroup created to host SuperEks specific workloads.
   * If you override the `launchTemplateSpec` you're responsible for adding the necessary userdata to taint the nodes,
   * see `../config/cluster#nodeTaintUserdata`
   */
  readonly superEksNodegroupProps?: eks.NodegroupOptions;

  /**
   * Specific properties for EKS managed add-ons
   */
  readonly addonProps?: AddonProps;
}

/**
 * Specific properties for EKS managed add-ons
 */
export interface AddonProps {
  readonly vpcCniAddonVersion?: ema.VpcCniAddonVersion;
}

/**
 * Default config for SuperEks
 */
export const defaultSuperEksProps = {
  clusterProps: {
    version: eks.KubernetesVersion.V1_19,
  },
  superEksNodegroupProps: {
    nodegroupName: 'super-eks',
    labels: InternalNodegroup.labels,
    instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE)],
  },
};

/**
 * SuperEks wraps eks.Cluster to include batteries
 */
export class SuperEks extends Construct {
  private props: SuperEksProps & Required<Pick<SuperEksProps, 'clusterProps'>>;

  /**
   * The created cluster.
   *
   * @attribute
   */
  readonly cluster: eks.Cluster;

  /**
   * `eks.Nodegroup`s added to the cluster
   * @attribute
   *
   * @default An internal `eks.Nodegroup` will be created for super-eks related workloads
   */
  readonly additionalNodegroups: eks.Nodegroup[] = [];

  constructor(scope: Construct, id: string, props: SuperEksProps) {
    super(scope, id);
    this.props = {
      ...props,
      clusterProps: { ...defaultSuperEksProps.clusterProps, ...props.clusterProps },
      superEksNodegroupProps: { ...defaultSuperEksProps.superEksNodegroupProps, ...props.superEksNodegroupProps },
    };

    this.cluster = this.configureCluster();
    this.addAdminRoles();

    this.additionalNodegroups.push(this.addSuperEksNodegroup());

    this.addManagedVpcCniAddon();
    this.hardenNodes();

    this.configureExternalDNS();
    this.configureAwsLoadBalancerController();
    this.configureFluentBit();

    this.addPodDisruptionBudgets();

    this.addExternalSecrets();
  }

  /**
   * Generates `ec2.MultipartUserData` to attach to a `eks.Nodegroup` `ec2.LaunchTemplate`
   * so that the Nodes are getting tainted with the given `NodeTaint`.
   *
   * @param taint the taint that should be applied to the Nodes.
   */
  nodeTaintUserdata(taint: NodeTaint): ec2.MultipartUserData {
    const userdata = ec2.UserData.forLinux();
    userdata.addCommands(
      `sed -i '/^KUBELET_EXTRA_ARGS=/a KUBELET_EXTRA_ARGS+=" --register-with-taints=${taint.key}=${taint.value}:${taint.effect}"' /etc/eks/bootstrap.sh`,
    );

    const multipart = new ec2.MultipartUserData();
    multipart.addPart(ec2.MultipartBody.fromUserData(userdata));

    return multipart;
  }

  private addAdminRoles() {
    this.props.adminRoles?.forEach((role) => this.cluster.awsAuth.addMastersRole(role));
  }

  private configureCluster(): eks.Cluster {
    return new eks.Cluster(this, 'Resource', this.props.clusterProps);
  }

  private addSuperEksNodegroup(): eks.Nodegroup {
    const lt = new ec2.LaunchTemplate(this, 'InternalNodegroupLaunchTemplate', {
      userData: this.nodeTaintUserdata(InternalNodegroup.taint),
    });

    return this.cluster.addNodegroupCapacity('InternalNodegroup', {
      launchTemplateSpec: { id: lt.launchTemplateId!, version: lt.latestVersionNumber },
      ...this.props.superEksNodegroupProps,
    });
  }

  private addManagedVpcCniAddon() {
    const addonVersion = this.props.addonProps?.vpcCniAddonVersion
      ? { addonVersion: this.props.addonProps.vpcCniAddonVersion }
      : {};
    const vpcCniAddon = new ema.VpcCniAddon(this, 'VpcCniAddon', {
      cluster: this.cluster,
      ...addonVersion,
    });

    // the add-on must only be destroyed after destruction of all eks worker nodes
    this.cluster.defaultNodegroup?.node.addDependency(vpcCniAddon);
    this.additionalNodegroups.forEach((nodegroup) => {
      nodegroup.node.addDependency(vpcCniAddon);
    });
  }

  private hardenNodes() {
    const policy = new iam.Policy(this, 'NodeHardeningPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: [
            'ec2:AssignPrivateIpAddresses',
            'ec2:AttachNetworkInterface',
            'ec2:CreateNetworkInterface',
            'ec2:DeleteNetworkInterface',
            'ec2:DetachNetworkInterface',
            'ec2:ModifyNetworkInterfaceAttribute',
            'ec2:UnassignPrivateIpAddresses',
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: ['ec2:CreateTags'],
          resources: ['arn:aws:ec2:*:*:network-interface/*'],
        }),
      ],
    });

    if (this.cluster.defaultNodegroup?.role) {
      policy.attachToRole(this.cluster.defaultNodegroup.role);
    }

    this.additionalNodegroups.forEach((nodeGroup) => policy.attachToRole(nodeGroup.role));
  }

  private configureExternalDNS(): void {
    new ExternalDNS(this, 'ExternalDNS', {
      cluster: this.cluster,
      hostedZoneIds: [this.props.hostedZone.hostedZoneId],
    });
  }

  private configureAwsLoadBalancerController(): void {
    new AwsLoadBalancerController(this, 'AWSLoadBalancerController', {
      cluster: this.cluster,
      region: Stack.of(this).region,
      vpcId: this.cluster.vpc.vpcId,
    });
  }

  private configureFluentBit(): void {
    new FluentBit(this, 'FluentBit', {
      cluster: this.cluster,
      region: Stack.of(this).region,
    });
  }

  /**
   * Adds PDBs to system workloads so that the cluster autoscaler can evict them.
   */
  private addPodDisruptionBudgets(): void {
    this.cluster.addManifest('CoreDnsPDB', {
      apiVersion: 'policy/v1beta1',
      kind: 'PodDisruptionBudget',
      metadata: {
        name: 'coredns-pdb',
        namespace: 'kube-system',
      },
      spec: {
        maxUnavailable: 1,
        selector: {
          matchLabels: { 'eks.amazonaws.com/component': 'coredns' },
        },
      },
    });
  }

  private addExternalSecrets(): void {
    new ExternalSecrets(this, 'ExternalSecrets', { cluster: this.cluster });
  }
}
