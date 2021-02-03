import * as cdk from "@aws-cdk/core"
import * as route53 from "@aws-cdk/aws-route53"

import { SuperEks } from "@superluminar-io/super-eks"

export interface IntegrationTestsStackProps extends cdk.StackProps {
  hostedZone: route53.IHostedZone
}

/**
 * Integration test stack launches super-eks for testing
 */
export class IntegrationTestsStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: IntegrationTestsStackProps
  ) {
    super(scope, id, props)

    const superEks = new SuperEks(this, "EksCluster", {
      hostedZone: props.hostedZone,
    })

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
          hostname: `nginx.${props.hostedZone.zoneName}`,
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
