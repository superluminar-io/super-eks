import "@aws-cdk/assert/jest"
import { Stack } from "@aws-cdk/core"
import { Cluster } from "@aws-cdk/aws-eks"
import * as eks from "@aws-cdk/aws-eks"
import { ExternalDNS } from "~/constructs/external-dns"

describe("external-dns", () => {
  test("namespace can be configured and created", () => {
    const stack = new Stack()
    const cluster = new Cluster(stack, "EKS", {
      version: eks.KubernetesVersion.V1_18,
    })
    new ExternalDNS(stack, "ALB", {
      cluster,
      hostedZoneIds: ["Z1PA6795UKMFR9"],
      namespace: "foo",
      createNamespace: true,
    })
    expect(stack).toHaveResource("Custom::AWSCDK-EKS-HelmChart", {
      Namespace: "foo",
      CreateNamespace: true,
    })
  })

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
  })

  test("Hosted zone ID filter is set on Helm chart", () => {
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
        '{"zoneIdFilters":["Z1PA6795UKMFR9"],"serviceAccount":{"create":false,"name":"external-dns"}}',
    })
  })
})
