"use client";

import { ConsumerGroup, ConsumerGroupState } from "@/api/consumerGroups/schema";
import { useRouter } from "@/i18n/routing";
import { useFilterParams } from "@/utils/useFilterParams";
import { useOptimistic, useState, useTransition } from "react";
import {
  ConsumerGroupColumn,
  ConsumerGroupColumns,
  ConsumerGroupsTable,
  SortableColumns,
} from "./ConsumerGroupsTable";
import { ResetOffsetModal } from "./[groupId]/ResetOffsetModal";

export type ConnectedConsumerGroupTableProps = {
  kafkaId: string;
  consumerGroup: ConsumerGroup[] | undefined;
  consumerGroupCount: number;
  page: number;
  perPage: number;
  id: string | undefined;
  sort: ConsumerGroupColumn;
  sortDir: "asc" | "desc";
  consumerGroupState: ConsumerGroupState[] | undefined;
  baseurl: string;
  nextPageCursor: string | null | undefined;
  prevPageCursor: string | null | undefined;
};

type State = {
  id: string | undefined;
  consumerGroup: ConsumerGroup[] | undefined;
  perPage: number;
  sort: ConsumerGroupColumn;
  sortDir: "asc" | "desc";
  consumerGroupState: ConsumerGroupState[] | undefined;
};

export function ConnectedConsumerGroupTable({
  consumerGroup,
  consumerGroupCount,
  page,
  perPage,
  id,
  sort,
  sortDir,
  consumerGroupState,
  baseurl,
  nextPageCursor,
  prevPageCursor,
  kafkaId,
}: ConnectedConsumerGroupTableProps) {
  const router = useRouter();
  const _updateUrl = useFilterParams({ perPage, sort, sortDir });
  const [_, startTransition] = useTransition();
  const [state, addOptimistic] = useOptimistic<
    State,
    Partial<Omit<State, "ConsumerGroups">>
  >(
    {
      consumerGroup,
      id,
      perPage,
      sort,
      sortDir,
      consumerGroupState,
    },
    (state, options) => ({ ...state, ...options, consumerGroup: undefined }),
  );

  const updateUrl: typeof _updateUrl = (newParams) => {
    const { consumerGroup, ...s } = state;
    _updateUrl({
      ...s,
      ...newParams,
    });
  };

  function clearFilters() {
    startTransition(() => {
      _updateUrl({});
      addOptimistic({
        id: undefined,
        consumerGroupState: undefined,
      });
    });
  }

  const [isResetOffsetModalOpen, setResetOffsetModalOpen] = useState(false);
  const [consumerGroupMembers, setConsumerGroupMembers] = useState<string[]>(
    [],
  );
  const [consumerGroupName, setConsumerGroupName] = useState<string>("");

  const closeResetOffsetModal = () => {
    setResetOffsetModalOpen(false);
    setConsumerGroupMembers([]);
    router.push(`${baseurl}`);
  };

  return (
    <>
      <ConsumerGroupsTable
        total={consumerGroupCount}
        page={page}
        perPage={state.perPage}
        onPageChange={(newPage, perPage) => {
          startTransition(() => {
            const pageDiff = newPage - page;
            switch (pageDiff) {
              case -1:
                updateUrl({ perPage, page: prevPageCursor });
                break;
              case 1:
                updateUrl({ perPage, page: nextPageCursor });
                break;
              default:
                updateUrl({ perPage });
                break;
            }
            addOptimistic({ perPage });
          });
        }}
        consumerGroups={state.consumerGroup}
        isColumnSortable={(col) => {
          if (!SortableColumns.includes(col)) {
            return undefined;
          }
          const activeIndex = ConsumerGroupColumns.indexOf(state.sort);
          const columnIndex = ConsumerGroupColumns.indexOf(col);
          return {
            label: col as string,
            columnIndex,
            onSort: () => {
              startTransition(() => {
                const newSortDir =
                  activeIndex === columnIndex
                    ? state.sortDir === "asc"
                      ? "desc"
                      : "asc"
                    : "asc";
                updateUrl({
                  sort: col,
                  sortDir: newSortDir,
                });
                addOptimistic({ sort: col, sortDir: newSortDir });
              });
            },
            sortBy: {
              index: activeIndex,
              direction: state.sortDir,
              defaultDirection: "asc",
            },
            isFavorites: undefined,
          };
        }}
        filterName={state.id}
        onFilterNameChange={(id) => {
          startTransition(() => {
            updateUrl({ id });
            addOptimistic({ id });
          });
        }}
        filterState={state.consumerGroupState}
        onFilterStateChange={(consumerGroupState) => {
          startTransition(() => {
            updateUrl({ consumerGroupState });
            addOptimistic({ consumerGroupState });
          });
        }}
        onClearAllFilters={clearFilters}
        kafkaId={kafkaId}
        onResetOffset={(row) => {
          startTransition(() => {
            if (row.attributes.state === "STABLE") {
              setResetOffsetModalOpen(true);
              setConsumerGroupMembers(
                row.attributes.members?.map((member) => member.memberId) || [],
              );
              setConsumerGroupName(row.id);
            } else if (row.attributes.state === "EMPTY") {
              router.push(`${baseurl}/${row.id}/reset-offset`);
            }
          });
        }}
      />
      {isResetOffsetModalOpen && (
        <ResetOffsetModal
          members={consumerGroupMembers}
          isResetOffsetModalOpen={isResetOffsetModalOpen}
          onClickClose={closeResetOffsetModal}
          consumerGroupName={consumerGroupName}
          kafkaId={kafkaId}
        />
      )}
    </>
  );
}
