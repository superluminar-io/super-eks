import * as cdk from "@aws-cdk/core"
import { IHostedZone } from "@aws-cdk/aws-route53"

import * as eks from "@aws-cdk/aws-eks"
import * as ec2 from "@aws-cdk/aws-ec2"
import { ExternalDNS } from "./external-dns"
import { AwsLoadBalancerController } from "./aws-load-balancer-controller"

export interface SuperEksProps {
  hostedZone: IHostedZone
  vpc?: ec2.IVpc
  // adminRole?
}

export class SuperEks extends cdk.Construct {
  private props: SuperEksProps

  readonly cluster: eks.Cluster

  constructor(scope: cdk.Construct, id: string, props: SuperEksProps) {
    super(scope, id)
    this.props = props
    this.cluster = this.configureCluster()
    this.configureExternalDNS()
    this.configureAwsLoadBalancerController()
  }

  private configureCluster(): eks.Cluster {
    return new eks.Cluster(this, "EksCluster", {
      version: eks.KubernetesVersion.V1_18,
      vpc: this.props.vpc,
    })
  }

  private configureExternalDNS(): void {
    new ExternalDNS(this, "ExternalDNS", {
      cluster: this.cluster,
      hostedZoneIds: [this.props.hostedZone.hostedZoneId],
    })
  }

  private configureAwsLoadBalancerController(): void {
    new AwsLoadBalancerController(this, "AWSLoadBalancerController", {
      cluster: this.cluster,
      region: "",
      vpcId: this.props.vpc ? this.props.vpc?.vpcId : this.cluster.vpc.vpcId,
    })
  }
}
