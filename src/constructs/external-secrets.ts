import * as path from 'path';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import { aws_eks as eks, aws_iam as iam, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface ExternalSecretsProps {

  /**
   * The cluster to install external secrets to
   */
  readonly cluster: eks.ICluster;
}

export class ExternalSecrets extends Construct {
  constructor(scope: Construct, id: string, props: ExternalSecretsProps) {
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
          AWS_REGION: Stack.of(this).region,
          ENFORCE_NAMESPACE_ANNOTATIONS: true,
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

    const fn = new GoFunction(this, 'adm', {
      entry: path.join(__dirname, '..', 'lambdas', 'external-secrets-admission-controller', 'cmd'),
    });

    const api = new HttpApi(this, 'AdmissionWebhookApi', {});
    api.addRoutes({
      path: '/',
      integration: new HttpLambdaIntegration('AdmissionWebhookIntegration', fn, {}),
    });
  }
}
