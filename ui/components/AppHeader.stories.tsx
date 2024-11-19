import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  PageSection,
} from "@patternfly/react-core/";
import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "./AppHeader";

const fixedDate = new Date(Date.UTC(2024, 11, 31, 23, 59, 59, 999));

const meta: Meta<typeof AppHeader> = {
  component: AppHeader,
  args: {
    title: "Main Title",
    subTitle: "Sub Title",
  },
  argTypes: {
    title: { control: "text" },
    subTitle: { control: "text" },
    actions: { control: "none" },
    navigation: { control: "none" },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
    staticRefresh: fixedDate
  }
};

export const WithActions: Story = {
  args: {
    staticRefresh: fixedDate,
    actions: [
      <Button key="action1">Action 1</Button>,
      <Button key="action2">Action 2</Button>,
    ],
  },
};

export const WithNavigation: Story = {
  args: {
    staticRefresh: fixedDate,
    navigation: (
      <PageSection>
        <Breadcrumb>
          <BreadcrumbItem to="#">Home</BreadcrumbItem>
          <BreadcrumbItem to="#">Section</BreadcrumbItem>
          <BreadcrumbItem to="#" isActive>
            Page
          </BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    staticRefresh: fixedDate,
    actions: [
      <Button key="action1">Action 1</Button>,
      <Button key="action2">Action 2</Button>,
    ],
    navigation: (
      <PageSection>
        <Breadcrumb>
          <BreadcrumbItem to="#">Home</BreadcrumbItem>
          <BreadcrumbItem to="#">Section</BreadcrumbItem>
          <BreadcrumbItem to="#" isActive>
            Page
          </BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
    ),
  },
};
