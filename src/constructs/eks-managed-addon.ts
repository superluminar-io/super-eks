import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

export interface EksManagedAddonProps {
  readonly cluster: eks.Cluster;
  readonly addonName: AddonName;
  readonly addonVersion?: AddonVersion;
  readonly resolveConflicts?: boolean;
  readonly serviceAccountName?: ServiceAccountName;
  readonly awsManagedPolicyName?: ManagedPolicyName;
  readonly namespace?: string;
}

export class EksManagedAddon extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: EksManagedAddonProps) {
    super(scope, id);

    const cluster = props.cluster;
    const namespace = props.namespace || 'kube-system';
    const resolveConflicts = props.resolveConflicts ? 'OVERWRITE' : 'NONE';

    const baseParameters = {
      addonName: props.addonName.name,
      clusterName: cluster.clusterName,
    };
    const addonVersionParameter = props.addonVersion ? { addonVersion: props.addonVersion.version } : {};

    let serviceAccountRoleParameter = {};
    let customResourcePassRoleStatement: iam.PolicyStatement[] = [];

    if (props.serviceAccountName) {
      const serviceAccountRole = new iam.Role(this, 'ServiceAccountRole', {
        assumedBy: new iam.OpenIdConnectPrincipal(cluster.openIdConnectProvider).withConditions({
          StringEquals: new cdk.CfnJson(this, 'ServiceAccountRolePrincipalCondition', {
            value: {
              [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:aud`]: 'sts.amazonaws.com',
              [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]: `system:serviceaccount:${namespace}:${props.serviceAccountName.name}`,
            },
          }),
        }),
      });
      if (props.awsManagedPolicyName) {
        serviceAccountRole.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName(props.awsManagedPolicyName.name)
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
      physicalResourceId: cr.PhysicalResourceId.of(`${cluster.clusterArn}/${props.addonName.name}`),
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

export class AddonName {
  /**
   * vpc-cni add-on
   */
  public static readonly VPC_CNI = AddonName.of('vpc-cni');

  /**
   * Custom add-on name
   * @param name custom add-on name
   */
  public static of(name: string) { return new AddonName(name); }

  /**
   *
   * @param name add-on name
   */
  private constructor(public readonly name: string) { }
}

export class ServiceAccountName {
  /**
   * vpc-cni add-on
   */
  public static readonly VPC_CNI = ServiceAccountName.of('aws-node');

  /**
   * Custom service account name
   * @param name custom service account name
   */
  public static of(name: string) { return new ServiceAccountName(name); }

  /**
   *
   * @param name service account name
   */
  private constructor(public readonly name: string) { }
}

export class ManagedPolicyName {
  /**
   * vpc-cni add-on
   */
  public static readonly VPC_CNI = ManagedPolicyName.of('AmazonEKS_CNI_Policy');

  /**
   * Custom managed policy name
   * @param name custom managed policy name
   */
  public static of(name: string) { return new ManagedPolicyName(name); }

  /**
   *
   * @param name managed policy name
   */
  private constructor(public readonly name: string) { }
}

export class AddonVersion {
  /**
   * vpc-cni add-on
   */
  public static readonly VPC_CNI = {
    /**
     * vpc-cni version 1.6.3
     */
    V1_6_3: AddonVersion.of('v1.6.3-eksbuild.1'),

    /**
     * vpc-cni version 1.7.5
     */
    V1_7_5: AddonVersion.of('v1.7.5-eksbuild.1'),

    /**
     * vpc-cni version 1.7.6
     */
    V1_7_6: AddonVersion.of('v1.7.6-eksbuild.1'),

    /**
     * vpc-cni version 1.7.9
     */
    V1_7_9: AddonVersion.of('v1.7.9-eksbuild.1'),
  }

  /**
   * Custom add-on version
   * @param version custom add-on version
   */
  public static of(version: string) { return new AddonVersion(version); }

  /**
   *
   * @param version add-on version
   */
  private constructor(public readonly version: string) { }
}
