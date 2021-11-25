import { arrayWith, objectLike, stringLike } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
import * as s3 from '@aws-cdk/aws-s3';
import { Stack } from '@aws-cdk/core';
import { VeleroBackup } from '../../src/constructs/velero-backup';

describe('default configuration', () => {
  test('namespace is "backup"', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: 'backup',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        '[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"backup","labels":{"aws.cdk.eks/prune-c89fadb6af4bc58b0c22456b049e49a28d0fedd3e0":""}}}]',
    });
  });

  test('chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
    });

    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            '{"initContainers":[{"name":"velero-plugin-for-aws","image":"velero/velero-plugin-for-aws:v1.3.0","imagePullPolicy":"IfNotPresent","volumeMounts":[{"mountPath":"/target","name":"plugins"}]}],"securityContext":{"fsGroup":65534},"configuration":{"provider":"aws","backupStorageLocation":{"bucket":"',
            stringLike('*"serviceAccount":{"server":{"create":false,"name":"velero-backup"*'),
            stringLike('"}}},"serviceAccount":{"server":{"create":false,"name":"velero-backup"}},"schedule":{"default":{"schedule":"0 0 * * *","disabled":false,"template":{"ttl":"720h","labelSelector":{"matchLabels":{"backup":"enabled"}}},"snapshotVolumes":false}}}'),
          ),
        ],
      }),
    });
    expect(stack).not.toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"volumeSnapshotLocation":*'),
          ),
        ],
      }),
    });
    expect(stack).toHaveResource('AWS::S3::Bucket', {});
  });
});

describe('configured', () => {
  test('chart is configured correctly with default values', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      enableVolumeBackups: true,
    });

    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"volumeSnapshotLocation":*'),
          ),
        ],
      }),
    });
    expect(stack).toHaveResource('AWS::S3::Bucket', {});
  });

  test('chart is configured correctly with bucket', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      bucket: s3.Bucket.fromBucketName(stack, 'Bucket', 'bucket-name'),
    });

    expect(stack).not.toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"volumeSnapshotLocation":*'),
          ),
        ],
      }),
    });
    expect(stack).not.toHaveResource('AWS::S3::Bucket', {});
  });
});

describe('schedule', () => {
  test('custom schedule config', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      schedule: '0 1 * * *',
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"schedule":{"default":{"schedule":"0 1 * * *","disabled":false,"template":{"ttl":"720h","labelSelector":{"matchLabels":{"backup":"enabled"}}}*'),
          ),
        ],
      }),
    });
  });

  test('default schedule config', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"schedule":{"default":{"schedule":"0 0 * * *","disabled":false,"template":{"ttl":"720h","labelSelector":{"matchLabels":{"backup":"enabled"}}}*'),
          ),
        ],
      }),
    });
  });

  test('fails with invalid cron', () => {
    expect(() => {
      const stack = new Stack();
      const cluster = new eks.Cluster(stack, 'EKS', {
        version: eks.KubernetesVersion.V1_18,
      });
      new VeleroBackup(stack, 'Backup', {
        cluster,
        enableVolumeBackups: true,
        schedule: 'invalid',
      });
    },
    ).toThrowError();
  });
});
