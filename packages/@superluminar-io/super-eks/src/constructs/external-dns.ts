import * as cdk from "@aws-cdk/core"
import * as eks from "@aws-cdk/aws-eks"
import * as iam from "@aws-cdk/aws-iam"

import { SuperEksNodegroup } from "../config/cluster"

export interface ExternalDNSProps {
  /**
   * The EKS cluster to install to
   */
  readonly cluster: eks.ICluster
  /**
   * List of hosted zone IDs, used for IAM permissions and filtering
   */
  readonly hostedZoneIds: string[]
  /**
   * The namespace to install to
   *
   * @default 'external-dns'
   */
  readonly namespace?: string
  /**
   * Whether to create the namespace given
   *
   * @default true
   */
  readonly createNamespace?: boolean
}

export class ExternalDNS extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ExternalDNSProps) {
    super(scope, id)

    // Create namespace if set
    const createNamespace =
      props.createNamespace !== undefined ? props.createNamespace : true

    // Define the namespace we want to install to
    const namespace = props.namespace ?? "external-dns"

    // Create service account
    const serviceAccount = props.cluster.addServiceAccount("external-dns", {
      name: "external-dns",
      namespace: namespace,
    })

    // Add IAM policy according to https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md
    props.hostedZoneIds.forEach((hostedZoneId) =>
      serviceAccount.addToPolicy(
        new iam.PolicyStatement({
          actions: [
            "route53:ChangeResourceRecordSets",
            "route53:ListResourceRecordSets",
          ],
          resources: [`arn:aws:route53:::hostedzone/${hostedZoneId}`],
        })
      )
    )
    serviceAccount.addToPolicy(
      new iam.PolicyStatement({
        actions: ["route53:ListHostedZones"],
        resources: ["*"],
      })
    )

    // Install controller via Helm
    const chart = new eks.HelmChart(this, "ExternalDNSHelmChart", {
      cluster: props.cluster,
      namespace: namespace,
      repository: "https://charts.bitnami.com/bitnami",
      chart: "external-dns",
      release: "external-dns",
      version: "4.6.0",
      values: {
        zoneIdFilters: props.hostedZoneIds,
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccountName,
        },
        tolerations: [SuperEksNodegroup.taint],
        nodeSelector: SuperEksNodegroup.labels,
      },
    })

    // Create the namespace
    if (createNamespace) {
      const namespaceManifest = props.cluster.addManifest(
        "external-dns-namespace",
        {
          apiVersion: "v1",
          kind: "Namespace",
          metadata: {
            name: namespace,
          },
        }
      )
      chart.node.addDependency(namespaceManifest)
      serviceAccount.node.addDependency(namespaceManifest)
    }
  }
}
