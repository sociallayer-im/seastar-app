import {redirect} from 'next/navigation'

export default async function Present({params}:{params: {id_and_code: string}}) {
    const {id_and_code} = params

    const voucherId = id_and_code.split('_')[0]
    const code = id_and_code.split('_')[1]


    redirect(`/voucher/${voucherId}${code ? `?code=${code}` : ''}`)

}