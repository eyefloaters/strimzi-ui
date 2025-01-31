import { z } from "zod";

export const NodeSchema = z.object({
  id: z.number(),
  host: z.string(),
  port: z.number(),
  rack: z.string().optional(),
});
export type KafkaNode = z.infer<typeof NodeSchema>;
export const ClusterListSchema = z.object({
  id: z.string(),
  type: z.literal("kafkas"),
  meta: z.object({
    configured: z.boolean(),
  }),
  attributes: z.object({
    name: z.string(),
    namespace: z.string(),
    kafkaVersion: z.string().optional(),
  }),
});
export const ClustersResponseSchema = z.object({
  data: z.array(ClusterListSchema),
});
export type ClusterList = z.infer<typeof ClusterListSchema>;
const ClusterDetailSchema = z.object({
  id: z.string(),
  type: z.literal("kafkas"),
  attributes: z.object({
    name: z.string(),
    namespace: z.string(),
    creationTimestamp: z.string(),
    status: z.string(),
    kafkaVersion: z.string().optional(),
    nodes: z.array(NodeSchema),
    controller: NodeSchema,
    authorizedOperations: z.array(z.string()),
    listeners: z.array(
      z.object({
        type: z.string(),
        bootstrapServers: z.string().nullable(),
        authType: z.string().nullable(),
      }),
    ),
    conditions: z.array(
      z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        reason: z.string().optional(),
        message: z.string().optional(),
        lastTransitionTime: z.string().optional(),
      }),
    ),
    nodePools: z.array(z.string()).optional().nullable(),
  }),
});
export const ClusterResponse = z.object({
  data: ClusterDetailSchema,
});
export type ClusterDetail = z.infer<typeof ClusterDetailSchema>;

export const ClusterKpisSchema = z.object({
  broker_state: z.record(z.number()).optional(),
  total_topics: z.number().optional(),
  total_partitions: z.number().optional(),
  underreplicated_topics: z.number().optional(),
  replica_count: z.object({
    byNode: z.record(z.number()).optional(),
    total: z.number().optional(),
  }).optional(),
  leader_count: z.object({
    byNode: z.record(z.number()).optional(),
    total: z.number().optional(),
  }).optional(),
  volume_stats_capacity_bytes: z.object({
    byNode: z.record(z.number()).optional(),
    total: z.number().optional(),
  }).optional(),
  volume_stats_used_bytes: z.object({
    byNode: z.record(z.number()).optional(),
    total: z.number().optional(),
  }).optional(),
});
export type ClusterKpis = z.infer<typeof ClusterKpisSchema>;

export const MetricRangeSchema = z.record(z.string(), z.record(z.number()).optional());
export type MetricRange = z.infer<typeof MetricRangeSchema>;
