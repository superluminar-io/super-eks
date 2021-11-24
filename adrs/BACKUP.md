# Integration of Backup with Velero

* Status: proposed
* Deciders: {list everyone involved in the decision} <!-- optional -->
* Date: {2021-11-23} <!-- optional -->


## Context and Problem Statement

In the current setup of super eks there is no backup solution installed and configured. A backup solution can be helpful for some resources that are not managed by IaC.


## Considered Options

* Velero backup as exported construct
* Velero backup only as internal resource to super eks using only defaults

## Decision Outcome


### Positive Consequences

Users get a state of the art backup technology included with super eks, enabling them to restore a cluster after a
catastropic failure.

### Negative Consequences

Users have to think about how the backup needs to be setup and distinguish between resources that have been set up by
IaC and manually set up resources (e.g., secrets).

## Proposal

We propose to go with option 2, using this solution internally and only expose a few parameters to the user to minimize
the effects of the negative consequences while allowing to set up a state of the art backup for all needed resources.

## Pros and Cons of the Options

### Velero backup as exported construct

We can expose all helm chart values of the [Velero helm chart](https://github.com/vmware-tanzu/helm-charts/blob/main/charts/velero/values.yaml)
to be configured by the user. The values are quite rich and detailed.


* Good, because it provides maximum flexibility to the end user.
* Bad, because it also exposes all the complexity of Velero to the end user.
* Bad, because it does not really follow the batteries included approach.
* Bad, because if a complicated setup is needed, super eks would not be able to assist the user in doing so. Instead
  the user would have to be able to setup Velero anyway.

### Velero backup only as internal resource to super eks using only defaults

Velero backup can be configured with only defaults when setting up super eks. We could allow to only override settings
like the backup bucket, to enable cross account backups and more complicated bucket setup like encryption and policies.

We would also provide a default schedule template that would only enable backup on resources that have the label
`backup: enabled` set. The cron expression can be overridden to accommodate for different customer workloads.

Volume backups should be disabled by default but a user should be able to enable them. 

* Good, because it follows the batteries included approach
* Good, because it does not put the burden of understanding all Velero properties on the user but gives the user enough
    flexibility to configure resources to be backed up
* Bad, because it is not as flexible as option 1

