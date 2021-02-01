import * as cdk from "@aws-cdk/core"
import * as eks from "@aws-cdk/aws-eks"
import * as iam from "@aws-cdk/aws-iam"

export interface FluentBitProps {
  readonly cluster: eks.ICluster
  readonly region: string
  readonly namespace?: string
  readonly createNamespace?: boolean
}

export class FluentBit extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: FluentBitProps) {
    super(scope, id)

    // Create namespace only if explicitly set
    const createNamespace =
      props.createNamespace !== undefined ? props.createNamespace : false

    // Define the namespace we want to install to
    const namespace = props.namespace ?? "kube-system"

    // Create service account
    const serviceAccount = props.cluster.addServiceAccount("fluent-bit", {
      name: "fluent-bit",
      namespace: namespace,
    })

    // This depends on how we configure FluentBit. We only use Cloudwatch now, so this seems fine.
    // If we were to add Kinesis or similar the policy needs to change.
    serviceAccount.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy")
    )

    // Install controller via Helm
    new eks.HelmChart(this, "FluentBitHelmChart", {
      cluster: props.cluster,
      createNamespace: createNamespace,
      namespace: namespace,
      repository: "https://aws.github.io/eks-charts",
      chart: "aws-for-fluent-bit",
      release: "aws-for-fluent-bit",
      version: "0.1.6",
      values: {
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccountName,
        },
        firehose: {
          enabled: false,
        },
        kinesis: {
          enabled: false,
        },
        elasticsearch: {
          enabled: false,
        },
        cloudwatch: {
          region: props.region,
        },
      },
    })
  }
}
