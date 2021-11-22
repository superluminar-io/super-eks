import '@aws-cdk/assert/jest';
import { arrayWith, objectLike, stringLike, ResourcePart, ABSENT } from '@aws-cdk/assert';
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
  expect(stack).toHaveResourceLike('AWS::EKS::Addon', {
    AddonName: 'vpc-cni',
    ResolveConflicts: 'NONE',
  });

  // Default NodeGroup can be found by specifying abscense of `NodegroupName`

  expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
    Properties: { NodegroupName: ABSENT },
    DependsOn: arrayWith(stringLike('*VpcCniAddon*')),
  }, ResourcePart.CompleteDefinition);

  expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
    Properties: { NodegroupName: 'super-eks' },
    DependsOn: arrayWith(stringLike('*VpcCniAddon*')),
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

test('It hardens all Nodes', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyName: stringLike('*NodeHardeningPolicy*'),
    Roles: arrayWith(
      objectLike( { Ref: stringLike('*NodegroupDefaultCapacityNodeGroupRole*') }),
      objectLike( { Ref: stringLike('*NodegroupInternalNodegroupNodeGroupRole*') }),
    ),
  });
});

test('It taints super-eks Nodes', () => {
  const app = new cdk.App({ outdir: 'cdk.out', stackTraces: false });
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });

  // THEN
  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: objectLike({
      UserData: {
        'Fn::Base64': {
          'Fn::Join': ['', arrayWith(
            'Content-Type: multipart/mixed; boundary="+AWS+CDK+User+Data+Separator=="\nMIME-Version: 1.0\n\n--+AWS+CDK+User+Data+Separator==\nContent-Type: text/x-shellscript; charset="utf-8"\nContent-Transfer-Encoding: base64\n\n',
            objectLike({
              'Fn::Base64': '#!/bin/bash\nsed -i \'/^KUBELET_EXTRA_ARGS=/a KUBELET_EXTRA_ARGS+=\" --register-with-taints=workload=super-eks:NoSchedule\"\' /etc/eks/bootstrap.sh',
            }))],
        },
      },
    }),
  });

  expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
    NodegroupName: 'super-eks',
    LaunchTemplate: {
      Id: { Ref: stringLike('*InternalNodegroupLaunchTemplate*') },
    },
  });
});

test('It installs backup if requested', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
    backupProps: {},
  });

  // THEN
  expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'backup',
    Chart: 'velero',
  });
});
