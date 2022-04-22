import { App, Stack, aws_route53 as route53, assertions } from 'aws-cdk-lib';

import { SuperEks } from '../../src/constructs/super-eks';

test('Empty Cluster', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('Custom::AWSCDK-EKS-Cluster', {});
});

test('It installs managed VPC CNI Addon', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('AWS::EKS::Addon', {
    AddonName: 'vpc-cni',
    ResolveConflicts: 'NONE',
  });

  // Default NodeGroup can be found by specifying abscense of `NodegroupName`

  template.hasResource('AWS::EKS::Nodegroup', {
    Properties: { NodegroupName: assertions.Match.absent() },
    DependsOn: assertions.Match.arrayWith([assertions.Match.stringLikeRegexp('.*VpcCniAddon.*')]),
  });

  template.hasResource('AWS::EKS::Nodegroup', {
    Properties: { NodegroupName: 'super-eks' },
    DependsOn: assertions.Match.arrayWith([assertions.Match.stringLikeRegexp('.*VpcCniAddon.*')]),
  });
});

test('It installs fluent-bit', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'logging',
    Chart: 'aws-for-fluent-bit',
  });
});

test('It installs aws-load-balancer-controller', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'ingress',
    Chart: 'aws-load-balancer-controller',
  });
});

test('It installs external-dns', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'dns',
    Chart: 'external-dns',
  });
});

test('It hardens all Nodes', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyName: assertions.Match.stringLikeRegexp('.*NodeHardeningPolicy.*'),
    Roles: assertions.Match.arrayWith([
      assertions.Match.objectLike({
        Ref: assertions.Match.stringLikeRegexp('.*NodegroupDefaultCapacityNodeGroupRole.*'),
      }),
    ]),
  });
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyName: assertions.Match.stringLikeRegexp('.*NodeHardeningPolicy.*'),
    Roles: assertions.Match.arrayWith([
      assertions.Match.objectLike({
        Ref: assertions.Match.stringLikeRegexp('.*NodegroupInternalNodegroupNodeGroupRole.*'),
      }),
    ]),
  });
});

test('It taints super-eks Nodes', () => {
  const app = new App({ outdir: 'cdk.out', stackTraces: false });
  const stack = new Stack(app, 'Stack', {
    env: { region: 'eu-central-1', account: '1234567891011' },
  });
  // WHEN
  new SuperEks(stack, 'TestCluster', {
    hostedZone: route53.HostedZone.fromHostedZoneId(stack, 'HostedZone', '123'),
  });
  const template = assertions.Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: assertions.Match.objectLike({
      UserData: {
        'Fn::Base64': {
          'Fn::Join': [
            '',
            assertions.Match.arrayWith([
              'Content-Type: multipart/mixed; boundary="+AWS+CDK+User+Data+Separator=="\nMIME-Version: 1.0\n\n--+AWS+CDK+User+Data+Separator==\nContent-Type: text/x-shellscript; charset="utf-8"\nContent-Transfer-Encoding: base64\n\n',
              assertions.Match.objectLike({
                'Fn::Base64':
                  "#!/bin/bash\nsed -i '/^KUBELET_EXTRA_ARGS=/a KUBELET_EXTRA_ARGS+=\" --register-with-taints=workload=super-eks:NoSchedule\"' /etc/eks/bootstrap.sh",
              }),
            ]),
          ],
        },
      },
    }),
  });

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    NodegroupName: 'super-eks',
    LaunchTemplate: {
      Id: { Ref: assertions.Match.stringLikeRegexp('.*InternalNodegroupLaunchTemplate.*') },
    },
  });
});
