import "@aws-cdk/assert/jest"
import { Stack } from "@aws-cdk/core"
import { Cluster } from "@aws-cdk/aws-eks"
import * as eks from "@aws-cdk/aws-eks"
import { AwsLoadBalancerController } from "../../src/constructs/aws-load-balancer-controller"

describe("aws-load-balancer-controller", () => {
  test("namespace can be configured and created", () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new AwsLoadBalancerController(stack, "ALB", {
      cluster,
      region: "eu-west-1",
      vpcId: "vpc-21313",
      namespace: "foo",
      createNamespace: true,
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Namespace: "foo",
      CreateNamespace: true,
    })
  })

  test('namespace defaults to "kube-system"', () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new AwsLoadBalancerController(stack, "ALB", {
      cluster,
      region: "eu-west-1",
      vpcId: "vpc-21313",
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Namespace: "kube-system",
    })
  })

  test("Chart is configured correctly", () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new AwsLoadBalancerController(stack, "ALB", {
      cluster,
      region: "eu-west-1",
      vpcId: "vpc-21313",
    })

    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Values: {
        "Fn::Join": [
          "",
          [
            '{"clusterName":"',
            {
              Ref: "EKSE2753513",
            },
            '","region":"eu-west-1","vpcId":"vpc-21313","serviceAccount":{"create":false,"name":"aws-load-balancer-controller"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"}}',
          ],
        ],
      },
    })
  })
})
