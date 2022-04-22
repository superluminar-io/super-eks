import { Stack, aws_eks as eks, assertions } from 'aws-cdk-lib';
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
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'ingress',
    });
    template.hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"ingress","labels":{"aws.cdk.eks/prune-c8666648720a6db5281710188904f5897ba739577b":""}}}]',
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

    const template = assertions.Template.fromStack(stack);
    template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
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
