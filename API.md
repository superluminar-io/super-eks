# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### SuperEks <a name="@superluminar-io/super-eks.SuperEks"></a>

SuperEks wraps eks.Cluster to include batteries.

#### Initializers <a name="@superluminar-io/super-eks.SuperEks.Initializer"></a>

```typescript
import { SuperEks } from '@superluminar-io/super-eks'

new SuperEks(scope: Construct, id: string, props: SuperEksProps)
```

##### `scope`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEks.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEks.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEks.parameter.props"></a>

- *Type:* [`@superluminar-io/super-eks.SuperEksProps`](#@superluminar-io/super-eks.SuperEksProps)

---

#### Methods <a name="Methods"></a>

##### `nodeTaintUserdata` <a name="@superluminar-io/super-eks.SuperEks.nodeTaintUserdata"></a>

```typescript
public nodeTaintUserdata(taint: NodeTaint)
```

###### `taint`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEks.parameter.taint"></a>

- *Type:* [`@superluminar-io/super-eks.NodeTaint`](#@superluminar-io/super-eks.NodeTaint)

the taint that should be applied to the Nodes.

---


#### Properties <a name="Properties"></a>

##### `additionalNodegroups`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEks.property.additionalNodegroups"></a>

```typescript
public readonly additionalNodegroups: Nodegroup[];
```

- *Type:* [`@aws-cdk/aws-eks.Nodegroup`](#@aws-cdk/aws-eks.Nodegroup)[]
- *Default:* An internal `eks.Nodegroup` will be created for super-eks related workloads

`eks.Nodegroup`s added to the cluster.

---

##### `cluster`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEks.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* [`@aws-cdk/aws-eks.Cluster`](#@aws-cdk/aws-eks.Cluster)

The created cluster.

---


### VeleroBackup <a name="@superluminar-io/super-eks.VeleroBackup"></a>

#### Initializers <a name="@superluminar-io/super-eks.VeleroBackup.Initializer"></a>

```typescript
import { VeleroBackup } from '@superluminar-io/super-eks'

new VeleroBackup(scope: Construct, id: string, props: VeleroBackupPropsWithCluster)
```

##### `scope`<sup>Required</sup> <a name="@superluminar-io/super-eks.VeleroBackup.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="@superluminar-io/super-eks.VeleroBackup.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="@superluminar-io/super-eks.VeleroBackup.parameter.props"></a>

- *Type:* [`@superluminar-io/super-eks.VeleroBackupPropsWithCluster`](#@superluminar-io/super-eks.VeleroBackupPropsWithCluster)

---





## Structs <a name="Structs"></a>

### AddonProps <a name="@superluminar-io/super-eks.AddonProps"></a>

Specific properties for EKS managed add-ons.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { AddonProps } from '@superluminar-io/super-eks'

const addonProps: AddonProps = { ... }
```

##### `vpcCniAddonVersion`<sup>Optional</sup> <a name="@superluminar-io/super-eks.AddonProps.property.vpcCniAddonVersion"></a>

```typescript
public readonly vpcCniAddonVersion: VpcCniAddonVersion;
```

- *Type:* [`@superluminar-io/super-eks.VpcCniAddonVersion`](#@superluminar-io/super-eks.VpcCniAddonVersion)

---

### BackupSchedule <a name="@superluminar-io/super-eks.BackupSchedule"></a>

Properties for configuring a schedule for velero backups.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { BackupSchedule } from '@superluminar-io/super-eks'

const backupSchedule: BackupSchedule = { ... }
```

##### `schedule`<sup>Required</sup> <a name="@superluminar-io/super-eks.BackupSchedule.property.schedule"></a>

```typescript
public readonly schedule: string;
```

- *Type:* `string`

Schedule when to run.

---

##### `annotations`<sup>Optional</sup> <a name="@superluminar-io/super-eks.BackupSchedule.property.annotations"></a>

```typescript
public readonly annotations: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

Annotations for the schedule.

default: none

---

##### `labels`<sup>Optional</sup> <a name="@superluminar-io/super-eks.BackupSchedule.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

Labels for the schedule.

default: none

---

##### `template`<sup>Optional</sup> <a name="@superluminar-io/super-eks.BackupSchedule.property.template"></a>

```typescript
public readonly template: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

template for the schedule.

default: velero default values

---

### NodeTaint <a name="@superluminar-io/super-eks.NodeTaint"></a>

Represents a Kubernetes taint.

See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { NodeTaint } from '@superluminar-io/super-eks'

const nodeTaint: NodeTaint = { ... }
```

##### `effect`<sup>Required</sup> <a name="@superluminar-io/super-eks.NodeTaint.property.effect"></a>

```typescript
public readonly effect: TaintEffect;
```

- *Type:* [`@superluminar-io/super-eks.TaintEffect`](#@superluminar-io/super-eks.TaintEffect)

---

##### `key`<sup>Required</sup> <a name="@superluminar-io/super-eks.NodeTaint.property.key"></a>

```typescript
public readonly key: string;
```

- *Type:* `string`

---

##### `value`<sup>Required</sup> <a name="@superluminar-io/super-eks.NodeTaint.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* `string`

---

### SuperEksProps <a name="@superluminar-io/super-eks.SuperEksProps"></a>

Constructor properties for SuperEks.

Get merged with `defaultSuperEksProps`.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { SuperEksProps } from '@superluminar-io/super-eks'

const superEksProps: SuperEksProps = { ... }
```

##### `hostedZone`<sup>Required</sup> <a name="@superluminar-io/super-eks.SuperEksProps.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* [`@aws-cdk/aws-route53.IHostedZone`](#@aws-cdk/aws-route53.IHostedZone)

A hosted zone for DNS management.

Records in this zone will be created for your workloads by 'external-dns'.

---

##### `addonProps`<sup>Optional</sup> <a name="@superluminar-io/super-eks.SuperEksProps.property.addonProps"></a>

```typescript
public readonly addonProps: AddonProps;
```

- *Type:* [`@superluminar-io/super-eks.AddonProps`](#@superluminar-io/super-eks.AddonProps)

Specific properties for EKS managed add-ons.

---

##### `adminRoles`<sup>Optional</sup> <a name="@superluminar-io/super-eks.SuperEksProps.property.adminRoles"></a>

```typescript
public readonly adminRoles: IRole[];
```

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)[]

Additional Roles that should be granted cluster admin privileges.

Can also be added manually after cluster creation by using `cluster.awsAuth.addMastersRole(role)`.

---

##### `backupProps`<sup>Optional</sup> <a name="@superluminar-io/super-eks.SuperEksProps.property.backupProps"></a>

```typescript
public readonly backupProps: VeleroBackupProps;
```

- *Type:* [`@superluminar-io/super-eks.VeleroBackupProps`](#@superluminar-io/super-eks.VeleroBackupProps)

If set, enables backup with velero.

---

##### `clusterProps`<sup>Optional</sup> <a name="@superluminar-io/super-eks.SuperEksProps.property.clusterProps"></a>

```typescript
public readonly clusterProps: ClusterProps;
```

- *Type:* [`@aws-cdk/aws-eks.ClusterProps`](#@aws-cdk/aws-eks.ClusterProps)

Wrapper for all cluster props>.

---

##### `superEksNodegroupProps`<sup>Optional</sup> <a name="@superluminar-io/super-eks.SuperEksProps.property.superEksNodegroupProps"></a>

```typescript
public readonly superEksNodegroupProps: NodegroupOptions;
```

- *Type:* [`@aws-cdk/aws-eks.NodegroupOptions`](#@aws-cdk/aws-eks.NodegroupOptions)

Config for the Nodegroup created to host SuperEks specific workloads.

If you override the `launchTemplateSpec` you're responsible for adding the necessary userdata to taint the nodes,
see `../config/cluster#nodeTaintUserdata`

---

### VeleroBackupProps <a name="@superluminar-io/super-eks.VeleroBackupProps"></a>

Properties for velero backup used to setup velero when setting up super eks.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { VeleroBackupProps } from '@superluminar-io/super-eks'

const veleroBackupProps: VeleroBackupProps = { ... }
```

##### `disableVolumeBackups`<sup>Optional</sup> <a name="@superluminar-io/super-eks.VeleroBackupProps.property.disableVolumeBackups"></a>

```typescript
public readonly disableVolumeBackups: boolean;
```

- *Type:* `boolean`

If set to true, backup of volumes are diabled.

---

##### `kubernetesNamespace`<sup>Optional</sup> <a name="@superluminar-io/super-eks.VeleroBackupProps.property.kubernetesNamespace"></a>

```typescript
public readonly kubernetesNamespace: string;
```

- *Type:* `string`

Set the namespace where velero should be deployed.

---

##### `schedule`<sup>Optional</sup> <a name="@superluminar-io/super-eks.VeleroBackupProps.property.schedule"></a>

```typescript
public readonly schedule: {[ key: string ]: BackupSchedule};
```

- *Type:* {[ key: string ]: [`@superluminar-io/super-eks.BackupSchedule`](#@superluminar-io/super-eks.BackupSchedule)}

Set up a schedule and options when to run the backups.

default: disabled

---

### VeleroBackupPropsWithCluster <a name="@superluminar-io/super-eks.VeleroBackupPropsWithCluster"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { VeleroBackupPropsWithCluster } from '@superluminar-io/super-eks'

const veleroBackupPropsWithCluster: VeleroBackupPropsWithCluster = { ... }
```

##### `disableVolumeBackups`<sup>Optional</sup> <a name="@superluminar-io/super-eks.VeleroBackupPropsWithCluster.property.disableVolumeBackups"></a>

```typescript
public readonly disableVolumeBackups: boolean;
```

- *Type:* `boolean`

If set to true, backup of volumes are diabled.

---

##### `kubernetesNamespace`<sup>Optional</sup> <a name="@superluminar-io/super-eks.VeleroBackupPropsWithCluster.property.kubernetesNamespace"></a>

```typescript
public readonly kubernetesNamespace: string;
```

- *Type:* `string`

Set the namespace where velero should be deployed.

---

##### `schedule`<sup>Optional</sup> <a name="@superluminar-io/super-eks.VeleroBackupPropsWithCluster.property.schedule"></a>

```typescript
public readonly schedule: {[ key: string ]: BackupSchedule};
```

- *Type:* {[ key: string ]: [`@superluminar-io/super-eks.BackupSchedule`](#@superluminar-io/super-eks.BackupSchedule)}

Set up a schedule and options when to run the backups.

default: disabled

---

##### `cluster`<sup>Required</sup> <a name="@superluminar-io/super-eks.VeleroBackupPropsWithCluster.property.cluster"></a>

```typescript
public readonly cluster: ICluster;
```

- *Type:* [`@aws-cdk/aws-eks.ICluster`](#@aws-cdk/aws-eks.ICluster)

The EKS cluster to install to.

---

## Classes <a name="Classes"></a>

### VpcCniAddonVersion <a name="@superluminar-io/super-eks.VpcCniAddonVersion"></a>

vpc-cni add-on versions.

#### Initializers <a name="@superluminar-io/super-eks.VpcCniAddonVersion.Initializer"></a>

```typescript
import { VpcCniAddonVersion } from '@superluminar-io/super-eks'

new VpcCniAddonVersion(version: string)
```

##### `version`<sup>Required</sup> <a name="@superluminar-io/super-eks.VpcCniAddonVersion.parameter.version"></a>

- *Type:* `string`

add-on version.

---


#### Static Functions <a name="Static Functions"></a>

##### `of` <a name="@superluminar-io/super-eks.VpcCniAddonVersion.of"></a>

```typescript
import { VpcCniAddonVersion } from '@superluminar-io/super-eks'

VpcCniAddonVersion.of(version: string)
```

###### `version`<sup>Required</sup> <a name="@superluminar-io/super-eks.VpcCniAddonVersion.parameter.version"></a>

- *Type:* `string`

custom add-on version.

---

#### Properties <a name="Properties"></a>

##### `version`<sup>Required</sup> <a name="@superluminar-io/super-eks.VpcCniAddonVersion.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* `string`

add-on version.

---

#### Constants <a name="Constants"></a>

##### `V1_6_3` <a name="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_6_3"></a>

- *Type:* [`@superluminar-io/super-eks.VpcCniAddonVersion`](#@superluminar-io/super-eks.VpcCniAddonVersion)

vpc-cni version 1.6.3.

---

##### `V1_7_5` <a name="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_5"></a>

- *Type:* [`@superluminar-io/super-eks.VpcCniAddonVersion`](#@superluminar-io/super-eks.VpcCniAddonVersion)

vpc-cni version 1.7.5.

---

##### `V1_7_6` <a name="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_6"></a>

- *Type:* [`@superluminar-io/super-eks.VpcCniAddonVersion`](#@superluminar-io/super-eks.VpcCniAddonVersion)

vpc-cni version 1.7.6.

---

##### `V1_7_9` <a name="@superluminar-io/super-eks.VpcCniAddonVersion.property.V1_7_9"></a>

- *Type:* [`@superluminar-io/super-eks.VpcCniAddonVersion`](#@superluminar-io/super-eks.VpcCniAddonVersion)

vpc-cni version 1.7.9.

---


## Enums <a name="Enums"></a>

### TaintEffect <a name="TaintEffect"></a>

Represents a Kubernetes taint effect.

See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>

#### `NO_SCHEDULE` <a name="@superluminar-io/super-eks.TaintEffect.NO_SCHEDULE"></a>

---


#### `PREFER_NO_SCHEDULE` <a name="@superluminar-io/super-eks.TaintEffect.PREFER_NO_SCHEDULE"></a>

---


#### `NO_EXECUTE` <a name="@superluminar-io/super-eks.TaintEffect.NO_EXECUTE"></a>

---

