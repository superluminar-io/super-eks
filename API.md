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
[NodeTaint](#superluminar-io-super-eks-nodetaint)|Represents a Kubernetes taint.
[SuperEksProps](#superluminar-io-super-eks-supereksprops)|Constructor properties for SuperEks.


**Enums**

Name|Description
----|-----------
[TaintEffect](#superluminar-io-super-eks-tainteffect)|Represents a Kubernetes taint effect.



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
**additionalNodegroups** | <code>Array<[Nodegroup](#aws-cdk-aws-eks-nodegroup)></code> | `eks.Nodegroup`s added to the cluster.
**cluster** | <code>[Cluster](#aws-cdk-aws-eks-cluster)</code> | The created cluster.

### Methods


#### nodeTaintUserdata(taint) <a id="superluminar-io-super-eks-supereks-nodetaintuserdata"></a>

Generates `ec2.MultipartUserData` to attach to a `eks.Nodegroup` `ec2.LaunchTemplate` so that the Nodes are getting tainted with the given `NodeTaint`.

```ts
nodeTaintUserdata(taint: NodeTaint): MultipartUserData
```

* **taint** (<code>[NodeTaint](#superluminar-io-super-eks-nodetaint)</code>)  the taint that should be applied to the Nodes.
  * **effect** (<code>[TaintEffect](#superluminar-io-super-eks-tainteffect)</code>)  *No description* 
  * **key** (<code>string</code>)  *No description* 
  * **value** (<code>string</code>)  *No description* 

__Returns__:
* <code>[MultipartUserData](#aws-cdk-aws-ec2-multipartuserdata)</code>



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



## struct NodeTaint  <a id="superluminar-io-super-eks-nodetaint"></a>


Represents a Kubernetes taint.

See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>



Name | Type | Description 
-----|------|-------------
**effect** | <code>[TaintEffect](#superluminar-io-super-eks-tainteffect)</code> | <span></span>
**key** | <code>string</code> | <span></span>
**value** | <code>string</code> | <span></span>



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



## enum TaintEffect  <a id="superluminar-io-super-eks-tainteffect"></a>

Represents a Kubernetes taint effect.

See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>

Name | Description
-----|-----
**NO_SCHEDULE** |
**PREFER_NO_SCHEDULE** |
**NO_EXECUTE** |


