import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import LangSwitcher from '@/components/client/LangSwitcher'

const meta: Meta<typeof LangSwitcher> = {
    component: LangSwitcher,
    title: 'Auth/LangSwitcher',
    parameters: {
        layout: 'centered',
    },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        value: 'en',
        refresh: false
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const langButton = canvas.getByRole('button')

        // Test if the language button is rendered
        await expect(langButton).toBeInTheDocument()

        // Test clicking the language button to open the dropdown
        await userEvent.click(langButton)
        const dropdown = canvas.getByRole('list')
        await expect(dropdown).toBeInTheDocument()

        // Test selecting a different language
        const zhOption = canvas.getByText('ZH')
        await userEvent.click(zhOption)
        await expect(document.cookie).toContain('lang=zh')
    },
}
