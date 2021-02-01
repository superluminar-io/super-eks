# super-eks

*super-eks* is a CDK construct that provides a preconfigured EKS installation with batteries included.
You need to provide a Route53 [Hosted zone](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-route53.HostedZone.html) and `super-eks` will take care of the rest.

`super-eks` will install:

- an [EKS cluster](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-eks.Cluster.html)
- [external-dns](https://github.com/kubernetes-sigs/external-dns) for DNS management
- [AWS Load Balancer Controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller) for using Elastic Load balancers as `Ingress`
- ...

## Quick Start

```
import {HostedZone} from '@aws-cdk/aw
import {Cluster} from 'super-eks'

hostedZone = HostedZone.fromLookup(this, 'MyZone', {
  domainName: 'example.com' // Your domain goes here
});

const cluster = new Cluster(this, 'hello-eks', {
  hostedZone: hostedZone,
  version: eks.KubernetesVersion.V1_18,
});
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
