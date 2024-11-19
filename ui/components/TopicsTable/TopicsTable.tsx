import { TopicList, TopicStatus } from "@/api/topics/schema";
import { Bytes } from "@/components/Format/Bytes";
import { Number } from "@/components/Format/Number";
import { ManagedTopicLabel } from "@/components/ManagedTopicLabel";
import { ButtonLink } from "@/components/Navigation/ButtonLink";
import { TableView, TableViewProps } from "@/components/Table";
import { EmptyStateNoMatchFound } from "@/components/Table/EmptyStateNoMatchFound";
import { Icon, Switch, Tooltip } from "@/libs/patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HelpIcon,
} from "@/libs/patternfly/react-icons";
import { TableVariant } from "@/libs/patternfly/react-table";
import { Link } from "@/i18n/routing";
import { Truncate } from "@patternfly/react-core";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { EmptyStateNoTopics } from "./components/EmptyStateNoTopics";

export const TopicsTableColumns = [
  "name",
  "status",
  "partitions",
  "consumerGroups",
  "storage",
] as const;
export type SortableTopicsTableColumns = Exclude<
  TopicsTableColumn,
  "consumerGroups" | "partitions"
>;
export type TopicsTableColumn = (typeof TopicsTableColumns)[number];
export const SortableColumns = ["name", "storage"];
const StatusLabel: Record<TopicStatus, ReactNode> = {
  FullyReplicated: (
    <>
      <Icon status={"success"}>
        <CheckCircleIcon />
      </Icon>
      &nbsp;Fully replicated
    </>
  ),
  UnderReplicated: (
    <>
      <Icon status={"warning"}>
        <ExclamationTriangleIcon />
      </Icon>
      &nbsp;Under replicated
    </>
  ),
  PartiallyOffline: (
    <>
      <Icon status={"warning"}>
        <ExclamationTriangleIcon />
      </Icon>
      &nbsp;Partially offline
    </>
  ),
  Offline: (
    <>
      <Icon status={"danger"}>
        <ExclamationCircleIcon />
      </Icon>
      &nbsp;Offline
    </>
  ),
};

export type TopicsTableProps = {
  topics: TopicList[] | undefined;
  topicsCount: number;
  baseurl: string;
  page: number;
  perPage: number;
  includeHidden: boolean;
  isReadOnly: boolean;
  filterId: string | undefined;
  filterName: string | undefined;
  filterStatus: TopicStatus[] | undefined;
  onEditTopic: (topic: TopicList) => void;
  onDeleteTopic: (topic: TopicList) => void;
  onCreateTopic: () => void;
  onInternalTopicsChange: (checked: boolean) => void;
  onFilterIdChange: (id: string | undefined) => void;
  onFilterNameChange: (name: string | undefined) => void;
  onFilterStatusChange: (status: TopicStatus[] | undefined) => void;
} & Pick<
  TableViewProps<TopicList, (typeof TopicsTableColumns)[number]>,
  "isColumnSortable" | "onPageChange" | "onClearAllFilters"
>;

export function TopicsTable({
  baseurl,
  topics,
  topicsCount,
  page,
  perPage,
  includeHidden,
  isColumnSortable,
  isReadOnly,
  filterId,
  filterName,
  filterStatus,
  onPageChange,
  onClearAllFilters,
  onEditTopic,
  onDeleteTopic,
  onCreateTopic,
  onInternalTopicsChange,
  onFilterIdChange,
  onFilterNameChange,
  onFilterStatusChange,
}: TopicsTableProps) {
  const t = useTranslations("topics");
  return (
    <TableView
      itemCount={topicsCount}
      page={page}
      perPage={perPage}
      onPageChange={onPageChange}
      data={topics}
      emptyStateNoData={
        <EmptyStateNoTopics
          canCreate={isReadOnly === false}
          createHref={`${baseurl}/create`}
          onShowHiddenTopics={() => onInternalTopicsChange(true)}
        />
      }
      emptyStateNoResults={
        <EmptyStateNoMatchFound onClear={onClearAllFilters!} />
      }
      isFiltered={
        filterName !== undefined ||
        filterId !== undefined ||
        filterStatus?.length !== 0
      }
      ariaLabel={"Topics"}
      columns={TopicsTableColumns}
      isColumnSortable={isColumnSortable}
      renderHeader={({ Th, column, key }) => {
        switch (column) {
          case "name":
            return (
              <Th key={key} width={30} dataLabel={"Topic"}>
                {t("topic_name")}
              </Th>
            );
          case "status":
            return (
              <Th key={key} dataLabel={"Status"}>
                {t("status")}{" "}
                <Tooltip
                  style={{ whiteSpace: "pre-line" }}
                  content={t("topic_status_tooltip")}
                >
                  <HelpIcon />
                </Tooltip>
              </Th>
            );
          case "consumerGroups":
            return (
              <Th key={key} dataLabel={"Consumer groups"}>
                {t("consumer_groups")}
              </Th>
            );
          case "partitions":
            return (
              <Th key={key} dataLabel={"Partitions"}>
                {t("fields.partitions")}
              </Th>
            );
          case "storage":
            return (
              <Th key={key} dataLabel={"Storage"}>
                {t("storage")}
              </Th>
            );
        }
      }}
      renderCell={({ Td, column, row, key }) => {
        switch (column) {
          case "name":
            return (
              <Td key={key} dataLabel={"Topic"} width={10}>
                <Link href={`${baseurl}/${row.id}/messages`}>
                  <Truncate content={row.attributes.name!} />
                </Link>
                {row.meta?.managed === true && <ManagedTopicLabel />}
              </Td>
            );
          case "status":
            return (
              <Td key={key} dataLabel={"Status"}>
                {StatusLabel[row.attributes.status!]}
              </Td>
            );
          case "consumerGroups":
            return (
              <Td key={key} dataLabel={"Consumer groups"}>
                <ButtonLink
                  variant={"link"}
                  href={`${baseurl}/${row.id}/consumer-groups`}
                >
                  <Number
                    value={row.relationships.consumerGroups?.data.length ?? 0}
                  />
                </ButtonLink>
              </Td>
            );
          case "partitions":
            return (
              <Td key={key} dataLabel={"Partitions"}>
                <ButtonLink
                  variant={"link"}
                  href={`${baseurl}/${row.id}/partitions`}
                >
                  <Number value={row.attributes.numPartitions} />
                </ButtonLink>
              </Td>
            );
          case "storage":
            return (
              <Td key={key} dataLabel={"Storage"}>
                <Bytes value={row.attributes.totalLeaderLogBytes} />
              </Td>
            );
        }
      }}
      renderActions={({ row, ActionsColumn }) =>
        isReadOnly ? (
          <></>
        ) : (
          <ActionsColumn
            items={[
              {
                title: t("table.actions.edit"),
                onClick: () => onEditTopic(row),
              },
              {
                isSeparator: true,
              },
              {
                title: t("table.actions.delete"),
                onClick: () => onDeleteTopic(row),
              },
            ]}
          />
        )
      }
      filters={{
        Name: {
          type: "search",
          chips: filterName ? [filterName] : [],
          onSearch: onFilterNameChange,
          onRemoveChip: () => {
            onFilterNameChange(undefined);
          },
          onRemoveGroup: () => {
            onFilterNameChange(undefined);
          },
          validate: (value) => true,
          errorMessage: "At least 3 characters",
        },
        "Topic ID": {
          type: "search",
          chips: filterId ? [filterId] : [],
          onSearch: (id) => onFilterIdChange,
          onRemoveChip: () => {
            onFilterIdChange(undefined);
          },
          onRemoveGroup: () => {
            onFilterIdChange(undefined);
          },
          validate: (value) => true,
          errorMessage: "At least 3 characters",
        },
        Status: {
          type: "checkbox",
          chips: filterStatus || [],
          onToggle: (status) => {
            const newStatus = filterStatus?.includes(status)
              ? filterStatus.filter((s) => s !== status)
              : [...filterStatus!, status];
            onFilterStatusChange(newStatus);
          },
          onRemoveChip: (status) => {
            const newStatus = (filterStatus || []).filter((s) => s !== status);
            onFilterStatusChange(newStatus);
          },
          onRemoveGroup: () => {
            onFilterStatusChange(undefined);
          },
          options: StatusLabel,
        },
      }}
      onClearAllFilters={onClearAllFilters}
      actions={
        isReadOnly === false
          ? [
              {
                label: t("create_topic"),
                onClick: onCreateTopic,
                isPrimary: true,
              },
            ]
          : undefined
      }
      tools={[
        <Switch
          key={"ht"}
          label={
            <>
              {t("hide_internal_topics")}&nbsp;
              <Tooltip content={t("hide_internal_topics_tooltip")}>
                <HelpIcon />
              </Tooltip>
            </>
          }
          isChecked={includeHidden === false}
          onChange={(_, checked) => onInternalTopicsChange(!checked)}
          className={"pf-v6-u-py-xs"}
        />,
      ]}
      variant={TableVariant.compact}
      toolbarBreakpoint={"md"}
    />
  );
}
