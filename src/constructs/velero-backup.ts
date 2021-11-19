import * as eks from '@aws-cdk/aws-eks';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export interface VeleroBackupProps {
  /**
   * The EKS cluster to install to
   */
  readonly cluster: eks.ICluster;
}

export class VeleroBackup extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: VeleroBackupProps) {
    super(scope, id);

    const namespace = 'backup';

    const backupBucket = new s3.Bucket(this, 'BackupBucket', {});
    const serviceAccount = new eks.ServiceAccount(this, 'ServiceAccount', {
      cluster: props.cluster,
      namespace,
      name: 'velero-backup',
    });
    const chart = new eks.HelmChart(
      this,
      'Resource',
      {
        cluster: props.cluster,
        namespace,
        repository: 'https://vmware-tanzu.github.io/helm-charts',
        chart: 'vmware-tanzu/velero',
        release: '',
        values: {
          initContainers: [
            {
              name: 'velero-plugin-for-aws',
              image: 'velero/velero-plugin-for-aws:v1.3.0',
              imagePullPolicy: 'IfNotPresent',
              volumeMounts: [
                {
                  mountPath: '/target',
                  name: 'plugins',
                },
              ],
            },
          ],
          securityContext: {
            fsGroup: 65534,
          },
          configuration: {
            provider: 'aws',
            backupStorageLocation: {
              name: 'manifests-default',
              bucket: backupBucket.bucketName,
              config: {
                region: cdk.Stack.of(this).region,
              },
            },
            volumeSnapshotLocation: {
              name: 'volume-default',
              config: {
                region: cdk.Stack.of(this).region,
              },
            },
          },
          serviceAccount: {
            server: {
              create: false,
              name: serviceAccount.serviceAccountName,
            },
          },
        },
      },
    );

    backupBucket.grantReadWrite(serviceAccount);
    serviceAccount.addToPrincipalPolicy(new PolicyStatement(
      {
        effect: Effect.ALLOW,
        resources: ['*'],
        actions: [
          'ec2:DescribeVolumes',
          'ec2:DescribeSnapshots',
          'ec2:CreateTags',
          'ec2:CreateVolume',
          'ec2:CreateSnapshot',
          'ec2:DeleteSnapshot',
        ],
      },
    ));

    // Create the namespace
    const namespaceManifest = new eks.KubernetesManifest(this, 'Namespace', {
      cluster: props.cluster,
      manifest: [{
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: namespace,
        },
      }],
    });
    chart.node.addDependency(namespaceManifest);
    serviceAccount.node.addDependency(namespaceManifest);
  }
}
