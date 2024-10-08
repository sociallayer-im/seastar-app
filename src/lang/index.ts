import {en} from '@/lang/en'
import {zh} from '@/lang/zh'

export type Dictionary = typeof en;

export const dictionaries = {en, zh}
const supportedLangs = Object.keys(dictionaries) as Array<keyof typeof dictionaries>


export function getLangType(acceptLanguage: string | null, cookieLang?: string): keyof typeof dictionaries {
    const targetLang = cookieLang as keyof typeof dictionaries | undefined
    if (targetLang && dictionaries[targetLang]) {
        return targetLang
    }

    if (!acceptLanguage) return 'en'

    const targetLangFromHeader = acceptLanguage.split(',')[0]
    const findLang = supportedLangs.find(lang => targetLangFromHeader.includes(lang))

    return findLang || 'en'
}


export function getLang(type?: keyof typeof dictionaries): Dictionary {
    return type ? dictionaries[type] : en
}
