import { expect as expectCDK, haveResource } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { EksCluster } from "../../lib/constructs/eks-cluster"

test("Empty Cluster", () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, "Stack", {
    env: { region: "eu-central-1", account: "1234567891011" },
  })
  // WHEN
  new EksCluster(stack, "TestCluster", { vpcId: "test" })
  // THEN
  expectCDK(stack).to(haveResource("Custom::AWSCDK-EKS-Cluster"))
})
