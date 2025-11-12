import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../components/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: { control: 'radio', options: ['default', 'sm', 'lg', 'icon'] },
    asChild: { control: 'boolean' },
    children: { control: 'text' },
  },
  render: (args) => {
    return <Button {...args} />;
  },
  args: {
    children: 'Button default',
    variant: 'default',
    size: 'default',
    onClick: fn(),
  }, 
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Outline: Story = { args: { variant: 'outline', children: 'Outline' } };
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};
export const Large: Story = { args: { size: 'lg', children: 'Large Button' } };
export const Small: Story = { args: { size: 'sm', children: 'Small Button' } };
export const IconOnly: Story = {
  args: { size: 'icon', children: '★', 'aria-label': 'Star' },
};
