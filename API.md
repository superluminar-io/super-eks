# API Reference

**Classes**

Name|Description
----|-----------
[SuperEks](#super-eks-supereks)|*No description*


**Structs**

Name|Description
----|-----------
[SuperEksProps](#super-eks-supereksprops)|*No description*



## class SuperEks  <a id="super-eks-supereks"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new SuperEks(scope: Construct, id: string, props: SuperEksProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SuperEksProps](#super-eks-supereksprops)</code>)  *No description*
  * **hostedZone** (<code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code>)  *No description* 
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**cluster** | <code>[Cluster](#aws-cdk-aws-eks-cluster)</code> | <span></span>



## struct SuperEksProps  <a id="super-eks-supereksprops"></a>






Name | Type | Description 
-----|------|-------------
**hostedZone** | <code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code> | <span></span>
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | __*Optional*__



