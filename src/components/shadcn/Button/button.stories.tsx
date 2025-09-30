import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { Button } from './index'

const meta: Meta<typeof Button> =  {
  title: 'Components/Base/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },
    variant: {
      options: ['primary', 'special', 'normal', 'warm', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'white'],
      control: { type: 'select'}
    },
    size: {
      options: ['default', 'xs', 'sm', 'lg', 'icon'],
      control: { type: 'select'}
    }
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  }
}