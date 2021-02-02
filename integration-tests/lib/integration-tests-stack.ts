import * as cdk from "@aws-cdk/core"
import * as route53 from "@aws-cdk/aws-route53"

import { SuperEks } from "@superluminar-io/super-eks"

const ROUTE53_ZONE_NAME = "integration.super-eks.superluminar.io"

export class IntegrationTestsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: ROUTE53_ZONE_NAME,
    })

    const superEks = new SuperEks(this, "EksCluster", { hostedZone })

    // Add nginx installation for testing
    superEks.cluster.addHelmChart("nginx", {
      createNamespace: true,
      namespace: "nginx",
      repository: "https://charts.bitnami.com/bitnami",
      chart: "nginx",
      release: "nginx",
      version: "8.5.2",
      values: {
        ingress: {
          enabled: true,
          hostname: `nginx.${ROUTE53_ZONE_NAME}`,
          annotations: {
            "kubernetes.io/ingress.class": "alb",
            "alb.ingress.kubernetes.io/scheme": "internet-facing",
            "alb.ingress.kubernetes.io/target-type": "ip",
          },
        },
      },
    })
  }
}
