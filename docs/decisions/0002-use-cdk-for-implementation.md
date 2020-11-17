# 2. Use CDK for implementation

Date: 17/11/2020

## Status

Accepted

## Context

Building the installer requires choosing an appropriate infrastructure as code tool that allows configuring AWS EKS.

## Decision

We can either use vanilla CloudFormation, Terraform or CDK.

We choose CDK. CDK seems like having the most traction right now, it's easy to develop with.

## Consequences

We might hit points where we will have to work around some of CDK's features.
