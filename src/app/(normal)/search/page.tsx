import SearchPageData, {SearchPageProps} from '@/app/(normal)/search/data'
import {selectLang} from '@/app/actions'
import SearchResult from '@/app/(normal)/search/SearchResult'

export default async function SearchPage(props: SearchPageProps) {
    const {result, tab, keyword} = await SearchPageData(props)
    const {lang} = await selectLang()

    return <SearchResult
        lang={lang} result={result} tab={tab} keyword={keyword} />
}