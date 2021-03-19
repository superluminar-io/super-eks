import { TaintEffect } from '../types/cluster';

/**
 * Configuration for the Nodegroup used for internal workloads (e.g. DNS, LoadBalancerController).
 */
export const InternalNodegroup = {
  taint: {
    key: 'workload',
    value: 'super-eks',
    effect: TaintEffect.NO_SCHEDULE,
  },
  labels: { workload: 'super-eks' },
};

