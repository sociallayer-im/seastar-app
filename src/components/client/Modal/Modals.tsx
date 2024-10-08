'use client'

import useModal from '@/components/client/Modal/useModal'

export default function Modals () {
    const { state } = useModal()

    return <div>
        {
            state.map(({ id, content }) => {
                return <div key={id}>
                    {content}
                </div>
            })
        }
    </div>
}
