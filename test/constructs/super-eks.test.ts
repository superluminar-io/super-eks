import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

import { SuperEks } from '../../src/constructs/super-eks';

test('Empty Cluster', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expectCDK(stack).to(haveResource('Custom::AWSCDK-EKS-Cluster'));
});
