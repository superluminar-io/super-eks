import { Stack, aws_eks as eks, assertions } from 'aws-cdk-lib';
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
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'logging',
    });
    template.hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"logging","labels":{"aws.cdk.eks/prune-c8811d5d76d88f79ef9dda4ff4dada6049ce4c17a5":""}}}]',
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
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Values:
        '{"serviceAccount":{"create":false,"name":"fluent-bit"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"},"firehose":{"enabled":false},"kinesis":{"enabled":false},"elasticsearch":{"enabled":false},"cloudWatch":{"region":"eu-west-1"}}',
    });
  });
});

