import {ReactElement, useEffect, useState} from 'react'
import ModalWrapper from '@/components/client/Modal/ModalWrapper'
import LoadingGlobal from '@/components/client/Modal/LoadingGlobal'
import {getScrollBarWidth} from "@/utils"

interface ModalProps {
    content: (close?: () => void) => ReactElement
    onClose?: () => void
    clickOutsideToClose?: boolean
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

export interface ModalState {
    id: string,
    content: ReactElement
}

let memoryState: ModalState[] = []
const listeners: Array<(state: ModalState[]) => void> = []

const dispatch = (state: ModalState[]) => {
    memoryState = state
    listeners.forEach((listener) => {
        listener(state)
    })
}


const openModal = (props: ModalProps) => {
    const id = genId()
    const content = <ModalWrapper
        clickOutsideToClose={props.clickOutsideToClose}
        content={props.content}
        close={() => {props.onClose?.();closeModal(id)}}/>
    const newState = [...memoryState, {content, id}]
    dispatch(newState)
    return id
}

const showLoading = (): string => {
    const id = genId()
    const content = <LoadingGlobal/>
    const newState = [...memoryState, {content, id}]
    dispatch(newState)
    return id
}

const closeModal = (id?: string) => {
    setTimeout(() => {
        if (!id) {
            dispatch([])
        } else {
            const newState = memoryState.filter((modal) => modal.id !== id)
            dispatch(newState)
        }
    }, 10)
}


export default function useModal() {
    const [state, setState] = useState(memoryState)
    useEffect(() => {
        const setFunc = (newState: ModalState[]) => {
            setState(newState)
        }
        listeners.push(setFunc)

        // set body overflow hidden if modal is open, and set padding right to avoid page shift
        // calculate padding right based on scrollbar width
        if (state.length > 0) {
            document.body.style.overflow = 'hidden'
            document.body.style.paddingRight = `${getScrollBarWidth()}px`
        } else {
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
        }

        return () => {
            const index = listeners.indexOf(setFunc)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        state,
        showLoading,
        openModal,
        closeModal
    }
}
