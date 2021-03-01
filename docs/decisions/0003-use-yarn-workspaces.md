# 3. Use yarn workspaces

Date: 01/02/2021

## Status

Superseeded by [ADR-0006](./0006-use-projen.md)

## Context

We need to organize our code. We also want to run integration tests, and code examples that use the code as a 3rd party library.

## Decision

We want a monorepo style setup and settle for yarn workspaces. Lerna seems to complicated at the moment.

## Consequences

We might need to add another tool, if it becomes unmanageable.
