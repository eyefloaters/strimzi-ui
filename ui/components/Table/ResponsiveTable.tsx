import { TableSkeleton } from "@/components/Table/TableSkeleton";
import type {
  ActionsColumnProps,
  TableVariant,
  TbodyProps,
  TdProps,
  ThProps,
} from "@patternfly/react-table";
import {
  ActionsColumn,
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import {
  cloneElement,
  CSSProperties,
  forwardRef,
  memo,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Ref,
  useCallback,
  useMemo,
  useState,
} from "react";
import useResizeObserver from "use-resize-observer";
import "./ResponsiveTable.css";

export type RenderHeaderCb<TCol> = (props: {
  Th: typeof Th;
  key: string;
  column: TCol;
  colIndex: number;
}) => ReactElement<ResponsiveThProps>;

export type RenderCellCb<TRow, TCol> = (props: {
  Td: typeof Td;
  key: string;
  column: TCol;
  colIndex: number;
  rowIndex: number;
  row: TRow;
}) => ReactElement<ResponsiveTdProps>;

export type RenderActionsCb<TRow> = (props: {
  ActionsColumn: typeof ActionsColumn;
  row: TRow;
  rowIndex: number;
}) => ReactElement<ActionsColumnProps> | undefined;

export type ResponsiveTableProps<TRow, TCol> = {
  ariaLabel: string;
  minimumColumnWidth?: number;
  stackedLayoutBreakpoint?: number;
  columns: readonly TCol[];
  data: TRow[] | undefined;
  renderHeader: RenderHeaderCb<TCol>;
  renderCell: RenderCellCb<TRow, TCol>;
  renderActions?: RenderActionsCb<TRow>;
  isColumnSortable?: (
    column: TCol,
  ) => (ResponsiveThProps["sort"] & { label: string }) | undefined;
  isRowDeleted?: (props: RowProps<TRow>) => boolean;
  isRowSelected?: (props: RowProps<TRow>) => boolean;
  isRowExpandable?: (props: RowProps<TRow>) => boolean;
  getExpandedRow?: (props: RowProps<TRow>) => ReactNode;
  isColumnExpandable?: (
    props: RowProps<TRow> & { column: TCol; colIndex: number },
  ) => boolean;
  getExpandedRowForColumn?: (
    props: RowProps<TRow> & { column: TCol; colIndex: number },
  ) => ReactNode;
  expectedLength?: number;
  onRowClick?: (props: RowProps<TRow>) => void;
  setActionCellOuiaId?: (props: RowProps<TRow>) => string;
  setRowOuiaId?: (props: RowProps<TRow>) => string;
  getRowProps?: (
    props: RowProps<TRow>,
  ) => Omit<TbodyProps, "ref"> & { innerRef?: Ref<HTMLTableSectionElement> };
  tableOuiaId?: string;
  variant?: TableVariant;
  disableAutomaticColumns?: boolean;
};

type RowProps<TRow> = { row: TRow; rowIndex: number };

export const ResponsiveTable = <TRow, TCol>({
  ariaLabel,
  minimumColumnWidth = 250,
  stackedLayoutBreakpoint = 400,
  columns,
  data,
  renderHeader,
  renderCell,
  renderActions,
  isColumnSortable,
  isRowDeleted,
  isRowSelected,
  isRowExpandable,
  getExpandedRow,
  isColumnExpandable,
  getExpandedRowForColumn,
  expectedLength = 3,
  onRowClick,
  setActionCellOuiaId,
  setRowOuiaId,
  tableOuiaId,
  getRowProps = () => ({}),
  children,
  variant,
  disableAutomaticColumns = true,
}: PropsWithChildren<ResponsiveTableProps<TRow, TCol>>) => {
  const [expanded, setExpanded] = useState<Record<number, number | undefined>>(
    {},
  );
  const [width, setWidth] = useState(1000);
  let animationHandle: number;
  /**
   * resize the columns on a rAF loop to render the table at 60fps
   * @param width
   */
  const onResize = ({ width }: { width: number | undefined }) => {
    if (animationHandle) {
      cancelAnimationFrame(animationHandle);
    }
    if (width) {
      animationHandle = requestAnimationFrame(() => {
        setWidth(width);
      });
    }
  };
  const { ref } = useResizeObserver({ onResize });
  const showColumns = width >= stackedLayoutBreakpoint;

  const canColumnBeHidden = useCallback(
    (index: number): boolean => {
      if (disableAutomaticColumns === true) {
        return false;
      } else if (showColumns) {
        return index !== 0 && index !== columns.length - 1;
      }
      return true;
    },
    [columns.length, disableAutomaticColumns, showColumns],
  );

  const header = useMemo(() => {
    const headerCols = columns.map((column, index) => {
      const Th = forwardRef<HTMLTableCellElement, ThProps>(
        ({ children, ...props }, ref) => {
          return (
            <ResponsiveTh
              position={index}
              tableWidth={width}
              columnWidth={minimumColumnWidth}
              canHide={canColumnBeHidden(index)}
              sort={isColumnSortable ? isColumnSortable(column) : undefined}
              {...props}
              ref={ref}
            >
              {children}
            </ResponsiveTh>
          );
        },
      );
      Th.displayName = "ResponsiveThCurried";
      return renderHeader({
        Th,
        key: `header_${column}`,
        column,
        colIndex: index,
      });
    });
    return renderActions ? [...headerCols, <Th key={"actions"} />] : headerCols;
  }, [
    canColumnBeHidden,
    columns,
    isColumnSortable,
    minimumColumnWidth,
    renderHeader,
    renderActions,
    width,
  ]);

  const getTd = useCallback(
    (index: number) => {
      const Td = forwardRef<HTMLTableCellElement, TdProps>(
        ({ children, ...props }, ref) => {
          return (
            <ResponsiveTd
              position={index}
              tableWidth={width}
              columnWidth={minimumColumnWidth}
              canHide={canColumnBeHidden(index)}
              {...props}
              ref={ref}
            >
              {children}
            </ResponsiveTd>
          );
        },
      );
      Td.displayName = "ResponsiveTdCurried";
      return Td;
    },
    [canColumnBeHidden, minimumColumnWidth, width],
  );
  const TdList = useMemo(
    () => columns.map((_, index) => getTd(index)),
    [columns, getTd],
  );

  return (
    <Table
      aria-label={ariaLabel}
      gridBreakPoint=""
      ref={ref}
      className={showColumns ? "" : "pf-m-grid"}
      ouiaId={tableOuiaId}
      variant={variant}
      isStickyHeader={true}
    >
      <Thead>
        <Tr>
          {isRowExpandable && <Th />}
          {header}
        </Tr>
      </Thead>
      {data === undefined && (
        <TableSkeleton
          columns={columns.length}
          rows={expectedLength}
          getTd={getTd}
        />
      )}
      {data?.map((row, rowIndex) => {
        const deleted =
          isRowDeleted !== undefined && isRowDeleted({ row: row, rowIndex });
        const selected =
          isRowSelected !== undefined && isRowSelected({ row: row, rowIndex });

        const onClick =
          !deleted && onRowClick
            ? () => onRowClick({ row, rowIndex })
            : undefined;
        const cells = columns.map((column, colIndex) => {
          const cell = renderCell({
            Td: TdList[colIndex],
            key: `row_${rowIndex}_cell_${column}`,
            column,
            colIndex,
            rowIndex,
            row,
          });
          const columnExpandable =
            isColumnExpandable &&
            isColumnExpandable({
              column,
              colIndex,
              rowIndex,
              row,
            });
          const rowExpandable =
            isRowExpandable &&
            isRowExpandable({ rowIndex, row }) &&
            colIndex === 0;
          const isExpanded = expanded[rowIndex] === colIndex;
          return columnExpandable
            ? cloneElement(cell, {
                compoundExpand: {
                  isExpanded,
                  rowIndex: rowIndex,
                  expandId: `${rowIndex}-${colIndex}`,
                  columnIndex: colIndex,
                  onToggle: () =>
                    setExpanded((e) => ({
                      ...e,
                      [rowIndex]: isExpanded ? undefined : colIndex,
                    })),
                },
              })
            : cell;
        });
        const action = !deleted && renderActions && (
          <ResponsiveTd
            position={columns.length}
            tableWidth={width}
            columnWidth={minimumColumnWidth}
            canHide={false}
            isActionCell={true}
            data-testid={
              setActionCellOuiaId
                ? setActionCellOuiaId({ row, rowIndex })
                : `actions-for-row-${rowIndex}`
            }
          >
            {renderActions({
              rowIndex,
              row,
              ActionsColumn: BoundActionsColumn,
            })}
          </ResponsiveTd>
        );
        const rowExpanded = expanded[rowIndex] !== undefined;
        const rowExpandable =
          isRowExpandable && isRowExpandable({ rowIndex, row });
        const { innerRef, ...rowProps } = getRowProps({ row, rowIndex });
        return (
          <Tbody
            key={`tr-${rowIndex}`}
            data-index={rowIndex}
            isExpanded={rowExpanded}
            {...rowProps}
            ref={innerRef}
          >
            <DeletableRow
              isDeleted={deleted}
              isSelected={selected}
              onClick={onClick}
              rowOuiaId={setRowOuiaId?.({ row, rowIndex })}
            >
              {rowExpandable && (
                <Td
                  expand={{
                    rowIndex,
                    expandId: `${rowIndex}`,
                    isExpanded: expanded[rowIndex] === 0,
                    onToggle: () =>
                      setExpanded((e) => ({
                        ...e,
                        [rowIndex]: expanded[rowIndex] === 0 ? undefined : 0,
                      })),
                  }}
                />
              )}
              {cells}
              {action}
            </DeletableRow>
            {getExpandedRowForColumn &&
              rowExpanded &&
              expanded[rowIndex] !== undefined && (
                <Tr isExpanded={rowExpanded}>
                  <Td colSpan={columns.length} noPadding={true}>
                    <ExpandableRowContent>
                      {getExpandedRowForColumn({
                        rowIndex,
                        colIndex: expanded[rowIndex]!,
                        column: columns[expanded[rowIndex]!],
                        row,
                      })}
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              )}
            {getExpandedRow && rowExpanded && (
              <Tr isExpanded={rowExpanded}>
                <Td colSpan={columns.length + 1} noPadding={true}>
                  <ExpandableRowContent>
                    {getExpandedRow({
                      rowIndex,
                      row,
                    })}
                  </ExpandableRowContent>
                </Td>
              </Tr>
            )}
          </Tbody>
        );
      })}
      {data?.length === 0 && (
        <Tbody>
          <Tr>
            <Td colSpan={columns.length}>{children}</Td>
          </Tr>
        </Tbody>
      )}
    </Table>
  );
};

export type ResponsiveThProps = {
  position: number;
  tableWidth: number;
  columnWidth: number;
  canHide: boolean;
} & Omit<ThProps, "ref">;
export const ResponsiveTh = memo(
  forwardRef<HTMLTableCellElement, ResponsiveThProps>((props, ref) => {
    const {
      tableWidth,
      columnWidth,
      position,
      canHide,
      className = "",
      children,
      ...otherProps
    } = props;
    const responsiveClass =
      canHide && tableWidth < columnWidth * (position + 1)
        ? "pf-m-hidden"
        : "pf-m-visible";

    return (
      <Th
        ref={ref}
        className={`${responsiveClass} ${className}`}
        {...otherProps}
      >
        {children}
      </Th>
    );
  }),
);
ResponsiveTh.displayName = "ResponsiveTh";

export type ResponsiveTdProps = {
  position: number;
  tableWidth: number;
  columnWidth: number;
  canHide: boolean;
} & Omit<TdProps, "ref">;
export const ResponsiveTd = memo(
  forwardRef<HTMLTableCellElement, ResponsiveTdProps>((props, ref) => {
    const {
      tableWidth,
      columnWidth,
      position,
      canHide,
      className = "",
      children,
      ...otherProps
    } = props;
    const responsiveClass =
      canHide && tableWidth < columnWidth * (position + 1)
        ? "pf-m-hidden"
        : "pf-m-visible";

    return (
      <Td
        ref={ref}
        className={`${responsiveClass} ${className}`}
        {...otherProps}
      >
        {children}
      </Td>
    );
  }),
);
ResponsiveTd.displayName = "ResponsiveTd";

export type DeletableRowProps = PropsWithChildren<{
  isSelected: boolean;
  isDeleted: boolean;
  onClick?: () => void;
  rowOuiaId?: string;
  style?: CSSProperties;
}>;
export const DeletableRow = memo<DeletableRowProps>(
  ({ isDeleted, isSelected, onClick, children, rowOuiaId, style }) => {
    return (
      <Tr
        onRowClick={(e) => {
          if (e?.target instanceof HTMLElement) {
            if (!["a", "button"].includes(e.target.tagName.toLowerCase())) {
              onClick && onClick();
            }
          }
        }}
        isClickable={!isDeleted && !!onClick}
        isSelectable={!!onClick}
        ouiaId={rowOuiaId}
        isRowSelected={isSelected}
        className={isDeleted ? "mas--ResponsiveTable__Tr--deleted" : undefined}
        data-testid={[isSelected && "row-selected", isDeleted && "row-deleted"]
          .filter((v) => !!v)
          .join(" ")}
        role={"row"}
        style={style}
      >
        {children}
      </Tr>
    );
  },
);
DeletableRow.displayName = "DeletableRow";

const BoundActionsColumn = forwardRef<HTMLElement, ActionsColumnProps>(
  (props, ref) => {
    return (
      <ActionsColumn
        {...props}
        popperProps={{
          enableFlip: true,
          flipBehavior: ["bottom-end", "top-end"],
          appendTo: () =>
            document.getElementsByClassName(
              "pf-v6-c-scroll-outer-wrapper",
            )[0] || document.getElementsByTagName("main")[0],
        }}
        ref={ref}
      />
    );
  },
);
BoundActionsColumn.displayName = "ActionsColumn";
