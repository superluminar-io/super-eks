export enum taintEffect {
  NoSchedule = "NoSchedule",
  PreferNoSchedule = "PreferNoSchedule",
  NoExecute = "NoExecute",
}

export interface NodeTaint {
  key: string
  value: string
  effect: taintEffect
}

export const SuperEksNodegroup = {
  taint: {
    key: "workload",
    value: "super-eks",
    effect: taintEffect.NoSchedule,
  },
  labels: { workload: "super-eks" },
}

export function nodeTaintUserdata(taint: NodeTaint): string {
  return `MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
#!/bin/bash
sed -i '/^KUBELET_EXTRA_ARGS=/a KUBELET_EXTRA_ARGS+=" --register-with-taints=${taint.key}=${taint.value}:${taint.effect}"' /etc/eks/bootstrap.sh


--==MYBOUNDARY==--\\
`
}
