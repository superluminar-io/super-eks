import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
import { FluentBit } from '../../src/constructs/fluent-bit';

describe('fluent-bit', () => {
  test('namespace is "logging"', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new FluentBit(stack, 'FluentBit', {
      cluster,
      region: 'eu-west-1',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'logging',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"logging","labels":{"aws.cdk.eks/prune-c807348d0daee975eb2e4f53e89602b8c74d3364a8":""}}}]',
    });
  });

  test('Cloudwatch is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new FluentBit(stack, 'FluentBit', {
      cluster,
      region: 'eu-west-1',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values:
        '{"serviceAccount":{"create":false,"name":"fluent-bit"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"},"firehose":{"enabled":false},"kinesis":{"enabled":false},"elasticsearch":{"enabled":false},"cloudWatch":{"region":"eu-west-1"}}',
    });
  });
});

