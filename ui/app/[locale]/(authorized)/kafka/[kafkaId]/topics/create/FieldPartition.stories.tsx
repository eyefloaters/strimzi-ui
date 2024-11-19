import { Meta, StoryObj } from "@storybook/react";
import { FieldPartitions } from "./FieldPartitions";

const meta: Meta<typeof FieldPartitions> = {
  component: FieldPartitions,
};

export default meta;
type Story = StoryObj<typeof FieldPartitions>;

export const Default: Story = {
  args: {
    partitions: 3,
    invalid: false,
    backendError: false,
  },
};

export const InvalidState: Story = {
  args: {
    partitions: 1,
    invalid: true,
    backendError: "Backend error message",
  },
};
