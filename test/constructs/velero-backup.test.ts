import { arrayWith, objectLike, stringLike } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import * as eks from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
import { VeleroBackup } from '../../src/constructs/velero-backup';

describe('velero-backup', () => {
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

  test('Chart is configured correctly', () => {
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
            '{"initContainers":[{"name":"velero-plugin-for-aws","image":"velero/velero-plugin-for-aws:v1.3.0","imagePullPolicy":"IfNotPresent","volumeMounts":[{"mountPath":"/target","name":"plugins"}]}],"securityContext":{"fsGroup":65534},"configuration":{"provider":"aws","backupStorageLocation":{"name":"manifests-default","bucket":"',
            stringLike('*"serviceAccount":{"server":{"create":false,"name":"velero-backup"*'),
          ),
        ],
      }),
    });
  });
});

