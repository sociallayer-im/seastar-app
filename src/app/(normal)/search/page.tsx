import SearchPageData, {SearchPageProps} from '@/app/(normal)/search/data'
import {selectLang} from '@/app/actions'
import SearchResult from '@/app/(normal)/search/SearchResult'

export default async function SearchPage(props: SearchPageProps) {
    const {result, tab, keyword} = await SearchPageData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    const {lang} = await selectLang()

    return <SearchResult
        lang={lang} result={result} tab={tab} keyword={keyword} />
}