import { Stack, aws_eks as eks, assertions } from 'aws-cdk-lib';
import { ExternalSecrets } from '../../src/constructs/external-secrets';

describe('external-secrets', () => {
  test('namespace is "secrets"', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_22,
    });
    new ExternalSecrets(stack, 'ALB', {
      cluster,
    });

    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'secrets',
    });
    template.hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"secrets","labels":{"aws.cdk.eks/prune-c8666648720a6db5281710188904f5897ba739577b":""}}}]',
    });
  });
  test('admission webhook is installed', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_22,
    });
    new ExternalSecrets(stack, 'ALB', {
      cluster,
    });

    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest: { 'Fn::Join': ['', ['[{"apiVersion":"admissionregistration.k8s.io/v1beta1","kind":"MutatingWebhookConfiguration","metadata":{"name":"ExternalSecretsAdmissionWebhook","namespace":"secrets","labels":{"aws.cdk.eks/prune-c87759281e66ba3d85bd77da8315019fb71d134cdf":""}},"webhooks":[{"name":"secret-admission.super-eks.com","sideEffects":"NoneOnDryRun","admissionReviewVersions":["v1beta1"],"clientConfig":{"url":"https://', { Ref: 'ALBAdmissionWebhookApiD9DB3866' }, '.execute-api.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/"},"rules":[{"operations":["CREATE","UPDATE"],"apiGroups":["*"],"apiVersions":["*"],"resources":["namespaces"],"scope":"*"}]}]}]']] },
    });
  });

  test('Chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_22,
    });
    new ExternalSecrets(stack, 'ALB', {
      cluster,
    });
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Values: {
        'Fn::Join': [
          '',
          [
            '{"env":{"AWS_REGION":"',
            {
              Ref: 'AWS::Region',
            },
            '","ENFORCE_NAMESPACE_ANNOTATIONS":true},"serviceAccount":{"create":false,"name":"external-secrets"},"securityContext":{"runAsNonRoot":true,"fsGroup":65534}}',
          ],
        ],
      },
    });
  });
});
