import { Meta, StoryObj } from "@storybook/react";
import { ResetOffset } from "./ResetOffset";

export default {
  component: ResetOffset,
} as Meta<typeof ResetOffset>;

type Story = StoryObj<typeof ResetOffset>;

export const Default: Story = {
  args: {
    consumerGroupName: "console-consumer-01",
    topics: [
      { topicId: "123", topicName: "console_datagen_002-a" },
      { topicId: "456", topicName: "console_datagen_002-b" },
      { topicId: "234", topicName: "console_datagen_002-c" },
      { topicId: "431", topicName: "console_datagen_002-d" },
    ],
    selectTopic: "allTopics",
    partitions: [1, 2, 3],
    selectOffset: "latest",
    isLoading: false,
  },
};
