import type { Meta, StoryObj } from "@storybook/react";

import { TopicsPartitionsCard } from "./TopicsPartitionsCard";

const meta: Meta<typeof TopicsPartitionsCard> = {
  component: TopicsPartitionsCard,
};

export default meta;
type Story = StoryObj<typeof TopicsPartitionsCard>;

export const WithData: Story = {
  args: {
    isLoading: false,
    topicsReplicated: 400000,
    topicsUnderReplicated: 400000,
    partitions: 999999,
  },
};
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
