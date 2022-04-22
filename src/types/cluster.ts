/**
 * Represents a Kubernetes taint effect.
 *
 * See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>
 */
export enum TaintEffect {
  NO_SCHEDULE = 'NoSchedule',
  PREFER_NO_SCHEDULE = 'PreferNoSchedule',
  NO_EXECUTE = 'NoExecute',
}

/**
 * Represents a Kubernetes taint.
 *
 * See <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>
 */
export interface NodeTaint {
  readonly key: string;
  readonly value: string;
  readonly effect: TaintEffect;
}
