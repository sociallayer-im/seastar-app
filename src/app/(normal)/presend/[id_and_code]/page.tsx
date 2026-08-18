import {redirect} from 'next/navigation'

export default async function Present(props:{params: Promise<{id_and_code: string}>}) {
    const params = await props.params
    const {id_and_code} = params

    const voucherId = id_and_code.split('_')[0]
    const code = id_and_code.split('_')[1]


    redirect(`/voucher/${voucherId}${code ? `?code=${code}` : ''}`)
}