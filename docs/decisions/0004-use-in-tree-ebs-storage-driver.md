# 4. Use in-tree EBS storage driver

Date: 02/02/2021

## Status

Accepted

## Context

We need to decide which storage driver(s) we want to provision by default.

## Decision

For now we're going with the intree EBS provisioner. If the need arises we're going to add the EBS or EFS CSI Driver, but we're speculating that they are going to be available as managed addons at some point.

## Consequences

We might have to switch the storage driver in the future when the in-tree providers are deprecated/removed.
