# API Reference

**Classes**

Name|Description
----|-----------
[SuperEks](#superluminar-io-super-eks-supereks)|SuperEks wraps eks.Cluster to include batteries.
[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)|vpc-cni add-on versions.


**Structs**

Name|Description
----|-----------
[AddonProps](#superluminar-io-super-eks-addonprops)|Specific properties for EKS managed add-ons.
[SuperEksProps](#superluminar-io-super-eks-supereksprops)|Constructor properties for SuperEks.



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
  * **addonProps** (<code>[AddonProps](#superluminar-io-super-eks-addonprops)</code>)  Specific properties for EKS managed add-ons. __*Optional*__
  * **adminRoles** (<code>Array<[IRole](#aws-cdk-aws-iam-irole)></code>)  Additional Roles that should be granted cluster admin privileges. __*Optional*__
  * **clusterProps** (<code>[ClusterProps](#aws-cdk-aws-eks-clusterprops)</code>)  Wrapper for all cluster props>. __*Optional*__
  * **superEksNodegroupProps** (<code>[NodegroupOptions](#aws-cdk-aws-eks-nodegroupoptions)</code>)  Config for the Nodegroup created to host SuperEks specific workloads. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**additionalNodegroups** | <code>Array<[Nodegroup](#aws-cdk-aws-eks-nodegroup)></code> | <span></span>
**cluster** | <code>[Cluster](#aws-cdk-aws-eks-cluster)</code> | <span></span>



## class VpcCniAddonVersion  <a id="superluminar-io-super-eks-vpccniaddonversion"></a>

vpc-cni add-on versions.


### Initializer




```ts
new VpcCniAddonVersion(version: string)
```

* **version** (<code>string</code>)  add-on version.



### Properties


Name | Type | Description 
-----|------|-------------
**version** | <code>string</code> | add-on version.
*static* **V1_6_3** | <code>[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)</code> | vpc-cni version 1.6.3.
*static* **V1_7_5** | <code>[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)</code> | vpc-cni version 1.7.5.
*static* **V1_7_6** | <code>[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)</code> | vpc-cni version 1.7.6.
*static* **V1_7_9** | <code>[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)</code> | vpc-cni version 1.7.9.

### Methods


#### *static* of(version) <a id="superluminar-io-super-eks-vpccniaddonversion-of"></a>

Custom add-on version.

```ts
static of(version: string): VpcCniAddonVersion
```

* **version** (<code>string</code>)  custom add-on version.

__Returns__:
* <code>[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)</code>



## struct AddonProps  <a id="superluminar-io-super-eks-addonprops"></a>


Specific properties for EKS managed add-ons.



Name | Type | Description 
-----|------|-------------
**vpcCniAddonVersion**? | <code>[VpcCniAddonVersion](#superluminar-io-super-eks-vpccniaddonversion)</code> | __*Optional*__



## struct SuperEksProps  <a id="superluminar-io-super-eks-supereksprops"></a>


Constructor properties for SuperEks.

Get merged with `defaultSuperEksProps`.



Name | Type | Description 
-----|------|-------------
**hostedZone** | <code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code> | A hosted zone for DNS management.
**addonProps**? | <code>[AddonProps](#superluminar-io-super-eks-addonprops)</code> | Specific properties for EKS managed add-ons.<br/>__*Optional*__
**adminRoles**? | <code>Array<[IRole](#aws-cdk-aws-iam-irole)></code> | Additional Roles that should be granted cluster admin privileges.<br/>__*Optional*__
**clusterProps**? | <code>[ClusterProps](#aws-cdk-aws-eks-clusterprops)</code> | Wrapper for all cluster props>.<br/>__*Optional*__
**superEksNodegroupProps**? | <code>[NodegroupOptions](#aws-cdk-aws-eks-nodegroupoptions)</code> | Config for the Nodegroup created to host SuperEks specific workloads.<br/>__*Optional*__



