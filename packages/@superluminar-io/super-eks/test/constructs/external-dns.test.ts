import "@aws-cdk/assert/jest"
import { Stack } from "@aws-cdk/core"
import { Cluster } from "@aws-cdk/aws-eks"
import * as eks from "@aws-cdk/aws-eks"
import { ExternalDNS } from "../../src/constructs/external-dns"

describe("external-dns", () => {
  test('namespace defaults to "external-dns"', () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new ExternalDNS(stack, "ALB", {
      cluster,
      hostedZoneIds: ["Z1PA6795UKMFR9"],
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Namespace: "external-dns",
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-KubernetesResource", {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"external-dns","labels":{"aws.cdk.eks/prune-c804bfa66fcf6456868237b3c3a8164ad14c46bd77":""}}}]',
    })
  })

  test("Chart is configured correctly", () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new ExternalDNS(stack, "ALB", {
      cluster,
      hostedZoneIds: ["Z1PA6795UKMFR9"],
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Values:
        '{"zoneIdFilters":["Z1PA6795UKMFR9"],"serviceAccount":{"create":false,"name":"external-dns"},"tolerations":[{"key":"workload","value":"super-eks","effect":"NoSchedule"}],"nodeSelector":{"workload":"super-eks"}}',
    })
  })
})
