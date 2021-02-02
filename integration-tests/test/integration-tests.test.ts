import { execSync } from "child_process"
import {
  ListHostedZonesByNameCommand,
  ListResourceRecordSetsCommand, ResourceRecordSet,
  Route53Client,
} from "@aws-sdk/client-route-53"

beforeAll(() => {
  execSync("yarn run cdk deploy --require-approval never", {
    encoding: "utf8",
    stdio: "inherit",
  })
})

afterAll(() => {
  execSync("yarn cdk destroy", {
    encoding: "utf8",
    stdio: "inherit",
  })
})

describe("super-eks w/ nginx deployment", () => {
  test("DNS works", async () => {
    const route53 = new Route53Client({})
    const zones = await route53.send(
      new ListHostedZonesByNameCommand({
        DNSName: "integration.super-eks.superluminar.io",
      })
    )
    let result: ResourceRecordSet[] = []
    if (zones.HostedZones) {
      const zoneId = zones.HostedZones[0].Id
      const records = await route53.send(
        new ListResourceRecordSetsCommand({
          HostedZoneId: zoneId,
        })
      )
      if (records.ResourceRecordSets) {
        result = records.ResourceRecordSets.filter((r) => {
          return r.Name == "nginx.integration.super-eks.superluminar.io." && r.Type == 'A'
        })
      }
    }
    expect(result).toHaveLength(1);
  })

  test("Ingress/ALB works", async () => {
    const route53 = new Route53Client({})
    const zones = await route53.send(
        new ListHostedZonesByNameCommand({
          DNSName: "integration.super-eks.superluminar.io",
        })
    )
    let result: ResourceRecordSet[] = []
    if (zones.HostedZones) {
      const zoneId = zones.HostedZones[0].Id
      const records = await route53.send(
          new ListResourceRecordSetsCommand({
            HostedZoneId: zoneId,
          })
      )
      if (records.ResourceRecordSets) {
        result = records.ResourceRecordSets.filter((r) => {
          return r.Name == "nginx.integration.super-eks.superluminar.io." && r.Type == 'A'
        })
      }
    }
    expect(result[0].AliasTarget?.DNSName).toContain("eu-central-1.elb.amazonaws.com")
  })
})
