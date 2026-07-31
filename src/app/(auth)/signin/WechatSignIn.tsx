import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'

/**
 * WeChat sign-in. A plain link, not a client component: 网页授权 is a full-page
 * redirect flow, and every secret-handling step lives in /api/wechat/* on the
 * server. Nothing here needs JavaScript.
 */
export default function WechatSignIn({lang}: {lang: Dictionary}) {
    return <Button
        asChild
        variant="outline"
        className="w-full justify-start gap-3 font-normal shadow-sm mb-3 sm:mb-0 [&_svg]:size-5">
        <a href="/api/wechat/signin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#07C160">
                <path
                    d="M8.69 4C4.9 4 1.83 6.58 1.83 9.76c0 1.84 1.02 3.48 2.62 4.55l-.65 1.97 2.29-1.15c.82.23 1.69.35 2.6.35.22 0 .44-.01.66-.02a5.5 5.5 0 0 1-.23-1.56c0-3.2 3.1-5.79 6.93-5.79.24 0 .47.01.7.03C15.98 5.7 12.65 4 8.69 4Zm-2.3 3.9a.85.85 0 1 1 0-1.7.85.85 0 0 1 0 1.7Zm4.6 0a.85.85 0 1 1 0-1.7.85.85 0 0 1 0 1.7Z"/>
                <path
                    d="M22.17 13.9c0-2.72-2.68-4.94-5.99-4.94-3.38 0-6.04 2.22-6.04 4.94 0 2.73 2.66 4.94 6.04 4.94.7 0 1.39-.1 2.03-.28l1.86.94-.51-1.6c1.6-.94 2.61-2.35 2.61-4Zm-7.94-.86a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm3.9 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z"/>
            </svg>
            {lang['Sign in with WeChat']}
        </a>
    </Button>
}
