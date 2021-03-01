# integration-tests

These are the integration tests.

They are made up of two CDK stacks:

- the [infra](lib/infrastructure-stack.ts) stack, provides infra across multiple test runs
- the [integration test](lib/integration-tests-stack.ts) stack, exercises the `SuperEks` construct

You can run them with the snippet below, make sure to have valid AWS credentials configured:

```bash
npm run integration-tests
```

