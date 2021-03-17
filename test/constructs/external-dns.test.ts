import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
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
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'dns',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"dns","labels":{"aws.cdk.eks/prune-c8666648720a6db5281710188904f5897ba739577b":""}}}]',
    });
  });

  test('Chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new ExternalDNS(stack, 'ALB', {
      cluster,
      hostedZoneIds: ['Z1PA6795UKMFR9'],
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values:
        '{"zoneIdFilters":["Z1PA6795UKMFR9"],"serviceAccount":{"create":false,"name":"external-dns"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"}}',
    });
  });
});

