import { arrayWith, objectLike, stringLike } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
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
            stringLike('*"volumeSnapshotLocation":*'),
          ),
        ],
      }),
    });
  });
});

describe('configured', () => {
  test('namespace is "backup"', () => {
    const expectedNamespace = 'test-namespace';
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      kubernetesNamespace: expectedNamespace,
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Namespace: expectedNamespace,
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest:
        `[{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"${expectedNamespace}","labels":{"aws.cdk.eks/prune-c89fadb6af4bc58b0c22456b049e49a28d0fedd3e0":""}}}]`,
    });
  });

  test('chart is configured correctly', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      disableVolumeBackups: true,
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
  });
});

describe('schedule', () => {
  test('simple schedule config', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      disableVolumeBackups: true,
      schedule: {
        default: {
          schedule: '0 0 * * *',
        },
      },
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"schedule":{"default":{"disabled":false,"schedule":"0 0 * * *"}}*'),
          ),
        ],
      }),
    });
  });

  test('simple schedule config', () => {
    const stack = new Stack();
    const cluster = new eks.Cluster(stack, 'EKS', {
      version: eks.KubernetesVersion.V1_18,
    });
    new VeleroBackup(stack, 'Backup', {
      cluster,
      disableVolumeBackups: true,
      schedule: {
        default: {
          schedule: '0 0 * * *',
          annotations: {
            annotation: 'test-annotation',
          },
          labels: {
            label: 'test-label',
          },
          template: {
            ttl: '240h',
          },
        },
      },
    });
    expect(stack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
      Values: objectLike({
        'Fn::Join': [
          '',
          arrayWith(
            stringLike('*"schedule":{"default":{"disabled":false,"schedule":"0 0 * * *","annotations":{"annotation":"test-annotation"},"labels":{"label":"test-label"},"template":{"ttl":"240h"}}}*'),
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
        disableVolumeBackups: true,
        schedule: {
          default: {
            schedule: 'invalid',
          },
        },
      });
    },
    ).toThrowError();
  });
});
