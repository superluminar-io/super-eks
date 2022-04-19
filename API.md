# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### SuperEks <a name="SuperEks" id="@superluminar-io/super-eks.SuperEks"></a>

SuperEks wraps eks.Cluster to include batteries.

#### Initializers <a name="Initializers" id="@superluminar-io/super-eks.SuperEks.Initializer"></a>

```typescript
import { SuperEks } from '@superluminar-io/super-eks'

new SuperEks(scope: Construct, id: string, props: SuperEksProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.SuperEks.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#@superluminar-io/super-eks.SuperEks.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@superluminar-io/super-eks.SuperEks.Initializer.parameter.props">props</a></code> | <code><a href="#@superluminar-io/super-eks.SuperEksProps">SuperEksProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@superluminar-io/super-eks.SuperEks.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@superluminar-io/super-eks.SuperEks.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@superluminar-io/super-eks.SuperEks.Initializer.parameter.props"></a>

- *Type:* <a href="#@superluminar-io/super-eks.SuperEksProps">SuperEksProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@superluminar-io/super-eks.SuperEks.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@superluminar-io/super-eks.SuperEks.nodeTaintUserdata">nodeTaintUserdata</a></code> | Generates `ec2.MultipartUserData` to attach to a `eks.Nodegroup` `ec2.LaunchTemplate` so that the Nodes are getting tainted with the given `NodeTaint`. |

---

##### `toString` <a name="toString" id="@superluminar-io/super-eks.SuperEks.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `nodeTaintUserdata` <a name="nodeTaintUserdata" id="@superluminar-io/super-eks.SuperEks.nodeTaintUserdata"></a>

```typescript
public nodeTaintUserdata(taint: NodeTaint): MultipartUserData
```

Generates `ec2.MultipartUserData` to attach to a `eks.Nodegroup` `ec2.LaunchTemplate` so that the Nodes are getting tainted with the given `NodeTaint`.

###### `taint`<sup>Required</sup> <a name="taint" id="@superluminar-io/super-eks.SuperEks.nodeTaintUserdata.parameter.taint"></a>

- *Type:* <a href="#@superluminar-io/super-eks.NodeTaint">NodeTaint</a>

the taint that should be applied to the Nodes.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@superluminar-io/super-eks.SuperEks.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="@superluminar-io/super-eks.SuperEks.isConstruct"></a>

```typescript
import { SuperEks } from '@superluminar-io/super-eks'

SuperEks.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="@superluminar-io/super-eks.SuperEks.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.SuperEks.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#@superluminar-io/super-eks.SuperEks.property.additionalNodegroups">additionalNodegroups</a></code> | <code>@aws-cdk/aws-eks.Nodegroup[]</code> | `eks.Nodegroup`s added to the cluster. |
| <code><a href="#@superluminar-io/super-eks.SuperEks.property.cluster">cluster</a></code> | <code>@aws-cdk/aws-eks.Cluster</code> | The created cluster. |

---

##### `node`<sup>Required</sup> <a name="node" id="@superluminar-io/super-eks.SuperEks.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `additionalNodegroups`<sup>Required</sup> <a name="additionalNodegroups" id="@superluminar-io/super-eks.SuperEks.property.additionalNodegroups"></a>

```typescript
public readonly additionalNodegroups: Nodegroup[];
```

- *Type:* @aws-cdk/aws-eks.Nodegroup[]
- *Default:* An internal `eks.Nodegroup` will be created for super-eks related workloads

`eks.Nodegroup`s added to the cluster.

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="@superluminar-io/super-eks.SuperEks.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* @aws-cdk/aws-eks.Cluster

The created cluster.

---


## Structs <a name="Structs" id="Structs"></a>

### AddonProps <a name="AddonProps" id="@superluminar-io/super-eks.AddonProps"></a>

Specific properties for EKS managed add-ons.

#### Initializer <a name="Initializer" id="@superluminar-io/super-eks.AddonProps.Initializer"></a>

```typescript
import { AddonProps } from '@superluminar-io/super-eks'

const addonProps: AddonProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.AddonProps.property.vpcCniAddonVersion">vpcCniAddonVersion</a></code> | <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a></code> | *No description.* |

---

##### `vpcCniAddonVersion`<sup>Optional</sup> <a name="vpcCniAddonVersion" id="@superluminar-io/super-eks.AddonProps.property.vpcCniAddonVersion"></a>

```typescript
public readonly vpcCniAddonVersion: VpcCniAddonVersion;
```

- *Type:* <a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a>

---

### NodeTaint <a name="NodeTaint" id="@superluminar-io/super-eks.NodeTaint"></a>

Represents a Kubernetes taint.

See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>

#### Initializer <a name="Initializer" id="@superluminar-io/super-eks.NodeTaint.Initializer"></a>

```typescript
import { NodeTaint } from '@superluminar-io/super-eks'

const nodeTaint: NodeTaint = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.NodeTaint.property.effect">effect</a></code> | <code><a href="#@superluminar-io/super-eks.TaintEffect">TaintEffect</a></code> | *No description.* |
| <code><a href="#@superluminar-io/super-eks.NodeTaint.property.key">key</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@superluminar-io/super-eks.NodeTaint.property.value">value</a></code> | <code>string</code> | *No description.* |

---

##### `effect`<sup>Required</sup> <a name="effect" id="@superluminar-io/super-eks.NodeTaint.property.effect"></a>

```typescript
public readonly effect: TaintEffect;
```

- *Type:* <a href="#@superluminar-io/super-eks.TaintEffect">TaintEffect</a>

---

##### `key`<sup>Required</sup> <a name="key" id="@superluminar-io/super-eks.NodeTaint.property.key"></a>

```typescript
public readonly key: string;
```

- *Type:* string

---

##### `value`<sup>Required</sup> <a name="value" id="@superluminar-io/super-eks.NodeTaint.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string

---

### SuperEksProps <a name="SuperEksProps" id="@superluminar-io/super-eks.SuperEksProps"></a>

Constructor properties for SuperEks.

Get merged with `defaultSuperEksProps`.

#### Initializer <a name="Initializer" id="@superluminar-io/super-eks.SuperEksProps.Initializer"></a>

```typescript
import { SuperEksProps } from '@superluminar-io/super-eks'

const superEksProps: SuperEksProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.SuperEksProps.property.hostedZone">hostedZone</a></code> | <code>@aws-cdk/aws-route53.IHostedZone</code> | A hosted zone for DNS management. |
| <code><a href="#@superluminar-io/super-eks.SuperEksProps.property.addonProps">addonProps</a></code> | <code><a href="#@superluminar-io/super-eks.AddonProps">AddonProps</a></code> | Specific properties for EKS managed add-ons. |
| <code><a href="#@superluminar-io/super-eks.SuperEksProps.property.adminRoles">adminRoles</a></code> | <code>@aws-cdk/aws-iam.IRole[]</code> | Additional Roles that should be granted cluster admin privileges. |
| <code><a href="#@superluminar-io/super-eks.SuperEksProps.property.clusterProps">clusterProps</a></code> | <code>@aws-cdk/aws-eks.ClusterProps</code> | Wrapper for all cluster props>. |
| <code><a href="#@superluminar-io/super-eks.SuperEksProps.property.superEksNodegroupProps">superEksNodegroupProps</a></code> | <code>@aws-cdk/aws-eks.NodegroupOptions</code> | Config for the Nodegroup created to host SuperEks specific workloads. |

---

##### `hostedZone`<sup>Required</sup> <a name="hostedZone" id="@superluminar-io/super-eks.SuperEksProps.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* @aws-cdk/aws-route53.IHostedZone

A hosted zone for DNS management.

Records in this zone will be created for your workloads by 'external-dns'.

---

##### `addonProps`<sup>Optional</sup> <a name="addonProps" id="@superluminar-io/super-eks.SuperEksProps.property.addonProps"></a>

```typescript
public readonly addonProps: AddonProps;
```

- *Type:* <a href="#@superluminar-io/super-eks.AddonProps">AddonProps</a>

Specific properties for EKS managed add-ons.

---

##### `adminRoles`<sup>Optional</sup> <a name="adminRoles" id="@superluminar-io/super-eks.SuperEksProps.property.adminRoles"></a>

```typescript
public readonly adminRoles: IRole[];
```

- *Type:* @aws-cdk/aws-iam.IRole[]

Additional Roles that should be granted cluster admin privileges.

Can also be added manually after cluster creation by using `cluster.awsAuth.addMastersRole(role)`.

---

##### `clusterProps`<sup>Optional</sup> <a name="clusterProps" id="@superluminar-io/super-eks.SuperEksProps.property.clusterProps"></a>

```typescript
public readonly clusterProps: ClusterProps;
```

- *Type:* @aws-cdk/aws-eks.ClusterProps

Wrapper for all cluster props>.

---

##### `superEksNodegroupProps`<sup>Optional</sup> <a name="superEksNodegroupProps" id="@superluminar-io/super-eks.SuperEksProps.property.superEksNodegroupProps"></a>

```typescript
public readonly superEksNodegroupProps: NodegroupOptions;
```

- *Type:* @aws-cdk/aws-eks.NodegroupOptions

Config for the Nodegroup created to host SuperEks specific workloads.

If you override the `launchTemplateSpec` you're responsible for adding the necessary userdata to taint the nodes,
see `../config/cluster#nodeTaintUserdata`

---

## Classes <a name="Classes" id="Classes"></a>

### VpcCniAddonVersion <a name="VpcCniAddonVersion" id="@superluminar-io/super-eks.VpcCniAddonVersion"></a>

vpc-cni add-on versions.

#### Initializers <a name="Initializers" id="@superluminar-io/super-eks.VpcCniAddonVersion.Initializer"></a>

```typescript
import { VpcCniAddonVersion } from '@superluminar-io/super-eks'

new VpcCniAddonVersion(version: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.Initializer.parameter.version">version</a></code> | <code>string</code> | add-on version. |

---

##### `version`<sup>Required</sup> <a name="version" id="@superluminar-io/super-eks.VpcCniAddonVersion.Initializer.parameter.version"></a>

- *Type:* string

add-on version.

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.of">of</a></code> | Custom add-on version. |

---

##### `of` <a name="of" id="@superluminar-io/super-eks.VpcCniAddonVersion.of"></a>

```typescript
import { VpcCniAddonVersion } from '@superluminar-io/super-eks'

VpcCniAddonVersion.of(version: string)
```

Custom add-on version.

###### `version`<sup>Required</sup> <a name="version" id="@superluminar-io/super-eks.VpcCniAddonVersion.of.parameter.version"></a>

- *Type:* string

custom add-on version.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.property.version">version</a></code> | <code>string</code> | add-on version. |

---

##### `version`<sup>Required</sup> <a name="version" id="@superluminar-io/super-eks.VpcCniAddonVersion.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

add-on version.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_6_3">V1_6_3</a></code> | <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a></code> | vpc-cni version 1.6.3. |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_5">V1_7_5</a></code> | <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a></code> | vpc-cni version 1.7.5. |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_6">V1_7_6</a></code> | <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a></code> | vpc-cni version 1.7.6. |
| <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_9">V1_7_9</a></code> | <code><a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a></code> | vpc-cni version 1.7.9. |

---

##### `V1_6_3`<sup>Required</sup> <a name="V1_6_3" id="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_6_3"></a>

```typescript
public readonly V1_6_3: VpcCniAddonVersion;
```

- *Type:* <a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a>

vpc-cni version 1.6.3.

---

##### `V1_7_5`<sup>Required</sup> <a name="V1_7_5" id="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_5"></a>

```typescript
public readonly V1_7_5: VpcCniAddonVersion;
```

- *Type:* <a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a>

vpc-cni version 1.7.5.

---

##### `V1_7_6`<sup>Required</sup> <a name="V1_7_6" id="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_6"></a>

```typescript
public readonly V1_7_6: VpcCniAddonVersion;
```

- *Type:* <a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a>

vpc-cni version 1.7.6.

---

##### `V1_7_9`<sup>Required</sup> <a name="V1_7_9" id="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_9"></a>

```typescript
public readonly V1_7_9: VpcCniAddonVersion;
```

- *Type:* <a href="#@superluminar-io/super-eks.VpcCniAddonVersion">VpcCniAddonVersion</a>

vpc-cni version 1.7.9.

---


## Enums <a name="Enums" id="Enums"></a>

### TaintEffect <a name="TaintEffect" id="@superluminar-io/super-eks.TaintEffect"></a>

Represents a Kubernetes taint effect.

See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@superluminar-io/super-eks.TaintEffect.NO_SCHEDULE">NO_SCHEDULE</a></code> | *No description.* |
| <code><a href="#@superluminar-io/super-eks.TaintEffect.PREFER_NO_SCHEDULE">PREFER_NO_SCHEDULE</a></code> | *No description.* |
| <code><a href="#@superluminar-io/super-eks.TaintEffect.NO_EXECUTE">NO_EXECUTE</a></code> | *No description.* |

---

##### `NO_SCHEDULE` <a name="NO_SCHEDULE" id="@superluminar-io/super-eks.TaintEffect.NO_SCHEDULE"></a>

---


##### `PREFER_NO_SCHEDULE` <a name="PREFER_NO_SCHEDULE" id="@superluminar-io/super-eks.TaintEffect.PREFER_NO_SCHEDULE"></a>

---


##### `NO_EXECUTE` <a name="NO_EXECUTE" id="@superluminar-io/super-eks.TaintEffect.NO_EXECUTE"></a>

---

