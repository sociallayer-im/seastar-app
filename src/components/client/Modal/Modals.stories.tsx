import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import useModal from '@/components/client/Modal/useModal'
import Moadls from './Modals'

const  TestModal = () => {
    const { openModal } = useModal()

    return <div>
        <button className="btn" onClick={() => openModal({
            content: () => <div style={{padding: '30px', boxShadow: '1px 2px 5px #666'}}>Modal Content</div>,
        })}>Open Modal</button>
        <div style={{zIndex: '999', position: 'relative'}}><Moadls></Moadls></div>
    </div>
}


const meta: Meta<typeof TestModal> = {
    component: TestModal,
    title: 'Auth/Modal',
}

export default meta

type Story = StoryObj<typeof meta>


export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const btn = canvas.getByRole('button')

        await expect(btn).toBeInTheDocument()
        await userEvent.click(btn)
        await expect(canvas.getByText('Modal Content')).toBeInTheDocument()

        const shell = canvas.getByTestId('modal-shell')
        await userEvent.click(shell)
        setTimeout(async () => {
            await expect(canvas.queryByText('Modal Content')).not.toBeInTheDocument()
        }, 100)
    }
}
