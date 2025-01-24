"use server";
import {
  fetchData,
  patchData,
  sortParam,
  ApiResponse,
  filterEq,
  filterIn,
} from "@/api/api";
import {
  ConsumerGroup,
  ConsumerGroupResponseSchema,
  ConsumerGroupsResponse,
  ConsumerGroupsResponseSchema,
  ConsumerGroupState,
} from "@/api/consumerGroups/schema";
import { filterUndefinedFromObj } from "@/utils/filterUndefinedFromObj";

export async function getConsumerGroup(
  kafkaId: string,
  groupId: string,
): Promise<ApiResponse<ConsumerGroup>> {
  return fetchData(
    `/api/kafkas/${kafkaId}/consumerGroups/${groupId}`,
    "",
    (rawData) => ConsumerGroupResponseSchema.parse(rawData).data,
  );
}

export async function getConsumerGroups(
  kafkaId: string,
  params: {
    fields?: string;
    id?: string;
    state?: ConsumerGroupState[];
    pageSize?: number;
    pageCursor?: string;
    sort?: string;
    sortDir?: string;
  },
): Promise<ApiResponse<ConsumerGroupsResponse>> {
  const sp = new URLSearchParams(
    filterUndefinedFromObj({
      "fields[consumerGroups]":
        params.fields ?? "state,simpleConsumerGroup,members,offsets",
      "filter[id]": filterEq(params.id),
      "filter[state]": filterIn(params.state),
      "page[size]": params.pageSize,
      "page[after]": params.pageCursor?.startsWith("after:")
        ? params.pageCursor.slice(6)
        : undefined,
      "page[before]": params.pageCursor?.startsWith("before:")
        ? params.pageCursor.slice(7)
        : undefined,
      sort: sortParam(params.sort, params.sortDir),
    }),
  );

  return fetchData(`/api/kafkas/${kafkaId}/consumerGroups`, sp, (rawData) =>
    ConsumerGroupsResponseSchema.parse(rawData),
  );
}

export async function getTopicConsumerGroups(
  kafkaId: string,
  topicId: string,
  params: {
    pageSize?: number;
    pageCursor?: string;
    sort?: string;
    sortDir?: string;
  },
): Promise<ApiResponse<ConsumerGroupsResponse>> {
  const sp = new URLSearchParams(
    filterUndefinedFromObj({
      "fields[consumerGroups]":
        "state,simpleConsumerGroup,members,offsets,coordinator,partitionAssignor",
      "page[size]": params.pageSize,
      "page[after]": params.pageCursor,
      sort: sortParam(params.sort, params.sortDir),
    }),
  );
  return fetchData(
    `/api/kafkas/${kafkaId}/topics/${topicId}/consumerGroups`,
    sp,
    (rawData) => ConsumerGroupsResponseSchema.parse(rawData),
  );
}

export async function updateConsumerGroup(
  kafkaId: string,
  consumerGroupId: string,
  offsets: Array<{
    topicId: string;
    partition?: number;
    offset: string | number;
    metadata?: string;
  }>,
  dryRun?: boolean,
): Promise<ApiResponse<ConsumerGroup | undefined>> {
  return patchData(
    `/api/kafkas/${kafkaId}/consumerGroups/${consumerGroupId}`,
    {
      meta: {
        dryRun: dryRun,
      },
      data: {
        type: "consumerGroups",
        id: consumerGroupId,
        attributes: {
          offsets,
        },
      },
    },
    (rawData) =>
      dryRun ? ConsumerGroupResponseSchema.parse(rawData).data : undefined,
  );
}
