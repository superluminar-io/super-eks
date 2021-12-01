import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';


export interface ExternalSecretsProps {

  /**
   * The cluster to install external secrets to
   */
  readonly cluster: eks.ICluster;
}

export class ExternalSecrets extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ExternalSecretsProps) {
    super(scope, id);

    // Define the namespace we want to install to
    const namespace = 'secrets';

    // Create service account
    const serviceAccount = new eks.ServiceAccount(this, 'ServiceAccount', {
      cluster: props.cluster,
      name: 'external-secrets',
      namespace,
    });

    // Install controller via Helm
    const chart = new eks.HelmChart(this, 'Resource', {
      cluster: props.cluster,
      namespace,
      repository: 'https://external-secrets.github.io/kubernetes-external-secrets',
      chart: 'kubernetes-external-secrets',
      release: 'external-secrets',
      version: '8.4.0',
      values: {
        env: {
          AWS_REGION: cdk.Stack.of(this).region,
        },
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccountName,
        },
        securityContext: {
          runAsNonRoot: true,
          fsGroup: 65534,
        },
      },
    });

    serviceAccount.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'secretsmanager:GetResourcePolicy',
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
          'secretsmanager:ListSecretVersionIds',
        ],
        resources: [
          '*',
        ],
        conditions: {
          StringEquals: { 'aws:ResourceTag/SuperEKS': 'secrets' },
        },
      }),
    );

    // Create the namespace
    const namespaceManifest = new eks.KubernetesManifest(this, 'Namespace', {
      cluster: props.cluster,
      manifest: [{
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: namespace,
        },
      }],
    });
    chart.node.addDependency(namespaceManifest);
    serviceAccount.node.addDependency(namespaceManifest);
  }
}
