import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'ghost'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    fullWidth: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Devam Et', variant: 'primary', size: 'md' },
};

export const Secondary: Story = {
  args: { children: 'Seç', variant: 'secondary', size: 'md' },
};

export const Danger: Story = {
  args: { children: 'Hesabı Sil', variant: 'danger', size: 'md' },
};

export const Ghost: Story = {
  args: { children: 'Vazgeç', variant: 'ghost', size: 'md' },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Button size="sm">Küçük</Button>
      <Button size="md">Orta</Button>
      <Button size="lg">Büyük</Button>
      <Button size="xl">Çok Büyük</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { children: 'Kaydediliyor...', isLoading: true },
};

export const FullWidth: Story = {
  args: { children: 'Tam Genişlik', fullWidth: true },
};
