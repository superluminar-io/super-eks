import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import { IHostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

import { SuperEksNodegroup, nodeTaintUserdata } from '../config/cluster';
import { AwsLoadBalancerController } from './aws-load-balancer-controller';
import { ExternalDNS } from './external-dns';
import { FluentBit } from './fluent-bit';


export interface SuperEksProps {
  readonly hostedZone: IHostedZone;
  readonly vpc?: ec2.IVpc;
  // adminRole?
}

export class SuperEks extends cdk.Construct {
  private props: SuperEksProps

  readonly cluster: eks.Cluster

  constructor(scope: cdk.Construct, id: string, props: SuperEksProps) {
    super(scope, id);
    this.props = props;

    this.cluster = this.configureCluster();
    this.addSuperEksNodegroup();

    this.configureExternalDNS();
    this.configureAwsLoadBalancerController();
    this.configureFluentBit();
  }

  private configureCluster(): eks.Cluster {
    return new eks.Cluster(this, 'EksCluster', {
      version: eks.KubernetesVersion.V1_18,
      vpc: this.props.vpc,
    });
  }

  private addSuperEksNodegroup() {
    const lt = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        userData: cdk.Fn.base64(nodeTaintUserdata(SuperEksNodegroup.taint)),
      },
    });

    this.cluster.addNodegroupCapacity('SuperEksNodegroup', {
      labels: SuperEksNodegroup.labels,
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      ],
      launchTemplateSpec: { id: lt.ref, version: lt.attrLatestVersionNumber },
    });
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
