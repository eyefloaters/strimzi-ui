import { Message } from "@/api/messages/schema";
import {
  Column,
  columns,
  ColumnsModal,
  useColumnLabels,
} from "@/app/[locale]/kafka/[kafkaId]/topics/[topicId]/messages/_components/ColumnsModal";
import { FilterGroup } from "@/app/[locale]/kafka/[kafkaId]/topics/[topicId]/messages/_components/FilterGroup";
import { NoResultsEmptyState } from "@/app/[locale]/kafka/[kafkaId]/topics/[topicId]/messages/_components/NoResultsEmptyState";
import { PartitionSelector } from "@/app/[locale]/kafka/[kafkaId]/topics/[topicId]/messages/_components/PartitionSelector";
import { DateTime } from "@/components/DateTime";
import { Bytes } from "@/components/Bytes";
import { Number } from "@/components/Number";
import { ResponsiveTable } from "@/components/table";
import {
  Button,
  Drawer,
  DrawerContent,
  PageSection,
  Text,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { FilterIcon, HelpIcon } from "@/libs/patternfly/react-icons";
import {
  BaseCellProps,
  InnerScrollContainer,
  OuterScrollContainer,
  TableVariant,
} from "@/libs/patternfly/react-table";
import { MessageKeys, useTranslations } from "next-intl";
import { PropsWithChildren, useState } from "react";
import { LimitSelector } from "./LimitSelector";
import { MessageDetails, MessageDetailsProps } from "./MessageDetails";
import { NoDataCell } from "./NoDataCell";
import { UnknownValuePreview } from "./UnknownValuePreview";
import { beautifyUnknownValue, isSameMessage } from "./utils";

const columnWidths: Record<Column, BaseCellProps["width"]> = {
  "offset-partition": 10,
  size: 10,
  key: 15,
  timestamp: 15,
  timestampUTC: 15,
  headers: 20,
  value: undefined,
};

const defaultColumns = ["offset", "timestampUTC", "key", "value"];

export type MessageBrowserProps = {
  isRefreshing: boolean;
  selectedMessage: Message | undefined;
  lastUpdated: Date | undefined;
  messages: Message[];
  partitions: number;
  partition: number | undefined;
  limit: number;
  filterOffset: number | undefined;
  filterEpoch: number | undefined;
  filterTimestamp: string | undefined;
  onPartitionChange: (value: number | undefined) => void;
  onOffsetChange: (value: number | undefined) => void;
  onTimestampChange: (value: string | undefined) => void;
  onEpochChange: (value: number | undefined) => void;
  onLatest: () => void;
  onLimitChange: (value: number) => void;
  onSelectMessage: (message: Message) => void;
  onDeselectMessage: () => void;
};

export function MessagesTable({
  isRefreshing,
  selectedMessage,
  messages,
  partitions,
  partition,
  limit,
  filterOffset,
  filterEpoch,
  filterTimestamp,
  onPartitionChange,
  onOffsetChange,
  onTimestampChange,
  onEpochChange,
  onLatest,
  onLimitChange,
  onSelectMessage,
  onDeselectMessage,
}: MessageBrowserProps) {
  const t = useTranslations("message-browser");
  const columnLabels = useColumnLabels();
  const [showColumnsManagement, setShowColumnsManagement] = useState(false);
  const [defaultTab, setDefaultTab] =
    useState<MessageDetailsProps["defaultTab"]>("value");
  const previouslySelectedColumns = (() => {
    const v = localStorage.getItem("message-browser-columns");
    if (v) {
      try {
        const pv = JSON.parse(v);
        if (Array.isArray(pv)) {
          return pv;
        }
      } catch {}
    }
    return defaultColumns;
  })();

  const columnTooltips: Record<Column, any> = {
    "offset-partition": undefined,
    size: <>
          {" "}
          <Tooltip content={t("tooltip.size")}>
            <HelpIcon />
          </Tooltip>
        </>,
    key: undefined,
    timestamp: undefined,
    timestampUTC: undefined,
    headers: undefined,
    value: undefined,
  };

  const [selectedColumns, setSelectedColumns] = useState<Column[]>(
    previouslySelectedColumns,
  );

  return (
    <PageSection
      isFilled={true}
      hasOverflowScroll={true}
      aria-label={t("title")}
    >
      <Drawer isInline={true} isExpanded={selectedMessage !== undefined}>
        <DrawerContent
          panelContent={
            <MessageDetails
              message={selectedMessage}
              defaultTab={defaultTab}
              onClose={onDeselectMessage}
            />
          }
        >
          <OuterScrollContainer>
            <MessagesTableToolbar
              isRefreshing={isRefreshing}
              partitions={partitions}
              partition={partition}
              limit={limit}
              filterOffset={filterOffset}
              filterEpoch={filterEpoch}
              filterTimestamp={filterTimestamp}
              onPartitionChange={onPartitionChange}
              onOffsetChange={onOffsetChange}
              onTimestampChange={onTimestampChange}
              onEpochChange={onEpochChange}
              onLatest={onLatest}
              onLimitChange={onLimitChange}
              onColumnManagement={() => setShowColumnsManagement(true)}
            />
            <InnerScrollContainer>
              <ResponsiveTable
                variant={TableVariant.compact}
                ariaLabel={t("table_aria_label")}
                columns={columns.filter((c) => selectedColumns.includes(c))}
                data={messages}
                expectedLength={messages.length}
                renderHeader={({ colIndex, column, Th, key }) => (
                  <Th
                    key={key}
                    width={columnWidths[column]}
                    isStickyColumn={colIndex === 0}
                    hasRightBorder={colIndex === 0}
                    modifier={"nowrap"}
                  >
                    {columnLabels[column]}
                    {columnTooltips[column] ?? ""}
                  </Th>
                )}
                renderCell={({ column, row, colIndex, Td, key }) => {
                  const empty = (
                    <NoDataCell columnLabel={columnLabels[column]} />
                  );

                  function Cell({ children }: PropsWithChildren) {
                    return (
                      <Td
                        key={key}
                        dataLabel={columnLabels[column]}
                        isStickyColumn={colIndex === 0}
                        hasRightBorder={colIndex === 0}
                        modifier={"nowrap"}
                      >
                        {children}
                      </Td>
                    );
                  }

                  switch (column) {
                    case "offset-partition":
                      return (
                        <Cell>
                          <Number value={row.attributes.offset} />
                          <TextContent>
                            <Text component={"small"}>
                              Partition{" "}
                              <Number value={row.attributes.partition} />
                            </Text>
                          </TextContent>
                        </Cell>
                      );
                    case "size":
                      return (
                        <Cell>
                          <Bytes value={row.attributes.size} />
                        </Cell>
                      );
                    case "timestamp":
                      return (
                        <Cell>
                          <DateTime
                            value={row.attributes.timestamp}
                            dateStyle={"short"}
                            timeStyle={"medium"}
                          />
                        </Cell>
                      );
                    case "timestampUTC":
                      return (
                        <Cell>
                          <DateTime
                            value={row.attributes.timestamp}
                            dateStyle={"short"}
                            timeStyle={"medium"}
                            tz={"UTC"}
                          />
                        </Cell>
                      );
                    case "key":
                      return (
                        <Cell>
                          {row.attributes.key ? (
                            <UnknownValuePreview
                              value={row.attributes.key}
                              truncateAt={40}
                              onClick={() => {
                                setDefaultTab("key");
                                onSelectMessage(row);
                              }}
                            />
                          ) : (
                            empty
                          )}
                        </Cell>
                      );
                    case "headers":
                      return (
                        <Cell>
                          {Object.keys(row.attributes.headers).length > 0 ? (
                            <UnknownValuePreview
                              value={beautifyUnknownValue(
                                JSON.stringify(row.attributes.headers),
                              )}
                              onClick={() => {
                                setDefaultTab("headers");
                                onSelectMessage(row);
                              }}
                            />
                          ) : (
                            empty
                          )}
                        </Cell>
                      );
                    case "value":
                      return (
                        <Cell>
                          {row.attributes.value ? (
                            <UnknownValuePreview
                              value={row.attributes.value}
                              truncateAt={149}
                              onClick={() => {
                                setDefaultTab("value");
                                onSelectMessage(row);
                              }}
                            />
                          ) : (
                            empty
                          )}
                        </Cell>
                      );
                  }
                }}
                isRowSelected={({ row }) =>
                  selectedMessage !== undefined &&
                  isSameMessage(row, selectedMessage)
                }
                onRowClick={({ row }) => {
                  setDefaultTab("value");
                  onSelectMessage(row);
                }}
              >
                <NoResultsEmptyState />
              </ResponsiveTable>
            </InnerScrollContainer>
          </OuterScrollContainer>
        </DrawerContent>
      </Drawer>
      <ColumnsModal
        isOpen={showColumnsManagement}
        selectedColumns={selectedColumns}
        onConfirm={(columns) => {
          setSelectedColumns(columns);
          localStorage.setItem(
            "message-browser-columns",
            JSON.stringify(columns),
          );
          setShowColumnsManagement(false);
        }}
        onCancel={() => setShowColumnsManagement(false)}
      />
    </PageSection>
  );
}

export function MessagesTableToolbar({
  isRefreshing,
  filterEpoch,
  filterTimestamp,
  filterOffset,
  partition,
  partitions,
  limit,
  onEpochChange,
  onTimestampChange,
  onOffsetChange,
  onPartitionChange,
  onLimitChange,
  onLatest,
  onColumnManagement,
}: Pick<
  MessageBrowserProps,
  | "isRefreshing"
  | "filterEpoch"
  | "filterTimestamp"
  | "filterOffset"
  | "partition"
  | "partitions"
  | "limit"
  | "onEpochChange"
  | "onTimestampChange"
  | "onOffsetChange"
  | "onPartitionChange"
  | "onLimitChange"
  | "onLatest"
> & {
  onColumnManagement: () => void;
}) {
  const toolbarBreakpoint = "md";

  function onClearAllFilters() {}

  return (
    <Toolbar
      clearAllFilters={onClearAllFilters}
      collapseListedFiltersBreakpoint={toolbarBreakpoint}
    >
      <ToolbarContent>
        <ToolbarItem
          visibility={{
            default: "hidden",
            [toolbarBreakpoint]: "visible",
          }}
        >
          <FilterGroup
            isDisabled={isRefreshing}
            offset={filterOffset}
            epoch={filterEpoch}
            timestamp={filterTimestamp}
            onOffsetChange={onOffsetChange}
            onTimestampChange={onTimestampChange}
            onEpochChange={onEpochChange}
            onLatest={onLatest}
          />
        </ToolbarItem>
        <ToolbarItem
          visibility={{
            default: "hidden",
            [toolbarBreakpoint]: "visible",
          }}
        >
          <PartitionSelector
            value={partition}
            partitions={partitions}
            onChange={onPartitionChange}
            isDisabled={isRefreshing}
          />
        </ToolbarItem>

        <ToolbarToggleGroup
          toggleIcon={<FilterIcon />}
          breakpoint={toolbarBreakpoint}
          visibility={{
            default: "visible",
            [toolbarBreakpoint]: "hidden",
          }}
        >
          <ToolbarItem>
            <FilterGroup
              isDisabled={isRefreshing}
              offset={filterOffset}
              epoch={filterEpoch}
              timestamp={filterTimestamp}
              onOffsetChange={onOffsetChange}
              onTimestampChange={onTimestampChange}
              onEpochChange={onEpochChange}
              onLatest={onLatest}
            />
          </ToolbarItem>
          <ToolbarItem>
            <PartitionSelector
              value={partition}
              partitions={partitions}
              onChange={onPartitionChange}
              isDisabled={isRefreshing}
            />
          </ToolbarItem>
        </ToolbarToggleGroup>

        <ToolbarItem>
          <Button onClick={onColumnManagement} variant={"link"}>
            Manage columns
          </Button>
        </ToolbarItem>

        <ToolbarGroup align={{ default: "alignRight" }}>
          <LimitSelector
            value={limit}
            onChange={onLimitChange}
            isDisabled={isRefreshing}
          />
        </ToolbarGroup>
        <ToolbarGroup variant="icon-button-group">
          <ToolbarItem></ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
}

export function MessagesTableSkeleton({
  partition,
  limit,
  filterTimestamp,
  filterOffset,
  filterEpoch,
}: Pick<
  MessageBrowserProps,
  "partition" | "limit" | "filterTimestamp" | "filterOffset" | "filterEpoch"
>) {
  const t = useTranslations("message-browser");
  return (
    <PageSection
      isFilled={true}
      hasOverflowScroll={true}
      aria-label={t("title")}
    >
      <MessagesTableToolbar
        isRefreshing={true}
        partitions={1}
        partition={partition}
        limit={limit}
        filterOffset={filterOffset}
        filterEpoch={filterEpoch}
        filterTimestamp={filterTimestamp}
        onPartitionChange={() => {}}
        onOffsetChange={() => {}}
        onTimestampChange={() => {}}
        onEpochChange={() => {}}
        onLatest={() => {}}
        onLimitChange={() => {}}
        onColumnManagement={() => {}}
      />
      <ResponsiveTable
        variant={TableVariant.compact}
        ariaLabel={t("table_aria_label")}
        columns={columns}
        data={undefined}
        expectedLength={20}
        renderCell={() => <div></div>}
        renderHeader={() => <div></div>}
      />
    </PageSection>
  );
}
