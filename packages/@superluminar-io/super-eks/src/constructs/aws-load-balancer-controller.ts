import * as fs from "fs"
import * as path from "path"
import * as cdk from "@aws-cdk/core"
import * as eks from "@aws-cdk/aws-eks"
import * as iam from "@aws-cdk/aws-iam"

import { SuperEksNodegroup } from "../config/cluster"

export interface AwsLoadBalancerControllerProps {
  readonly cluster: eks.ICluster
  readonly vpcId: string
  readonly region: string
}

export class AwsLoadBalancerController extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: AwsLoadBalancerControllerProps
  ) {
    super(scope, id)

    // Define the namespace we want to install to
    const namespace = "ingress"

    // Create service account
    const serviceAccount = props.cluster.addServiceAccount(
      "aws-load-balancer-controller",
      {
        name: "aws-load-balancer-controller",
        namespace: namespace,
      }
    )

    // Add IAM policy to service account
    // See https://github.com/aws/eks-charts/tree/master/stable/aws-load-balancer-controller#prerequisites for details
    // curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
    ;(JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "aws-load-balancer-controller-iam-policy.json"),
        "utf8"
      )
    )["Statement"] as []).forEach((statement) => {
      serviceAccount.addToPolicy(iam.PolicyStatement.fromJson(statement))
    })

    // Install controller via Helm
    const chart = new eks.HelmChart(
      this,
      "AwsLoadBalancerControllerHelmChart",
      {
        cluster: props.cluster,
        namespace: namespace,
        repository: "https://aws.github.io/eks-charts",
        chart: "aws-load-balancer-controller",
        release: "aws-load-balancer-controller",
        version: "1.0.8",
        values: {
          clusterName: props.cluster.clusterName,
          region: props.region,
          vpcId: props.vpcId,
          serviceAccount: {
            create: false,
            name: serviceAccount.serviceAccountName,
          },
          tolerations: [SuperEksNodegroup.taint],
          nodeSelector: SuperEksNodegroup.labels,
        },
      }
    )

    // Create the namespace
    const namespaceManifest = props.cluster.addManifest("ingress-namespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: namespace,
      },
    })
    chart.node.addDependency(namespaceManifest)
    serviceAccount.node.addDependency(namespaceManifest)
  }
}
