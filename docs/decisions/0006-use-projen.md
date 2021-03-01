# 6. Use Projen

Date: 01/03/2021

## Status

Accepted

## Context

Using Yarn Workspaces as decided in [ADR-0003](./0003-use-yarn-workspaces.md) turned out to be impractical and produced too many problems.

## Decision

We're going to switch to [projen](https://github.com/projen/projen).
Related to that we're going to switch to npm 7 and drop yarn.

## Consequences

Replace all occurences of `yarn` with `npm`.
