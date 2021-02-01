import { expect as expectCDK, matchTemplate, MatchStyle } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import * as SuperEks from "../lib/super-eks-stack"

test("Empty Stack", () => {
  const app = new cdk.App()
  // WHEN
  const stack = new SuperEks.SuperEksStack(app, "MyTestStack")
  // THEN
  expectCDK(stack).to(matchTemplate({ Resources: {} }, MatchStyle.EXACT))
})
