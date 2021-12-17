import * as eks from '@aws-cdk/aws-eks';
import { ISecret } from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';


export interface ExternalSecretProps {

  /**
   * The cluster to install external secrets to
   */
  readonly cluster: eks.ICluster;

  /**
   * The namespace to which the secret should be made available
   */
  readonly namespace: string;

  /**
   * The secret to make available
   */
  readonly secret: ISecret;

  /**
   * If true, the secret will be assumed to be in JSON format and parsed.
   * Each JSON property is then made available in the secret with their own property name
   *
   * @default: false
   */
  readonly isJson: boolean;

  /**
   * The name of the secret in kubernetes
   *
   * @default: the name of the secret in secrets manager
   */
  readonly k8sSecretName?: string;
}

export class ExternalSecret extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ExternalSecretProps) {
    super(scope, id);

    new eks.KubernetesManifest(this, 'Secret', {
      cluster: props.cluster,
      manifest: [{
        apiVersion: 'v1',
        kind: 'ExternalSecret',

        metadata: {
          name: props.k8sSecretName,
          namespace: props.namespace,
        },
        spec: {
          backendType: 'secretsManager',
          data: [
            {
              key: props.secret.secretName,
              name: props.k8sSecretName,
            },
          ],
        },
      }],
    });
  }


}

