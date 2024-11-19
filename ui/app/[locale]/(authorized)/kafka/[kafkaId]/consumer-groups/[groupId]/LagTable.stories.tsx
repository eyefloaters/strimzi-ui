import { Meta, StoryObj } from "@storybook/react";
import { LagTable } from "./LagTable";

const sampleData = [
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
];

export default {
  component: LagTable,
} as Meta<typeof LagTable>;
type Story = StoryObj<typeof LagTable>;

export const Default: Story = {
  args: {
    kafkaId: "kafka1",
    offsets: sampleData,
  },
};
