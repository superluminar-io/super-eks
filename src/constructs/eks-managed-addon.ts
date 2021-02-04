import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

export interface EksManagedAddonProps {
  readonly cluster: eks.Cluster;
  readonly addonName: string;
  readonly addonVersion?: string;
  readonly resolveConflicts?: boolean;
  readonly serviceAccountName?: string;
  readonly awsManagedPolicyName?: string;
  readonly namespace?: string;
}

export class EksManagedAddon extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: EksManagedAddonProps) {
    super(scope, id);

    const cluster = props.cluster;
    const namespace = props.namespace || 'kube-system';
    const resolveConflicts = props.resolveConflicts ? 'OVERWRITE' : 'NONE';

    const baseParameters = {
      addonName: props.addonName,
      clusterName: cluster.clusterName,
    };
    const addonVersionParameter = props.addonVersion ? { addonVersion: props.addonVersion } : {};

    let serviceAccountRoleParameter = {};
    let customResourcePassRoleStatement: iam.PolicyStatement[] = [];

    if (props.serviceAccountName) {
      const serviceAccountRole = new iam.Role(this, 'ServiceAccountRole', {
        assumedBy: new iam.OpenIdConnectPrincipal(cluster.openIdConnectProvider).withConditions({
          StringEquals: new cdk.CfnJson(this, 'ServiceAccountRolePrincipalCondition', {
            value: {
              [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:aud`]: 'sts.amazonaws.com',
              [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]: `system:serviceaccount:${namespace}:${props.serviceAccountName}`,
            },
          }),
        }),
      });
      if (props.awsManagedPolicyName) {
        serviceAccountRole.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName(props.awsManagedPolicyName),
        );
      }
      serviceAccountRoleParameter = { serviceAccountRoleArn: serviceAccountRole.roleArn };
      customResourcePassRoleStatement = [new iam.PolicyStatement({
        actions: ['iam:PassRole'],
        resources: [serviceAccountRole.roleArn],
      })];
    }

    const createUpdateParameters = {
      parameters: {
        ...baseParameters,
        ...serviceAccountRoleParameter,
        ...addonVersionParameter,
        resolveConflicts: resolveConflicts,
      },
      physicalResourceId: cr.PhysicalResourceId.of(`${cluster.clusterArn}/${props.addonName}`),
    };

    new cr.AwsCustomResource(this, 'ManagedAddon', {
      onCreate: {
        service: 'EKS',
        action: 'createAddon',
        ...createUpdateParameters,
      },
      onUpdate: {
        service: 'EKS',
        action: 'updateAddon',
        ...createUpdateParameters,
      },
      onDelete: {
        service: 'EKS',
        action: 'deleteAddon',
        parameters: baseParameters,
      },
      policy: {
        statements: [
          new iam.PolicyStatement({
            actions: ['eks:CreateAddon', 'eks:UpdateAddon', 'eks:DeleteAddon'],
            resources: ['*'],
          }),
          ...customResourcePassRoleStatement,
        ],
      },
    });
  }
}

