import * as cdk from "@aws-cdk/core"
import { IHostedZone } from "@aws-cdk/aws-route53"

import * as eks from "@aws-cdk/aws-eks"
import * as ec2 from "@aws-cdk/aws-ec2"

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
  }

  private configureCluster(): eks.Cluster {
    return new eks.Cluster(this, "EksCluster", {
      version: eks.KubernetesVersion.V1_18,
      vpc: this.props.vpc,
    })
  }
}
