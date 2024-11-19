import { Toolbar, ToolbarContent } from "@patternfly/react-core";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { ChipFilter } from "./ChipFilter";
import {
  sampleCheckboxFilter,
  sampleCheckboxFilterWithChips,
  sampleSearchFilter,
  sampleSearchFilterWithChips,
} from "./storybookHelpers";

export default {
  component: ChipFilter,
  args: {
    breakpoint: "md",
    filters: {
      Name: sampleSearchFilter,
      Options: sampleCheckboxFilter,
    },
  },
  decorators: (Story) => (
    <Toolbar
      clearAllFilters={() => {
        /* noop */
      }}
    >
      <ToolbarContent>{Story()}</ToolbarContent>
    </Toolbar>
  ),
} as Meta<typeof ChipFilter>;

type Story = StoryObj<typeof ChipFilter>;

export const DesktopMultipleFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = within(canvas.getByTestId("large-viewport-toolbar"));
    await expect(
      toolbar.getByPlaceholderText("Filter by name"),
    ).toBeInTheDocument();
    await expect(
      toolbar.queryByText("Filter by options"),
    ).not.toBeInTheDocument();
  },
};

export const DesktopMultipleFiltersWithChips: Story = {
  args: {
    filters: {
      Name: sampleSearchFilterWithChips,
      Options: sampleCheckboxFilterWithChips,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("foo")).toBeInTheDocument();
    await expect(canvas.getByText("Option 2")).toBeInTheDocument();
  },
};

export const MobileMultipleFilters: Story = {
  parameters: {
    viewport: {
      defaultViewport: "xs",
    },
  },
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   // check that the "desktop" filter is being hidden by the PF toolbar
  //   await expect(
  //     canvasElement
  //       .querySelector(
  //         "[data-ouia-canvasonent-id='chip-filter-selector-large-viewport']",
  //       )
  //       ?.closest(".pf-c-toolbar__item.pf-m-search-filter.pf-m-hidden"),
  //   ).toBeInTheDocument();
  //
  //   // check that the "mobile" filter is in the toggleable group that is shown after clicking the filter button
  //   await expect(
  //     canvasElement
  //       .querySelector(
  //         "[data-ouia-canvasonent-id='chip-filter-selector-small-viewport']",
  //       )
  //       ?.closest(".pf-c-toolbar__group.pf-m-toggle-group"),
  //   ).toBeInTheDocument();
  //
  //   await userEvent.click(canvas.getByLabelText("Show Filters"));
  //
  //   // check that the "mobile" filter is shown in the expanded area of the toolbar
  //   await expect(
  //     canvasElement
  //       .querySelector(
  //         "[data-ouia-canvasonent-id='chip-filter-selector-small-viewport']",
  //       )
  //       ?.closest(".pf-c-toolbar__expandable-content.pf-m-expanded"),
  //   ).toBeInTheDocument();
  //
  //   const toolbar = within(
  //     canvasElement.querySelector(
  //       ".pf-c-toolbar__expandable-content.pf-m-expanded",
  //     ) as HTMLElement,
  //   );
  //
  //   await userEvent.click(toolbar.getByText("Name"));
  //   await userEvent.click(toolbar.getByText("Options"));
  //
  //   expect(
  //     toolbar.queryByPlaceholderText("Filter by name"),
  //   ).not.toBeInTheDocument();
  //   expect(toolbar.getByText("Filter by options")).toBeInTheDocument();
  // },
};

export const MobileMultipleFiltersWithChips: Story = {
  args: {
    filters: {
      Name: sampleSearchFilterWithChips,
      Options: sampleCheckboxFilterWithChips,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "xs",
    },
  },
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   await userEvent.click(canvas.getByLabelText("Show Filters"));
  //
  //   const toolbar = within(
  //     canvasElement.querySelector(
  //       ".pf-c-toolbar__expandable-content.pf-m-expanded",
  //     ) as HTMLElement,
  //   );
  //
  //   expect(toolbar.queryByText("2 filters applied")).not.toBeInTheDocument();
  //   expect(toolbar.getByText("foo")).toBeVisible();
  //   expect(toolbar.getByText("Option 2")).toBeVisible();
  // },
};

export const DesktopSingleFilter: Story = {
  args: {
    filters: {
      Name: sampleSearchFilter,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByTestId("chip-filter-selector-large-viewport"),
    ).not.toBeInTheDocument();
    const toolbar = within(canvas.getByTestId("large-viewport-toolbar"));
    expect(toolbar.getByPlaceholderText("Filter by name")).toBeInTheDocument();
  },
};

export const DesktopSingleFilterWithChips: Story = {
  args: {
    filters: {
      Name: sampleSearchFilterWithChips,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("foo")).toBeInTheDocument();
  },
};

export const MobileSingleFilter: Story = {
  args: {
    filters: {
      Name: sampleSearchFilter,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "xs",
    },
  },
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   await expect(
  //     canvas.queryByTestId("chip-filter-selector-small-viewport"),
  //   ).not.toBeInTheDocument();
  //
  //   await userEvent.click(canvas.getByLabelText("Show Filters"));
  //
  //   const toolbar = within(
  //     canvasElement.querySelector(
  //       ".pf-c-toolbar__expandable-content.pf-m-expanded",
  //     ) as HTMLElement,
  //   );
  //
  //   expect(
  //     toolbar.queryByPlaceholderText("Filter by name"),
  //   ).toBeInTheDocument();
  // },
};

export const MobileSingleFilterWithChips: Story = {
  args: {
    filters: {
      Name: sampleSearchFilterWithChips,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "xs",
    },
  },
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   await userEvent.click(canvas.getByLabelText("Show Filters"));
  //
  //   const toolbar = within(
  //     canvasElement.querySelector(
  //       ".pf-c-toolbar__expandable-content.pf-m-expanded",
  //     ) as HTMLElement,
  //   );
  //   expect(toolbar.getByText("foo")).toBeInTheDocument();
  // },
};
