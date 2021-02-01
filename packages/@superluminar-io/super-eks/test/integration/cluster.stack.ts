import * as cdk from "@aws-cdk/core"
import * as route53 from "@aws-cdk/aws-route53"

import { SuperEks } from "../../lib"

export class IntegrationTestsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: "integration.super-eks.superluminar.io",
    })

    new SuperEks(this, "EksCluster", { hostedZone })
  }
}
