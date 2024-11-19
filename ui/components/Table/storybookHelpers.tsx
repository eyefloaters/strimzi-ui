import { EmptyState, Title } from "@patternfly/react-core";
import { InfoIcon } from "@patternfly/react-icons";
import type { IAction } from "@patternfly/react-table";
import type { ChipFilterProps } from "./Toolbar";
import { sampleSearchFilter } from "./Toolbar/ChipFilter/storybookHelpers";

export const columns = [
  "name",
  "owner",
  "timeCreated",
  "cloudProvider",
  "region",
  "status",
] as const;

export const columnLabels: { [key in (typeof columns)[number]]: string } = {
  name: "Name",
  owner: "Owner",
  timeCreated: "Time created",
  cloudProvider: "Cloud Provider",
  region: "Region",
  status: "Status",
};

export type SampleDataType = [string, string, string, string, string, string];
export const sampleData: Array<SampleDataType> = [
  [
    "kafka-test-instance",
    "username",
    "about 1 hours ago",
    "Amazon Web Services",
    "US East, N. Virginia",
    "pending",
  ],
  [
    "kafka-test-instance-2",
    "username2",
    "about 2 hours ago",
    "Amazon Web Services 2",
    "US East, N. Virginia 2",
    "pending",
  ],
  [
    "kafka-test-instance-3",
    "username3",
    "about 3 hours ago",
    "Amazon Web Services 3",
    "US East, N. Virginia 3",
    "ready",
  ],
  [
    "kafka-test-instance-4",
    "username4",
    "about 4 hours ago",
    "Amazon Web Services 4",
    "US East, N. Virginia 4",
    "deleting",
  ],
  [
    "kafka-test-instance-5",
    "username5",
    "about 5 hours ago",
    "Amazon Web Services 5",
    "US East, N. Virginia 5",
    "ready",
  ],
];
export const defaultActions = (data: any): IAction[] => [
  {
    title: "Some action",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
    onClick: () => console.log(`clicked on Some action, on row ${data[0]}`),
  },
  {
    title: <a href="https://www.patternfly.org">Link action</a>,
  },
  {
    isSeparator: true,
  },
  {
    title: "Third action",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
    onClick: () => console.log(`clicked on Third action, on row ${data[0]}`),
  },
];

export const sampleToolbarFilters: ChipFilterProps["filters"] = {
  "sample toolbar": sampleSearchFilter,
};

export const SampleEmptyStateNoData = (
  <EmptyState titleText={<Title headingLevel="h4" size="lg">
      Empty state to show when the initial loading returns no data
    </Title>} icon={InfoIcon} variant={"lg"}>
    </EmptyState>
);

export const SampleEmptyStateNoResults = (
  <EmptyState titleText={<Title headingLevel="h4" size="lg">
      Empty state to show when the data is filtered but has no results
    </Title>} icon={InfoIcon} variant={"lg"}>
    </EmptyState>
);
