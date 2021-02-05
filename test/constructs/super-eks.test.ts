import '@aws-cdk/assert/jest';
import { ABSENT, arrayWith, ResourcePart, stringLike } from '@aws-cdk/assert';
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
  expect(stack).toHaveResource('Custom::AWSCDK-EKS-Cluster');
});

test('It installs managed VPC CNI Addon', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expect(stack).toHaveResourceLike('Custom::AWS', {
    Create: {
      service: 'EKS',
      action: 'createAddon',
      parameters: {
        addonName: 'vpc-cni',
      },
    },
  });

  // Default NodeGroup can be found by specifying abscense of `NodegroupName`

  expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
    Properties: { NodegroupName: ABSENT },
    DependsOn: arrayWith(stringLike('*VpcCniAddonManagedAddon*')),
  }, ResourcePart.CompleteDefinition);

  expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
    Properties: { NodegroupName: 'super-eks' },
    DependsOn: arrayWith(stringLike('*VpcCniAddonManagedAddon*')),
  }, ResourcePart.CompleteDefinition);
});

test('It installs fluent-bit', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'logging',
    Chart: 'aws-for-fluent-bit',
  });
});

test('It installs aws-load-balancer-controller', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'ingress',
    Chart: 'aws-load-balancer-controller',
  });
});

test('It installs external-dns', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'dns',
    Chart: 'external-dns',
  });
});
