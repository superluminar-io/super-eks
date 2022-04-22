#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import { IntegrationTestsStack } from '../lib/integration-tests-stack';

const app = new App();
new IntegrationTestsStack(app, 'IntegrationTestsStack');
