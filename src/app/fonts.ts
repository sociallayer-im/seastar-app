import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'

export const poppins = Poppins({
    weight: ['400', '600'],
    display: 'block',
    subsets: ['latin'],
})


export const icon = localFont({
    src: [
        {path:'./fonts/unicon-line/unicons-0.woff2'},
        {path:'./fonts/unicon-line/unicons-1.woff2'},
        {path:'./fonts/unicon-line/unicons-2.woff2'},
        {path:'./fonts/unicon-line/unicons-3.woff2'},
        {path:'./fonts/unicon-line/unicons-4.woff2'},
        {path:'./fonts/unicon-line/unicons-5.woff2'},
        {path:'./fonts/unicon-line/unicons-6.woff2'},
        {path:'./fonts/unicon-line/unicons-7.woff2'},
        {path:'./fonts/unicon-line/unicons-8.woff2'},
        {path:'./fonts/unicon-line/unicons-9.woff2'},
        {path:'./fonts/unicon-line/unicons-10.woff2'},
        {path:'./fonts/unicon-line/unicons-11.woff2'},
        {path:'./fonts/unicon-line/unicons-12.woff2'},
        {path:'./fonts/unicon-line/unicons-13.woff'},
        {path:'./fonts/unicon-line/unicons-14.woff2'},
        {path:'./fonts/unicon-line/unicons-15.woff2'},
        {path:'./fonts/unicon-line/unicons-16.woff2'},
        {path:'./fonts/unicon-line/unicons-17.woff2'},
        {path:'./fonts/unicon-line/unicons-18.woff2'},
        {path:'./fonts/unicon-line/unicons-19.woff2'},
        {path:'./fonts/unicon-line/unicons-20.woff2'},
    ],
    display: 'block',
    variable: '--font-icon'
})
