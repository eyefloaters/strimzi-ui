import type { Meta, StoryObj } from "@storybook/react";
import { fn,} from "@storybook/test";
import { LimitSelector } from "./LimitSelector";

const meta: Meta<typeof LimitSelector> = {
  component: LimitSelector,
  args: {
    value: 10,
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LimitSelector>;

export const Default: Story = {};

export const InitializedWithDifferentValue: Story = {
  args: {
    value: 20, // Initial value set to 20 for this story
  },
};
