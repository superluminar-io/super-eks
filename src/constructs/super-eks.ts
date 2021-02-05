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
 * Properties to configure SuperEks.
 */
export interface SuperEksProps {
  /**
   * A hosted zone for DNS management. Records in this zone will be created for your workloads by 'external-dns'.
   */
  readonly hostedZone: IHostedZone;
  /**
   * A VPC, otherwise a dedicated VPC will be created.
   * @default - none
   */
  readonly vpc?: ec2.IVpc;
  /**
   * A list of IAM roles for administrative access.
   * The specified IAM roles will be added to the system:masters RBAC group,
   * which means that anyone that can assume these will be able to administer this Kubernetes system.
   */
  readonly adminRoles?: iam.IRole[];
}

/**
 * SuperEks wraps eks.Cluster to include batteries
 */
export class SuperEks extends cdk.Construct {
  private props: SuperEksProps

  readonly cluster: eks.Cluster

  readonly additionalNodegroups: eks.Nodegroup[] = []

  constructor(scope: cdk.Construct, id: string, props: SuperEksProps) {
    super(scope, id);
    this.props = props;

    this.cluster = this.configureCluster();
    this.addAdminRoles();

    this.additionalNodegroups.push(this.addSuperEksNodegroup());

    this.addManagedVpcCniAddon();

    this.configureExternalDNS();
    this.configureAwsLoadBalancerController();
    this.configureFluentBit();
  }

  private addAdminRoles() {
    if (this.props.adminRoles) {
      for (const role of this.props.adminRoles) {
        this.cluster.awsAuth.addMastersRole(role);
      }
    }
  }

  private configureCluster(): eks.Cluster {
    return new eks.Cluster(this, 'EksCluster', {
      version: eks.KubernetesVersion.V1_18,
      vpc: this.props.vpc,
    });
  }

  private addSuperEksNodegroup() : eks.Nodegroup {
    const lt = new ec2.CfnLaunchTemplate(this, 'SuperEksLaunchTemplate', {
      launchTemplateData: {
        userData: cdk.Fn.base64(nodeTaintUserdata(SuperEksNodegroup.taint)),
      },
    });

    return this.cluster.addNodegroupCapacity('SuperEksNodegroup', {
      nodegroupName: 'super-eks',
      labels: SuperEksNodegroup.labels,
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      ],
      launchTemplateSpec: { id: lt.ref, version: lt.attrLatestVersionNumber },
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
      vpcId: this.props.vpc ? this.props.vpc?.vpcId : this.cluster.vpc.vpcId,
    });
  }

  private configureFluentBit(): void {
    new FluentBit(this, 'FluentBit', {
      cluster: this.cluster,
      region: cdk.Stack.of(this).region,
    });
  }
}
