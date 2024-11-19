import { Button, Modal } from "@/libs/patternfly/react-core";
import {
  Content,
  DataList,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListItemCells,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@patternfly/react-core";
import { DragDropSort } from "@patternfly/react-drag-drop";
import { useTranslations } from "next-intl";
import { useState } from "react";

export const columns = [
  "timestampUTC",
  "timestamp",
  "offset-partition",
  "size",
  "key",
  "headers",
  "value",
] as const;
export type Column = (typeof columns)[number];

export function useColumnLabels() {
  const t = useTranslations();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const columnLabels: Record<Column, string> = {
    key: t("useColumnLabels.key"),
    headers: t("useColumnLabels.headers"),
    "offset-partition": t("useColumnLabels.offset-partition"),
    value: t("useColumnLabels.value"),
    size: t("useColumnLabels.size"),
    timestamp: t("useColumnLabels.timestamp", { timeZone }),
    timestampUTC: t("useColumnLabels.timestampUTC"),
  };
  return columnLabels;
}

export function ColumnsModal({
  chosenColumns: initialValue,
  onConfirm,
  onCancel,
}: {
  chosenColumns: Column[];
  onConfirm: (columns: Column[]) => void;
  onCancel: () => void;
}) {
  const t = useTranslations();
  const columnLabels = useColumnLabels();
  const [chosenColumns, setChosenColumns] = useState(initialValue);
  const [sortedColumns, setSortedColumns] = useState(getInitialColumns());

  function getInitialColumns() {
    return [
      ...chosenColumns,
      ...columns.filter((c) => !chosenColumns.includes(c)),
    ];
  }

  function colToDraggable(column: Column) {
    return {
      id: column,
      content: (
        <>
          <DataListControl>
            <DataListCheck
              aria-labelledby={`item-${column}-label`}
              id={`item-${column}`}
              otherControls
              isChecked={chosenColumns.includes(column)}
              onChange={(_, checked) => {
                setChosenColumns((cols) =>
                  checked
                    ? [column, ...cols]
                    : cols.filter((cc) => cc !== column),
                );
              }}
            />
          </DataListControl>
          <DataListItemCells
            dataListCells={[
              <DataListCell key={`item-${column}`}>
                <label id={`item-${column}-label`} htmlFor={`item-${column}`}>
                  {columnLabels[column]}
                </label>
              </DataListCell>,
            ]}
          />
        </>
      ),
    };
  }

  return (
    <Modal
      title={t("ColumnsModal.title")}
      isOpen={true}
      variant="small"
      onClose={onCancel}
    >
      <ModalHeader>
        <Content>
          <Content component={"p"}>{t("ColumnsModal.description")}</Content>
        </Content>
      </ModalHeader>
      <ModalBody>
        <DragDropSort
          items={sortedColumns.map(colToDraggable)}
          onDrop={(_, newItems) => {
            setSortedColumns(newItems.map((c) => c.id as Column));
          }}
          variant="DataList"
        >
          <DataList aria-label={t("ColumnsModal.columns")} isCompact />
        </DragDropSort>
      </ModalBody>
      <ModalFooter>
        <Button
          key="save"
          variant="primary"
          onClick={() =>
            onConfirm(sortedColumns.filter((c) => chosenColumns.includes(c)))
          }
          isDisabled={chosenColumns.length === 0}
        >
          {t("ColumnsModal.save")}
        </Button>
        <Button key="cancel" variant="secondary" onClick={onCancel}>
          {t("ColumnsModal.cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
