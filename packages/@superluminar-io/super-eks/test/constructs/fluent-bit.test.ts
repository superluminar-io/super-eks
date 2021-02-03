import "@aws-cdk/assert/jest"
import { Stack } from "@aws-cdk/core"
import { Cluster } from "@aws-cdk/aws-eks"
import * as eks from "@aws-cdk/aws-eks"
import { FluentBit } from "../../src/constructs/fluent-bit"

describe("fluent-bit", () => {
  test("namespace can be configured and created", () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new FluentBit(stack, "FluentBit", {
      cluster,
      region: "eu-west-1",
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
    new FluentBit(stack, "FluentBit", {
      cluster,
      region: "eu-west-1",
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Namespace: "kube-system",
    })
  })

  test("Cloudwatch is configured correctly", () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new FluentBit(stack, "FluentBit", {
      cluster,
      region: "eu-west-1",
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Values:
        '{"serviceAccount":{"create":false,"name":"fluent-bit"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"},"firehose":{"enabled":false},"kinesis":{"enabled":false},"elasticsearch":{"enabled":false},"cloudWatch":{"region":"eu-west-1"}}',
    })
  })
})
