#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { IntegrationTestsStack } from '../lib/integration-tests-stack';

const app = new cdk.App();
new IntegrationTestsStack(app, 'IntegrationTestsStack');
