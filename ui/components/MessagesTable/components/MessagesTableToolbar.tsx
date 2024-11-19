import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@/libs/patternfly/react-core";
import { Button, ToolbarGroup, Tooltip } from "@patternfly/react-core";
import { ColumnsIcon, FileCsvIcon } from "@patternfly/react-icons";
import { useMemo } from "react";
import CsvDownloader from "react-csv-downloader";
import { MessagesTableProps } from "../MessagesTable";
import { AdvancedSearch } from "./AdvancedSearch";

export function MessagesTableToolbar({
  filterQuery,
  filterWhere,
  filterEpoch,
  filterTimestamp,
  filterOffset,
  filterPartition,
  filterLimit,
  partitions,
  onSearch,
  onColumnManagement,
  topicName,
  messages,
}: Pick<
  MessagesTableProps,
  | "filterQuery"
  | "filterWhere"
  | "filterEpoch"
  | "filterTimestamp"
  | "filterOffset"
  | "filterPartition"
  | "filterLimit"
  | "partitions"
  | "onSearch"
  | "topicName"
  | "messages"
> & {
  onColumnManagement: () => void;
}) {
  const toolbarBreakpoint = "md";

  function onClearAllFilters() {}

  const csv = useMemo(() => {
    return messages.map((m) => ({
      timestamp: m.attributes.timestamp,
      offset: `${m.attributes.offset}`,
      partition: `${m.attributes.partition}`,
      size: `${m.attributes.size}`,
      headers: encodeURIComponent(JSON.stringify(m.attributes.headers)),
      key: encodeURIComponent(m.attributes.key || ""),
      value: encodeURIComponent(m.attributes.value || ""),
    }));
  }, [messages]);
  const columns = [
    {
      id: "timestamp",
      displayName: "Timestamp UTC",
    },
    {
      id: "offset",
      displayName: "Offset",
    },
    {
      id: "partition",
      displayName: "Partition",
    },
    {
      id: "size",
      displayName: "Size",
    },
    {
      id: "headers",
      displayName: "Headers",
    },
    {
      id: "key",
      displayName: "Key",
    },
    {
      id: "value",
      displayName: "Value",
    },
  ];

  return (
    <Toolbar
      clearAllFilters={onClearAllFilters}
      collapseListedFiltersBreakpoint={toolbarBreakpoint}
    >
      <ToolbarContent>
        <ToolbarItem
          variant={"label"}
          style={{
            width:"calc(100% - 52px * 2)",
            maxWidth: 700,
          }}
        >
          <AdvancedSearch
            filterQuery={filterQuery}
            filterWhere={filterWhere}
            filterEpoch={filterEpoch}
            filterOffset={filterOffset}
            filterPartition={filterPartition}
            filterTimestamp={filterTimestamp}
            filterLimit={filterLimit}
            partitions={partitions}
            onSearch={onSearch}
          />
        </ToolbarItem>

        <ToolbarGroup variant="action-group-plain">
          <ToolbarItem>
            <Tooltip content={"Manage columns"}>
              <Button
                icon={<ColumnsIcon />}
                onClick={onColumnManagement}
                variant={"plain"}
                aria-label={"Columns management"}
              />
            </Tooltip>
          </ToolbarItem>
          <ToolbarItem>
            <Tooltip content={"Download as CSV"}>
              <CsvDownloader
                filename={topicName}
                datas={csv}
                columns={columns}
                separator={";"}
              >
                <Button
                  icon={<FileCsvIcon />}
                  variant={"plain"}
                  aria-label={"Download as CSV"}
                  isDisabled={messages.length === 0}
                />
              </CsvDownloader>
            </Tooltip>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
}
