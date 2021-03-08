import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

export interface VpcCniAddonProps extends EksManagedAddonProps {
  readonly addonVersion?: VpcCniAddonVersion;
}

interface EksManagedAddonProps {
  readonly cluster: eks.Cluster;
  readonly addonVersion?: AddonVersion;
  readonly resolveConflicts?: boolean;
  readonly namespace?: string;
}

abstract class AddonVersion {
  // @ts-ignore
  static of(version: string) { throw new Error('Implement static method of(version: string)!'); }

  /**
   * @param version add-on version
   */
  protected constructor(public readonly version: string) {}
}

/**
 * vpc-cni add-on versions
 */
export class VpcCniAddonVersion extends AddonVersion {
  /**
   * vpc-cni version 1.6.3
   */
  public static readonly V1_6_3 = VpcCniAddonVersion.of('v1.6.3-eksbuild.1');

  /**
   * vpc-cni version 1.7.5
   */
  public static readonly V1_7_5 = VpcCniAddonVersion.of('v1.7.5-eksbuild.1');

  /**
   * vpc-cni version 1.7.6
   */
  public static readonly V1_7_6 = VpcCniAddonVersion.of('v1.7.6-eksbuild.1');

  /**
   * vpc-cni version 1.7.9
   */
  public static readonly V1_7_9 = VpcCniAddonVersion.of('v1.7.9-eksbuild.1');

  /**
   * Custom add-on version
   * @param version custom add-on version
   */
  public static of(version: string) { return new VpcCniAddonVersion(version); }
}

interface EksManagedAddonAbstractProps {
  readonly cluster: eks.Cluster;
  readonly addonName: string;
  readonly addonVersion?: AddonVersion;
  readonly resolveConflicts?: boolean;
  readonly serviceAccountName?: string;
  readonly awsManagedPolicyName?: string;
  readonly namespace?: string;
}

abstract class EksManagedAddonAbstract extends eks.CfnAddon {
  protected constructor(scope: cdk.Construct, id: string, props: EksManagedAddonAbstractProps) {
    const cluster = props.cluster;
    const namespace = props.namespace || 'kube-system';

    super(scope, id, {
      clusterName: cluster.clusterName,
      addonName: props.addonName,
      addonVersion: props.addonVersion?.version,
      resolveConflicts: props.resolveConflicts ? 'OVERWRITE' : 'NONE',
    });

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

      this.serviceAccountRoleArn = serviceAccountRole.roleArn;
    }
  }
}

export class VpcCniAddon extends EksManagedAddonAbstract {
  constructor(scope: cdk.Construct, id: string, props: VpcCniAddonProps) {
    super(scope, id, {
      ...props,
      addonName: 'vpc-cni',
      serviceAccountName: 'aws-node',
      awsManagedPolicyName: 'AmazonEKS_CNI_Policy',
    });
  }
}
