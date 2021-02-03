# 5. Use namespaces grouped by functionality

Date: 02/02/2021

## Status

Accepted

## Context

When installing manifests or Helm charts you need to pick a namespace.
Often the choice is made in a drive by fashion, leading to inconsistent configuration.

## Decision

We want to install all the shipped components into namespaces grouped by functionality.

For example `external-dns` goes into the namespace `dns`.
`fluent-bit` goes into the namespace `logging`.

## Consequences

There might be other best practices and potential users might want to override the namespaces.
We wait until this comes up again.
