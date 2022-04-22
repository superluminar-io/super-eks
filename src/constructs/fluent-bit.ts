import { aws_eks as eks, aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { InternalNodegroup } from '../config/cluster';

export interface FluentBitProps {
  readonly cluster: eks.ICluster;
  readonly region: string;
}

export class FluentBit extends Construct {
  constructor(scope: Construct, id: string, props: FluentBitProps) {
    super(scope, id);

    // Define the namespace we want to install to
    const namespace = 'logging';

    // Create service account
    const serviceAccount = new eks.ServiceAccount(this, 'ServiceAccount', {
      cluster: props.cluster,
      name: 'fluent-bit',
      namespace: namespace,
    });

    // This depends on how we configure FluentBit. We only use Cloudwatch now, so this seems fine.
    // If we were to add Kinesis or similar the policy needs to change.
    serviceAccount.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));

    // Install controller via Helm
    const chart = new eks.HelmChart(this, 'Resource', {
      cluster: props.cluster,
      namespace: namespace,
      repository: 'https://aws.github.io/eks-charts',
      chart: 'aws-for-fluent-bit',
      release: 'aws-for-fluent-bit',
      version: '0.1.6',
      values: {
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccountName,
        },
        tolerations: [InternalNodegroup.taint],
        nodeSelector: InternalNodegroup.labels,
        firehose: {
          enabled: false,
        },
        kinesis: {
          enabled: false,
        },
        elasticsearch: {
          enabled: false,
        },
        cloudWatch: {
          region: props.region,
        },
      },
    });

    // Create the namespace
    const namespaceManifest = new eks.KubernetesManifest(this, 'LoggingNamespace', {
      cluster: props.cluster,
      manifest: [
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: namespace,
          },
        },
      ],
    });
    chart.node.addDependency(namespaceManifest);
    serviceAccount.node.addDependency(namespaceManifest);
  }
}
