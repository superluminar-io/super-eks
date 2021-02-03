import { execSync } from "child_process"
import {
  ChangeResourceRecordSetsCommand,
  ListHostedZonesByNameCommand,
  ListResourceRecordSetsCommand,
  ResourceRecordSet,
  Route53Client,
} from "@aws-sdk/client-route-53"

beforeAll(async () => {
  await purgeDNSRecords()
  execSync("yarn run cdk deploy --require-approval never --all", {
    encoding: "utf8",
    stdio: "inherit",
  })
})

afterAll(() => {
  execSync("yarn cdk destroy --require-approval never IntegrationTestStacks", {
    encoding: "utf8",
    stdio: "inherit",
  })
})

// Purge all DNS records that aren't SOA or NS records
async function purgeDNSRecords() {
  const route53 = new Route53Client({})
  const zones = await route53.send(
    new ListHostedZonesByNameCommand({
      DNSName: "integration.super-eks.superluminar.io",
    })
  )
  if (zones.HostedZones) {
    const zoneId = zones.HostedZones[0].Id
    const records = await route53.send(
      new ListResourceRecordSetsCommand({
        HostedZoneId: zoneId,
      })
    )
    const filtered = records.ResourceRecordSets?.filter(
      (r) => r.Type != "SOA" && r.Type != "NS"
    )
    if (filtered !== undefined && filtered.length > 0) {
      const changes = filtered.map((r) => {
        return { Action: "DELETE", ResourceRecordSet: r }
      })
      console.log("Deleting DNS records", changes)
      await route53.send(
        new ChangeResourceRecordSetsCommand({
          ChangeBatch: {
            Changes: changes,
          },
          HostedZoneId: zoneId,
        })
      )
    }
  }
}

async function fetchDNSRecords(): Promise<ResourceRecordSet[]> {
  const route53 = new Route53Client({})
  const zones = await route53.send(
    new ListHostedZonesByNameCommand({
      DNSName: "integration.super-eks.superluminar.io",
    })
  )
  if (zones.HostedZones) {
    const zoneId = zones.HostedZones[0].Id
    const records = await route53.send(
      new ListResourceRecordSetsCommand({
        HostedZoneId: zoneId,
      })
    )
    return records.ResourceRecordSets ?? []
  }
  throw new Error("No records found")
}

describe("super-eks w/ nginx deployment", () => {
  test("DNS works", async () => {
    const records = await fetchDNSRecords()
    const result = records.filter((r) => {
      return (
        r.Name == "nginx.integration.super-eks.superluminar.io." &&
        r.Type == "A"
      )
    })
    expect(result).toHaveLength(1)
  })

  test("Ingress/ALB works", async () => {
    const records = await fetchDNSRecords()
    const result = records.filter((r) => {
      return (
        r.Name == "nginx.integration.super-eks.superluminar.io." &&
        r.Type == "A"
      )
    })
    expect(result[0].AliasTarget?.DNSName).toContain(
      "eu-central-1.elb.amazonaws.com"
    )
  })
})
