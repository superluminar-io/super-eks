# super-eks

__super-eks__ is a [CDK]((github.com/aws-cdk/cdk)) construct that provides a preconfigured [EKS](https://aws.amazon.com/eks/) installation with batteries included.
Even when using best practices for your EKS cluster, picking the right setup can be overwhelming. 
__super-eks__ solves this problem by making a few choices for you as outlined below.

### Features

- :white_check_mark: DNS management with [external-dns](https://github.com/kubernetes-sigs/external-dns)
- :white_check_mark: Forwarding logs to CloudWatch Logs with [fluent-bit](https://github.com/aws/aws-for-fluent-bit)
- :white_check_mark: Ingress management with the [AWS Load Balancer Controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller)
- :white_check_mark: Isolated node groups for your workloads

### Roadmap

- :hammer_and_wrench: Hardened node setup
- :hammer_and_wrench: Monitoring with Prometheus and CloudWatch
- :hammer_and_wrench: Backup solution for cluster recovery
- :hammer_and_wrench: Authentication/authorization for workloads with Amazon Cognito

## Quick Start

The quick start shows you how to setup a __super-eks__ cluster.

*Prerequisites*

- A working [`aws`](https://aws.amazon.com/cli/) CLI installation with access to an account and administrator privileges
- You'll need a recent [NodeJS](https://nodejs.org) installation
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) to interact with your fresh cluster
- An editor of your choice
- Roughly 30 minutes of your time and a :coffee:, :tea: or :beverage_box:


To get going you'll need a CDK project. For details please refer to the [detailed guide for CDK](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html).

Create an empty directory on your system.

```
mkdir super-eks-setup && cd super-eks-setup 
```

Bootstrap your CDK project, we will use TypeScript, but you can switch to any other supported language.

```
npx cdk init sample-app --language typescript
```

Now install the __super-eks__ library.

```
npm @superluminar-io/super-eks
```

You need to provide a Route53 [Hosted zone](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-route53.HostedZone.html) and __super-eks__ will take care of the rest.
Paste the snippet into `lib/super-eks-setup-stack.ts`.

```typescript
import {HostedZone} from '@aws-cdk/aws-route53'
import {SuperEks} from '@superluminar-io/super-eks'

export class SuperEksSetupStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Assumes you already have a Route53 zone in your account
        hostedZone = HostedZone.fromLookup(this, 'MyZone', {
            domainName: 'example.com' // Your domain goes here
        });

        // Setup super-eks, EKS w/ batteries included
        const cluster = new SuperEks(this, 'hello-eks', {
            hostedZone: hostedZone,
        });

        // Add nginx installation for testing
        superEks.cluster.addHelmChart("nginx", {
            createNamespace: true,
            namespace: "nginx",
            repository: "https://charts.bitnami.com/bitnami",
            chart: "nginx",
            release: "nginx",
            version: "8.5.2",
            values: {
                ingress: {
                    enabled: true,
                    hostname: `nginx.${hostedZone.zoneName}`,
                    annotations: {
                        "kubernetes.io/ingress.class": "alb",
                        "alb.ingress.kubernetes.io/scheme": "internet-facing",
                        "alb.ingress.kubernetes.io/target-type": "ip",
                    },
                },
            },
        })
    }
}
```

Now deploy the stack.

```
npx cdk deploy
```

If everything works, you should see some output.

```
 ✅  IntegrationTestsStack

Outputs:
IntegrationTestsStack.EksClusterConfigCommandAEB22784 = aws eks update-kubeconfig --name EksCluster3394B24C-86f946f02a67416c80413e123d58b628 --region eu-central-1 --role-arn arn:aws:iam::123456789012:role/IntegrationTestsStack-EksClusterMastersRoleA746276-GNW143CGOXG7
IntegrationTestsStack.EksClusterGetTokenCommand53BD6035 = aws eks get-token --cluster-name EksCluster3394B24C-86f946f02a67416c80413e123d58b628 --region eu-central-1 --role-arn arn:aws:iam::123456789012:role/IntegrationTestsStack-EksClusterMastersRoleA746276-GNW143CGOXG7

Stack ARN:
arn:aws:cloudformation:eu-central-1:123456789012:stack/IntegrationTestsStack/06273460-660e-11eb-b4d9-06da4ef2f41a
✨  Done in 1757.52s.
✨  Done in 1757.79s.
```

Paste the `aws eks update-kubeconfig` command into your shell. This will update your `kubeconfig`.

```
aws eks update-kubeconfig --name EksCluster3394B24C-86f946f02a67416c80413e123d58b628 --region eu-central-1 --role-arn arn:aws:iam::123456789012:role/IntegrationTestsStack-EksClusterMastersRoleA746276-GNW143CGOXG7
Added new context arn:aws:eks:eu-central-1:123456789012:cluster/EksCluster3394B24C-86f946f02a67416c80413e123d58b628 to /home/super-eks/.kube/config
```

Now let's see if it works.

```
NAMESPACE      NAME                                            READY   STATUS    RESTARTS   AGE
external-dns   external-dns-7d4d69545d-r5w68                   1/1     Running   0          14m
kube-system    aws-for-fluent-bit-qwhwb                        1/1     Running   0          14m
kube-system    aws-for-fluent-bit-s7wnj                        1/1     Running   0          14m
kube-system    aws-load-balancer-controller-5b9cbc5497-smfrt   1/1     Running   0          14m
kube-system    aws-node-lscgc                                  1/1     Running   0          18m
kube-system    aws-node-zfcdl                                  1/1     Running   0          18m
kube-system    coredns-59b69b4849-9gstn                        1/1     Running   0          25m
kube-system    coredns-59b69b4849-bssnr                        1/1     Running   0          25m
kube-system    kube-proxy-9sgtt                                1/1     Running   0          18m
kube-system    kube-proxy-r4gzg                                1/1     Running   0          18m
nginx          nginx-67cb444d48-lqzkg                          1/1     Running   0          14m
```

Voila! :tada: You now have a super EKS cluster with batteries included!

## Development

- We use [architecture decision records](https://github.com/joelparkerhenderson/architecture_decision_record/blob/master/adr_template_by_michael_nygard.md). See [here](docs/decisions) for the decisions made so far.
- We use the [AWS Cloud Development Kit (CDK)](github.com/aws-cdk/cdk)

