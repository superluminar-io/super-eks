import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
import { ExternalSecrets } from '../../src/constructs/external-secrets';

describe('external-secrets', () => {
  test('namespace is "secrets"', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new ExternalSecrets(stack, 'ALB', {
      cluster,
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'secrets',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"secrets","labels":{"aws.cdk.eks/prune-c8666648720a6db5281710188904f5897ba739577b":""}}}]',
    });
  });

  test('Chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new ExternalSecrets(stack, 'ALB', {
      cluster,
    });

    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: {
        'Fn::Join': [
          '',
          [
            '{"env":{"AWS_REGION":"',
            {
              Ref: 'AWS::Region',
            },
            '"},"serviceAccount":{"create":false,"name":"external-secrets"},"securityContext":{"runAsNonRoot":true,"fsGroup":65534}}',
          ],
        ],
      },
    });
  });
});

