import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'

export default async function EventHome({params: {grouphandle}}:{params: {grouphandle: string}}) {
    return <GroupEventHome groupHandle={grouphandle} />
}
