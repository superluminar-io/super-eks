import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import { InternalNodegroup } from '../config/cluster';

export interface ExternalDNSProps {
  /**
   * The EKS cluster to install to
   */
  readonly cluster: eks.ICluster;
  /**
   * List of hosted zone IDs, used for IAM permissions and filtering
   */
  readonly hostedZoneIds: string[];
}

export class ExternalDNS extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ExternalDNSProps) {
    super(scope, id);

    // Define the namespace we want to install to
    const namespace = 'dns';

    // Create service account
    const serviceAccount = new eks.ServiceAccount(this, 'ServiceAccount', {
      cluster: props.cluster,
      name: 'external-dns',
      namespace: namespace,
    });

    // Add IAM policy according to https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md
    props.hostedZoneIds.forEach((hostedZoneId) =>
      serviceAccount.addToPrincipalPolicy(
        new iam.PolicyStatement({
          actions: [
            'route53:ChangeResourceRecordSets',
            'route53:ListResourceRecordSets',
          ],
          resources: [`arn:aws:route53:::hostedzone/${hostedZoneId}`],
        }),
      ),
    );
    serviceAccount.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['route53:ListHostedZones'],
        resources: ['*'],
      }),
    );

    // Install controller via Helm
    const chart = new eks.HelmChart(this, 'Resource', {
      cluster: props.cluster,
      namespace: namespace,
      repository: 'https://charts.bitnami.com/bitnami',
      chart: 'external-dns',
      release: 'external-dns',
      version: '4.6.0',
      values: {
        zoneIdFilters: props.hostedZoneIds,
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccountName,
        },
        tolerations: [InternalNodegroup.taint],
        nodeSelector: InternalNodegroup.labels,
      },
    });

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
