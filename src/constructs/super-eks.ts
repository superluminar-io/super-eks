import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import { IHostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

import { SuperEksNodegroup, nodeTaintUserdata } from '../config/cluster';
import { AwsLoadBalancerController } from './aws-load-balancer-controller';
import { EksManagedAddon } from './eks-managed-addon';
import { ExternalDNS } from './external-dns';
import { FluentBit } from './fluent-bit';

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
  readonly hostedZone: IHostedZone;

  /**
   * Config for the Nodegroup created to host SuperEks specific workloads.
   * If you override the `launchTemplateSpec` you're responsible for adding the necessary userdata to taint the nodes,
   * see `../config/cluster#nodeTaintUserdata`
   */
  readonly superEksNodegroupProps?: eks.NodegroupOptions;
}


/**
 * Default config for SuperEks
 */
export const defaultSuperEksProps = {
  clusterProps: {
    version: eks.KubernetesVersion.V1_18,
  },
  superEksNodegroupProps: {
    nodegroupName: 'super-eks',
    labels: SuperEksNodegroup.labels,
    instanceTypes: [
      ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
    ],
  },
};

/**
 * SuperEks wraps eks.Cluster to include batteries
 */
export class SuperEks extends cdk.Construct {
  private props: SuperEksProps & Required<Pick<SuperEksProps, 'clusterProps'>>

  readonly cluster: eks.Cluster

  readonly additionalNodegroups: eks.Nodegroup[] = []

  constructor(scope: cdk.Construct, id: string, props: SuperEksProps) {
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

    this.configureExternalDNS();
    this.configureAwsLoadBalancerController();
    this.configureFluentBit();
  }

  private addAdminRoles() {
    this.props.adminRoles?.forEach((role) => this.cluster.awsAuth.addMastersRole(role));
  }

  private configureCluster(): eks.Cluster {
    return new eks.Cluster(this, 'EksCluster', this.props.clusterProps);
  }

  private addSuperEksNodegroup() : eks.Nodegroup {
    const lt = new ec2.CfnLaunchTemplate(this, 'SuperEksLaunchTemplate', {
      launchTemplateData: {
        userData: cdk.Fn.base64(nodeTaintUserdata(SuperEksNodegroup.taint)),
      },
    });

    return this.cluster.addNodegroupCapacity('SuperEksNodegroup', {
      launchTemplateSpec: { id: lt.ref, version: lt.attrLatestVersionNumber },
      ...this.props.superEksNodegroupProps,
    });
  }

  private addManagedVpcCniAddon() {
    const vpcCniAddon = new EksManagedAddon(this, 'VpcCniAddon', {
      cluster: this.cluster,
      addonName: 'vpc-cni',
      //addonVersion: 'v1.6.3-eksbuild.1',
      //addonVersion: 'v1.7.5-eksbuild.1',
      serviceAccountName: 'aws-node',
      awsManagedPolicyName: 'AmazonEKS_CNI_Policy',
    });

    // the service account must only be destroyed after destruction of all eks worker nodes
    this.cluster.defaultNodegroup?.node.addDependency(vpcCniAddon);
    this.additionalNodegroups.forEach((nodegroup) => {nodegroup.node.addDependency(vpcCniAddon); });
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
      region: cdk.Stack.of(this).region,
      vpcId: this.cluster.vpc.vpcId,
    });
  }

  private configureFluentBit(): void {
    new FluentBit(this, 'FluentBit', {
      cluster: this.cluster,
      region: cdk.Stack.of(this).region,
    });
  }
}
