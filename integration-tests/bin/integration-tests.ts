#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "@aws-cdk/core"
import { IntegrationTestsStack } from "../lib/integration-tests-stack"
import { InfrastructureStack } from "../lib/infrastructure-stack"

const app = new cdk.App()
const infrastructureStack = new InfrastructureStack(app, "InfrastructureStack")
new IntegrationTestsStack(app, "IntegrationTestsStack", {
  hostedZone: infrastructureStack.hostedZone,
})
