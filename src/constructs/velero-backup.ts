import * as eks from '@aws-cdk/aws-eks';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import { IBucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import cron from 'cron-validate';


/*
 * Properties for velero backup used internally when super eks is set up.
 *
 * Can also be used for every other EKS setup.
 */
export interface VeleroBackupPropsWithCluster {
  /**
   * The EKS cluster to install to
   */
  readonly cluster: eks.ICluster;

  /**
   * If set to true, backup of volumes are enabled
   *
   * @default false
   */
  readonly enableVolumeBackups?: boolean;

  /**
   * Set up a schedule and options when to run the backups
   *
   * @default every day at midnight ('0 0 * * *')
   */
  readonly schedule?: string;

  /**
   * If provided, this bucket is used for backups.
   *
   * @default a bucket will be created
   */
  readonly bucket?: IBucket;
}

export class VeleroBackup extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: VeleroBackupPropsWithCluster) {
    super(scope, id);

    const namespace = 'backup';

    const backupBucket = props.bucket ? props.bucket : new s3.Bucket(this, 'BackupBucket', {});
    const serviceAccount = new eks.ServiceAccount(this, 'ServiceAccount', {
      cluster: props.cluster,
      namespace,
      name: 'velero-backup',
    });


    const volumeSnapshotLocation = props.enableVolumeBackups == true ? {
      name: 'volumes',
      config: {
        region: cdk.Stack.of(this).region,
      },
    }: undefined;

    const schedule = createVeleroSchedule(props.schedule, props.enableVolumeBackups);

    const chart = new eks.HelmChart(
      this,
      'Resource',
      {
        cluster: props.cluster,
        namespace,
        repository: 'https://vmware-tanzu.github.io/helm-charts',
        chart: 'velero',
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
              bucket: backupBucket.bucketName,
              config: {
                region: cdk.Stack.of(this).region,
              },
            },
            volumeSnapshotLocation,
          },
          serviceAccount: {
            server: {
              create: false,
              name: serviceAccount.serviceAccountName,
            },
          },
          schedule,
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
    chart.node.addDependency(serviceAccount);
    chart.node.addDependency(namespaceManifest);
    serviceAccount.node.addDependency(namespaceManifest);
  }
}

function createVeleroSchedule(schedule?: string, enableVolumeBackups?: boolean) {
  if (schedule && !cron(schedule).isValid()) {
    throw new Error(`invalid cron expression provided ${cron(schedule).getError()}`);
  }
  const cronSchedule = schedule ? schedule : '0 0 * * *';
  const volumeSettings = enableVolumeBackups?{
    storageLocation: 'volumes',
    volumeSnapshotLocations: [
      'default',
    ],
  }: {};

  return {
    default: {
      schedule: cronSchedule,
      disabled: false,
      template: {
        ttl: '720h',
        labelSelector: {
          matchLabels: {
            backup: 'enabled',
          },
        },
      },
      snapshotVolumes: enableVolumeBackups ? true : false,
      ...volumeSettings,
    },
  };
}
