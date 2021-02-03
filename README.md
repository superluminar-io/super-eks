# super-eks

__super-eks__ is a [CDK]((github.com/aws-cdk/cdk)) construct that provides a preconfigured [EKS](https://aws.amazon.com/eks/) installation with batteries included.
Even when using best practices for your EKS cluster, picking the right setup can be overwhelming. 
__super-eks__ solves this problem by making a few choices for you as outlined below:

- :white_check_mark: DNS management with [external-dns](https://github.com/kubernetes-sigs/external-dns)
- :white_check_mark: Forwarding logs to CloudWatch Logs with [fluent-bit](https://github.com/aws/aws-for-fluent-bit)
- :white_check_mark: Ingress management with the [AWS Load Balancer Controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller)
- :white_check_mark: Isolated node groups for your workloads
- :construction: Hardened node setup
- :construction: Monitoring with Prometheus and CloudWatch
- :construction: Backup solution for cluster recovery
- :construction: Authentication/authorization for workloads with Amazon Cognito


## Quick Start

You need to provide a Route53 [Hosted zone](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-route53.HostedZone.html) and __super-eks__ will take care of the rest.


```typescript
import {HostedZone} from '@aws-cdk/aws-route53'
import {SuperEks} from 'super-eks'

hostedZone = HostedZone.fromLookup(this, 'MyZone', {
  domainName: 'example.com' // Your domain goes here
});

const cluster = new SuperEks(this, 'hello-eks', {
  hostedZone: hostedZone,
});
```

## Development

- We use [architecture decision records](https://github.com/joelparkerhenderson/architecture_decision_record/blob/master/adr_template_by_michael_nygard.md). See [here](docs/decisions) for the decisions made so far.
- We use the [AWS Cloud Development Kit (CDK)](github.com/aws-cdk/cdk)

