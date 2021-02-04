import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

const ROUTE53_ZONE_NAME = 'integration.super-eks.superluminar.io';

/**
 * Infrastructure stack holds Route53 zone, kept after testing and reused
 */
export class InfrastructureStack extends cdk.Stack {
  public hostedZone: route53.IHostedZone
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: ROUTE53_ZONE_NAME,
    });
  }
}
