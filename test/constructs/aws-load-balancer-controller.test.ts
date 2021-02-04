import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
import { AwsLoadBalancerController } from '../../src/constructs/aws-load-balancer-controller';

describe('aws-load-balancer-controller', () => {
  test('namespace is "ingress"', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new AwsLoadBalancerController(stack, 'ALB', {
      cluster,
      region: 'eu-west-1',
      vpcId: 'vpc-21313',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'ingress',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"ingress","labels":{"aws.cdk.eks/prune-c8a646187a7d662d1d5a9f492481cef60a65be742a":""}}}]',
    });
  });

  test('Chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new AwsLoadBalancerController(stack, 'ALB', {
      cluster,
      region: 'eu-west-1',
      vpcId: 'vpc-21313',
    });

    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: {
        'Fn::Join': [
          '',
          [
            '{"clusterName":"',
            {
              Ref: 'EKSE2753513',
            },
            '","region":"eu-west-1","vpcId":"vpc-21313","serviceAccount":{"create":false,"name":"aws-load-balancer-controller"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"}}',
          ],
        ],
      },
    });
  });
});

