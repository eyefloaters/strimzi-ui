import { Message } from "@/api/messages/schema";
import { Bytes } from "@/components/Bytes";
import { DateTime } from "@/components/DateTime";
import { SearchParams } from "@/components/MessagesTable/types";
import { Number } from "@/components/Number";
import { ResponsiveTable } from "@/components/Table";
import {
  Drawer,
  DrawerContent,
  PageSection,
  Text,
  TextContent,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { HelpIcon } from "@/libs/patternfly/react-icons";
import {
  BaseCellProps,
  InnerScrollContainer,
  OuterScrollContainer,
  TableVariant,
} from "@/libs/patternfly/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import {
  Column,
  ColumnsModal,
  useColumnLabels,
} from "./components/ColumnsModal";
import {
  MessageDetails,
  MessageDetailsProps,
} from "./components/MessageDetails";
import { MessagesTableToolbar } from "./components/MessagesTableToolbar";
import { NoDataCell } from "./components/NoDataCell";
import { NoResultsEmptyState } from "./components/NoResultsEmptyState";
import { UnknownValuePreview } from "./components/UnknownValuePreview";
import { beautifyUnknownValue, isSameMessage } from "./components/utils";

const columnWidths: Record<Column, BaseCellProps["width"]> = {
  "offset-partition": 10,
  size: 10,
  key: 15,
  timestamp: 15,
  timestampUTC: 15,
  headers: 20,
  value: undefined,
};

const defaultColumns: Column[] = [
  "timestampUTC",
  "offset-partition",
  "key",
  "value",
];

export type MessagesTableProps = {
  selectedMessage?: Message;
  lastUpdated?: Date;
  messages: Message[];
  partitions: number;
  filterLimit?: number;
  filterLive?: boolean;
  filterQuery?: string;
  filterWhere?: "key" | "headers" | "value" | `jq:${string}`;
  filterOffset?: number;
  filterEpoch?: number;
  filterTimestamp?: string;
  filterPartition?: number;
  onSearch: (params: SearchParams) => void;
  onSelectMessage: (message: Message) => void;
  onDeselectMessage: () => void;
};

export function MessagesTable({
  lastUpdated,
  selectedMessage,
  messages,
  partitions,
  filterLimit,
  filterLive,
  filterQuery,
  filterWhere,
  filterOffset,
  filterEpoch,
  filterTimestamp,
  filterPartition,
  onSearch,
  onSelectMessage,
  onDeselectMessage,
}: MessagesTableProps) {
  const t = useTranslations("message-browser");
  const columnLabels = useColumnLabels();
  const [showColumnsManagement, setShowColumnsManagement] = useState(false);
  const [defaultTab, setDefaultTab] =
    useState<MessageDetailsProps["defaultTab"]>("value");
  const [chosenColumns, setChosenColumns] = useState<Column[]>(defaultColumns);

  const columnTooltips: Record<Column, any> = {
    "offset-partition": undefined,
    size: (
      <>
        {" "}
        <Tooltip content={t("tooltip.size")}>
          <HelpIcon />
        </Tooltip>
      </>
    ),
    key: undefined,
    timestamp: undefined,
    timestampUTC: undefined,
    headers: undefined,
    value: undefined,
  };

  useEffect(() => {
    const v = localStorage.getItem("message-browser-columns");
    if (v) {
      try {
        const pv = JSON.parse(v);
        if (Array.isArray(pv)) {
          setChosenColumns(pv);
        }
      } catch {}
    }
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 20,
  });

  return (
    <PageSection
      isFilled={true}
      hasOverflowScroll={true}
      style={{ height: "calc(100vh - 170px - 70px)" }}
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
              partitions={partitions}
              filterLimit={filterLimit}
              filterLive={filterLive}
              filterQuery={filterQuery}
              filterWhere={filterWhere}
              filterOffset={filterOffset}
              filterEpoch={filterEpoch}
              filterTimestamp={filterTimestamp}
              filterPartition={filterPartition}
              onSearch={onSearch}
              onColumnManagement={() => setShowColumnsManagement(true)}
            />
            <InnerScrollContainer>
              <div ref={parentRef}>
                <ResponsiveTable
                  variant={TableVariant.compact}
                  ariaLabel={t("table_aria_label")}
                  columns={chosenColumns}
                  data={virtualizer.getVirtualItems()}
                  expectedLength={messages.length}
                  renderHeader={({ colIndex, column, Th, key }) => (
                    <Th
                      key={key}
                      width={columnWidths[column]}
                      modifier={"nowrap"}
                      sort={
                        column === "timestamp" ||
                        column === "timestampUTC" ||
                        column === "offset-partition"
                          ? {
                              columnIndex: colIndex,
                              sortBy: {
                                index: colIndex,
                                direction:
                                  filterOffset || filterTimestamp || filterEpoch
                                    ? "asc"
                                    : "desc",
                              },
                            }
                          : undefined
                      }
                    >
                      {columnLabels[column]}
                      {columnTooltips[column] ?? ""}
                    </Th>
                  )}
                  renderCell={({ column, row: vrow, colIndex, Td, key }) => {
                    const row = messages[vrow.index];
                    const empty = (
                      <NoDataCell columnLabel={columnLabels[column]} />
                    );

                    function Cell({ children }: PropsWithChildren) {
                      return (
                        <Td
                          key={key}
                          dataLabel={columnLabels[column]}
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
                                highlight={filterQuery}
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
                                highlight={filterQuery}
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
                                highlight={filterQuery}
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
                  getRowProps={({ row: vrow, rowIndex }) => {
                    return {
                      innerRef: virtualizer.measureElement,
                      style: {
                        height: `${vrow.size}px`,
                        transform: `translateY(${
                          vrow.start - rowIndex * vrow.size
                        }px)`,
                      },
                    };
                  }}
                  isRowSelected={({ row: vrow }) => {
                    const row = messages[vrow.index];
                    return (
                      selectedMessage !== undefined &&
                      isSameMessage(row, selectedMessage)
                    );
                  }}
                  onRowClick={({ row: vrow }) => {
                    const row = messages[vrow.index];
                    setDefaultTab("value");
                    onSelectMessage(row);
                  }}
                >
                  <NoResultsEmptyState />
                </ResponsiveTable>
              </div>
            </InnerScrollContainer>
          </OuterScrollContainer>
          <TextContent>
            <Text component={"small"} className={"pf-v5-u-px-md pf-v5-u-py-sm"}>
              Last updated:{" "}
              <DateTime
                value={lastUpdated}
                timeStyle={"medium"}
                dateStyle={"short"}
              />
            </Text>
          </TextContent>
        </DrawerContent>
      </Drawer>
      {showColumnsManagement && (
        <ColumnsModal
          chosenColumns={chosenColumns}
          onConfirm={(columns) => {
            setChosenColumns(columns);
            localStorage.setItem(
              "message-browser-columns",
              JSON.stringify(columns),
            );
            setShowColumnsManagement(false);
          }}
          onCancel={() => setShowColumnsManagement(false)}
        />
      )}
    </PageSection>
  );
}
