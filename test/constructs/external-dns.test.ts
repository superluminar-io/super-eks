import { Stack, aws_eks as eks, assertions } from 'aws-cdk-lib';
import { ExternalDNS } from '../../src/constructs/external-dns';

describe('external-dns', () => {
  test('namespace is "dns"', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new ExternalDNS(stack, 'ALB', {
      cluster,
      hostedZoneIds: ['Z1PA6795UKMFR9'],
    });
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'dns',
    });
    template.hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"dns","labels":{"aws.cdk.eks/prune-c8666648720a6db5281710188904f5897ba739577b":""}}}]',
    });
  });

  test('Chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_22,
    });
    new ExternalDNS(stack, 'ALB', {
      cluster,
      hostedZoneIds: ['Z1PA6795UKMFR9'],
    });
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Values:
        '{"zoneIdFilters":["Z1PA6795UKMFR9"],"serviceAccount":{"create":false,"name":"external-dns"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"}}',
    });
  });
});
