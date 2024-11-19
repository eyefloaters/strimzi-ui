import { EmptyState, EmptyStateBody, Title } from "@patternfly/react-core";
import { InfoIcon } from "@patternfly/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import type { ResponsiveTableProps } from "./ResponsiveTable";
import { ResponsiveTable } from "./ResponsiveTable";
import {
  columns,
  defaultActions,
  sampleData,
  SampleDataType,
} from "./storybookHelpers";

type ResponsiveTableSampleTypeProps = ResponsiveTableProps<
  SampleDataType,
  (typeof columns)[number]
> & {
  hasActions?: boolean;
  hasCustomActionTestId?: boolean;
  hasCustomOuiaIds?: boolean;
  isRowClickable?: boolean;
  isSortable?: boolean;
  sortAllColumns?: boolean;
  selectedRow?: number;
};
const ResponsiveTableSampleType = (props: ResponsiveTableSampleTypeProps) => (
  <ResponsiveTable {...props} />
);

export default {
  component: ResponsiveTable,
  args: {
    ariaLabel: "Table title",
    minimumColumnWidth: 250,
    data: sampleData,
    columns,
    hasActions: true,
    hasCustomActionTestId: false,
    hasCustomOuiaIds: false,
    isRowClickable: true,
    isSortable: false,
    sortAllColumns: true,
    selectedRow: 3,
    expectedLength: 3,
    onRowClick: fn(),
  },
  argTypes: {
    hasActions: { control: "boolean" },
    isRowClickable: { control: "boolean" },
    isSortable: { control: "boolean" },
    sortAllColumns: { control: "boolean" },
  },
  render: (args) => {
    const sortableColumns =
      args.sortAllColumns === true
        ? args.columns
        : [args.columns[0], args.columns[3]];
    const isColumnSortable = (
      col: (typeof args.columns)[number],
    ): ReturnType<ResponsiveTableProps<any, any>["isColumnSortable"]> =>
      sortableColumns.includes(col)
        ? {
            onSort: () => {},
            label: columnLabels[col],
            columnIndex: args.columns.indexOf(col),
            sortBy: {
              direction: "asc",
              index: args.columns.indexOf(col),
            },
          }
        : undefined;
    const columnLabels = {
      name: "Name",
      cloudProvider: "Cloud Provider",
      owner: "Owner",
      region: "Region",
      status: "Status",
      timeCreated: "Creation Time",
    };
    return (
      <ResponsiveTable
        {...args}
        renderHeader={({ column, Th, key }) => (
          <Th key={key}>{columnLabels[column]}</Th>
        )}
        renderCell={({ column, row, colIndex, Td, key }) => (
          <Td key={key} dataLabel={columnLabels[column]}>
            {row[colIndex]}
          </Td>
        )}
        renderActions={({ row, ActionsColumn }) =>
          args.hasActions ? (
            <ActionsColumn
              items={
                // @ts-ignore
                defaultActions(row)
              }
            />
          ) : undefined
        }
        isRowSelected={
          args.selectedRow
            ? ({ rowIndex }) => rowIndex === args.selectedRow! - 1
            : undefined
        }
        isRowDeleted={({ row }) => row[5] === "deleting"}
        isColumnSortable={args.isSortable ? isColumnSortable : undefined}
        onRowClick={args.isRowClickable ? args.onRowClick : undefined}
        setActionCellOuiaId={
          args.hasCustomActionTestId
            ? ({ rowIndex }) => `my-action-row-${rowIndex}`
            : undefined
        }
        setRowOuiaId={
          args.hasCustomOuiaIds
            ? ({ rowIndex }) => `table-row-${rowIndex}`
            : undefined
        }
        tableOuiaId={args.hasCustomOuiaIds ? "table-ouia-id" : undefined}
      >
        <EmptyState
          titleText={
            <Title headingLevel="h4" size="lg">
              Empty state to show when the data is filtered but has no results
            </Title>
          }
          icon={InfoIcon}
          variant={"lg"}
        >
          <EmptyStateBody>
            The <code>children</code> property will be used when no data is
            available as the empty state.
          </EmptyStateBody>
        </EmptyState>
      </ResponsiveTable>
    );
  },
} as Meta<typeof ResponsiveTableSampleType>;

type Story = StoryObj<typeof ResponsiveTableSampleType>;

export const Example: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    sampleData
      .flatMap((row) => row.slice(0, -1))
      .forEach((cell) => {
        expect(canvas.getByText(cell)).toBeInTheDocument();
      });
    await expect(canvas.queryAllByTestId("row-selected")).toHaveLength(1);
    await expect(canvas.queryAllByTestId("row-deleted")).toHaveLength(1);
    const actions = canvas.queryAllByLabelText("Actions");
    await expect(canvas.queryAllByLabelText("Kebab toggle")).toHaveLength(
      sampleData.length - 1 /* deleted lines don't have actions */,
    );

    await userEvent.click(actions[0]);
    await expect(args.onRowClick).not.toHaveBeenCalled();

    const firstRow = canvas.getByText(sampleData[0][0]).parentElement;
    await userEvent.click(firstRow);
    await expect(args.onRowClick).toHaveBeenNthCalledWith(1, {
      row: sampleData[0],
      rowIndex: 0,
    });
  },
};

export const WithoutActions: Story = {
  args: {
    hasActions: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.queryAllByLabelText("Actions")).toHaveLength(0);
  },
};

export const NonClickableRows: Story = {
  args: {
    isRowClickable: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const firstRow = canvas.getByText(sampleData[0][0]).parentElement;
    await userEvent.click(firstRow);
    await expect(args.onRowClick).not.toHaveBeenCalled();
  },
};

export const NoSelectedRow: Story = {
  args: {
    selectedRow: undefined,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByTestId("row-selected")).toHaveLength(0);
  },
};

export const UndefinedDataShowsSkeleton: Story = {
  args: {
    data: undefined,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findAllByText("Loading data")).toHaveLength(3);
  },
};

export const NoResults: Story = {
  args: {
    data: [],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        "Empty state to show when the data is filtered but has no results",
      ),
    ).toBeInTheDocument();
  },
};

export const CustomActionTestId: Story = {
  args: {
    hasCustomActionTestId: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByTestId("my-action-row-0")).toHaveLength(1);
  },
};

export const CustomOuiaIds: Story = {
  args: {
    hasCustomOuiaIds: true,
  },
  play: async ({ canvasElement, args }) => {
    await expect(
      canvasElement.querySelectorAll(
        "[data-ouia-component-id='table-ouia-id']",
      ),
    ).toHaveLength(1);
    await expect(
      canvasElement.querySelectorAll("[data-ouia-component-id='table-row-0']"),
    ).toHaveLength(1);
  },
};

export const Sortable: Story = {
  args: {
    isSortable: true,
  },
  play: async ({ canvasElement, args }) => {
    await expect(
      canvasElement.querySelectorAll("[class~='pf-v6-c-table__sort']"),
    ).toHaveLength(args.columns.length);
  },
};

export const PartiallySortable: Story = {
  args: {
    isSortable: true,
    sortAllColumns: false,
  },
  play: async ({ canvasElement, args }) => {
    await expect(
      canvasElement.querySelectorAll("[class~='pf-v6-c-table__sort']"),
    ).toHaveLength(2);
  },
};
