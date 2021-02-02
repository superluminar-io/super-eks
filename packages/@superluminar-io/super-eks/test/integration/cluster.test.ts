// import { expect as expectCDK, matchTemplate, MatchStyle } from "@aws-cdk/assert"
// import * as cdk from "@aws-cdk/core"
import { execSync } from "child_process"

beforeAll(() => {
  execSync("npx cdk deploy --require-approval never", {
    cwd: __dirname,
    encoding: "utf8",
    stdio: "inherit",
  })
  // console.log(out)
})

afterAll(() => {
  execSync("npx cdk destroy", {
    cwd: __dirname,
    encoding: "utf8",
    stdio: "inherit",
  })
  // console.log(out)
})

test("Empty Stack", () => {
  fail
})
