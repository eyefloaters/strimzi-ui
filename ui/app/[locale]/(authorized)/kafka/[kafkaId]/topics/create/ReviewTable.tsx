"use client";
import { ConfigMap, NewConfigMap } from "@/api/topics/schema";
import { ResponsiveTable, ResponsiveTableProps } from "@/components/Table";
import { TableVariant } from "@patternfly/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

type Column = "property" | "new-value" | "initial-value";
const columns: readonly Column[] = [
  "property",
  "new-value",
  "initial-value",
] as const;

export function ReviewTable({
  options,
  initialOptions,
}: {
  options: NewConfigMap;
  initialOptions: ConfigMap;
}) {
  const t = useTranslations();
  const data = useMemo(() => Object.entries(options), [options]);
  const renderCell = useCallback<
    ResponsiveTableProps<(typeof data)[number], Column>["renderCell"]
  >(
    ({ column, key, row: [name, value], Td }) => {
      switch (column) {
        case "property":
          return (
            <Td key={key}>
              <div>{name}</div>
            </Td>
          );
        case "new-value":
          return <Td key={key}>{value.value}</Td>;
        case "initial-value":
          return <Td key={key}>{initialOptions[name]?.value}</Td>;
      }
    },
    [initialOptions],
  );
  return (
    <ResponsiveTable
      ariaLabel={"Topic configuration"}
      columns={columns}
      data={data}
      renderHeader={({ column, Th, key }) => {
        switch (column) {
          case "property":
            return (
              <Th width={40} key={key}>
                {t("CreateTopic.review_table.property")}
              </Th>
            );
          case "new-value":
            return (
              <Th key={key}> {t("CreateTopic.review_table.new_value")}</Th>
            );
          case "initial-value":
            return (
              <Th key={key}> {t("CreateTopic.review_table.initial_value")}</Th>
            );
        }
      }}
      renderCell={renderCell}
      variant={TableVariant.compact}
    />
  );
}
