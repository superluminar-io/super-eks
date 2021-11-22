import * as eks from '@aws-cdk/aws-eks';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import cron from 'cron-validate';


export interface BackupSchedule {
  /**
   * Labels for the schedule
   *
   * default: none
   */
  readonly labels?: {[key: string]: string};
  /**
   * Annotations for the schedule
   *
   * default: none
   */
  readonly annotations?: {[key: string]: string};
  /**
   * Schedule when to run
   */
  readonly schedule: string;

  /**
   * template for the schedule
   *
   * default: velero default values
   */
  readonly template?: {[key: string]: string};
}

export interface InternalVeleroBackupProps extends VeleroBackupProps {
  /**
   * The EKS cluster to install to
   */
  readonly cluster: eks.ICluster;
}

export interface VeleroBackupProps {
  /**
   * Set the namespace where velero should be deployed
   */
  readonly namespace?: string;

  /**
   * If set to true, backup of volumes are diabled
   */
  readonly disableVolumeBackups?: boolean;

  /**
   * Set up a schedule and options when to run the backups
   *
   * default: disabled
   */
  readonly schedule?: {[name: string]: BackupSchedule};
}

export class VeleroBackup extends cdk.Construct {
  veleroBackup: eks.HelmChart;

  constructor(scope: cdk.Construct, id: string, props: InternalVeleroBackupProps) {
    super(scope, id);

    const namespace = props.namespace ?? 'backup';

    const backupBucket = new s3.Bucket(this, 'BackupBucket', {});
    const serviceAccount = new eks.ServiceAccount(this, 'ServiceAccount', {
      cluster: props.cluster,
      namespace,
      name: 'velero-backup',
    });


    const volumeSnapshotLocation = props.disableVolumeBackups !== true ? {
      name: 'volumes',
      config: {
        region: cdk.Stack.of(this).region,
      },
    }: undefined;

    const schedule = createVeleroSchedule(props.schedule);

    this.veleroBackup = new eks.HelmChart(
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
    this.veleroBackup.node.addDependency(serviceAccount);
    this.veleroBackup.node.addDependency(namespaceManifest);
    serviceAccount.node.addDependency(namespaceManifest);
  }
}

function createVeleroSchedule(schedules: {[name: string]: BackupSchedule} | undefined) {
  if (!schedules) {
    return undefined;
  }
  const result = Object.entries(schedules).map(
    ([name, props]: [string, BackupSchedule]) => {
      const validation = cron(props.schedule);
      if (!validation.isValid()) {
        throw new Error(`Schedule '${name}' does not have a valid cron expression ${validation.getError()}`);
      }
      const schedule: {[key: string]: any} = {
        disabled: false,
        schedule: props.schedule,
      };
      if (props.annotations) {
        schedule.annotations = props.annotations;
      }
      if (props.labels) {
        schedule.labels = props.labels;
      }
      if (props.template) {
        schedule.template = props.template;
      }
      return [name, schedule];
    });
  return Object.fromEntries(result);
}
