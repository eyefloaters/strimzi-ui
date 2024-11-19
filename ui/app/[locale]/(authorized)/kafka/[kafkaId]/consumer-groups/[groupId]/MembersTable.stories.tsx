import { Meta, StoryObj } from "@storybook/react";
import { MembersTable } from "./MembersTable";

const sampleConsumerGroup = {
  attributes: {
    members: [
      {
        memberId:
          "console-datagen-consumer-0-2-f57582e3-523b-4a1e-97a8-02cb2e3b6592",
        clientId: "console-datagen-consumer-0-2",
        assignments: [
          {
            topicId: "1",
            topicName: "console_datagen_000-a",
            partition: 0,
          },
          {
            topicId: "1",
            topicName: "console_datagen_000-a",
            partition: 1,
          },
          {
            topicId: "1",
            topicName: "console_datagen_000-a",
            partition: 2,
          },
          {
            topicId: "1",
            topicName: "console_datagen_000-b",
            partition: 0,
          },
          {
            topicId: "1",
            topicName: "console_datagen_000-b",
            partition: 1,
          },
          {
            topicId: "1",
            topicName: "console_datagen_000-b",
            partition: 2,
          },
        ],
      },
    ],
    offsets: [
      {
        topicId: "1",
        topicName: "console_datagen_000-a",
        partition: 2,
        lag: 351,
        offset: 3065621,
        logEndOffset: 3065972,
      },
      {
        topicId: "1",
        topicName: "console_datagen_000-a",
        partition: 1,
        lag: 355,
        offset: 3065840,
        logEndOffset: 3066195,
      },
      {
        topicId: "1",
        topicName: "console_datagen_000-a",
        partition: 0,
        lag: 342,
        offset: 3065890,
        logEndOffset: 3066232,
      },
      {
        topicId: "1",
        topicName: "console_datagen_000-b",
        partition: 2,
        lag: 351,
        offset: 3063868,
        logEndOffset: 3064222,
      },
      {
        topicId: "1",
        topicName: "console_datagen_000-b",
        partition: 1,
        lag: 355,
        offset: 3064971,
        logEndOffset: 3065309,
      },
      {
        topicId: "1",
        topicName: "console_datagen_000-b",
        partition: 0,
        lag: 342,
        offset: 3068518,
        logEndOffset: 3068869,
      },
    ],
  },
};

export default {
  component: MembersTable,
} as Meta<typeof MembersTable>;

type Story = StoryObj<typeof MembersTable>;

export const Default: Story = {
  args: {
    kafkaId: "kafka1",
    consumerGroup: sampleConsumerGroup,
  },
};
