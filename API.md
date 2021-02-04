# API Reference

**Classes**

Name|Description
----|-----------
[SuperEks](#superluminar-io-super-eks-supereks)|SuperEks wraps eks.Cluster to include batteries.


**Structs**

Name|Description
----|-----------
[SuperEksProps](#superluminar-io-super-eks-supereksprops)|Properties to configure SuperEks.



## class SuperEks  <a id="superluminar-io-super-eks-supereks"></a>

SuperEks wraps eks.Cluster to include batteries.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new SuperEks(scope: Construct, id: string, props: SuperEksProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SuperEksProps](#superluminar-io-super-eks-supereksprops)</code>)  *No description*
  * **hostedZone** (<code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code>)  A hosted zone for DNS management. 
  * **adminRoles** (<code>Array<[IRole](#aws-cdk-aws-iam-irole)></code>)  A list of IAM roles for administrative access. __*Optional*__
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  A VPC, otherwise a dedicated VPC will be created. __*Default*__: none



### Properties


Name | Type | Description 
-----|------|-------------
**additionalNodegroups** | <code>Array<[Nodegroup](#aws-cdk-aws-eks-nodegroup)></code> | <span></span>
**cluster** | <code>[Cluster](#aws-cdk-aws-eks-cluster)</code> | <span></span>



## struct SuperEksProps  <a id="superluminar-io-super-eks-supereksprops"></a>


Properties to configure SuperEks.



Name | Type | Description 
-----|------|-------------
**hostedZone** | <code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code> | A hosted zone for DNS management.
**adminRoles**? | <code>Array<[IRole](#aws-cdk-aws-iam-irole)></code> | A list of IAM roles for administrative access.<br/>__*Optional*__
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | A VPC, otherwise a dedicated VPC will be created.<br/>__*Default*__: none



