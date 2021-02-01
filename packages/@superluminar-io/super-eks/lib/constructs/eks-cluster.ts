import * as cdk from "@aws-cdk/core"
import * as eks from "@aws-cdk/aws-eks"
import * as ec2 from "@aws-cdk/aws-ec2"

export interface EksClusterProps {
  vpcId: string
  // adminRole?
}

export class EksCluster extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: EksClusterProps) {
    super(scope, id)

    const vpc = ec2.Vpc.fromLookup(this, "ClusterVpc", { vpcId: props.vpcId })

    new eks.Cluster(this, "HelloEks", {
      version: eks.KubernetesVersion.V1_18,
      vpc,
    })
  }
}
