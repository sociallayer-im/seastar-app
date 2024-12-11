import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'

export const poppins = Poppins({
    weight: ['400', '600'],
    display: 'block',
    subsets: ['latin'],
})

export const media_icons = localFont({
    src: [{path: './fonts/media_icons.woff2'}],
    display: 'block',
    variable: '--media-icon'
})

export const editor_icons = localFont({
    src: [{path: './fonts/editor_icons.woff'}],
    display: 'block',
    variable: '--editor-icon'
})

export const icon = localFont({
    src: [
        {path:'./fonts/unicon-line/unicons-0.woff'},
        {path:'./fonts/unicon-line/unicons-1.woff'},
        {path:'./fonts/unicon-line/unicons-2.woff'},
        {path:'./fonts/unicon-line/unicons-3.woff'},
        {path:'./fonts/unicon-line/unicons-4.woff'},
        {path:'./fonts/unicon-line/unicons-5.woff'},
        {path:'./fonts/unicon-line/unicons-6.woff'},
        {path:'./fonts/unicon-line/unicons-7.woff'},
        {path:'./fonts/unicon-line/unicons-8.woff'},
        {path:'./fonts/unicon-line/unicons-9.woff'},
        {path:'./fonts/unicon-line/unicons-10.woff'},
        {path:'./fonts/unicon-line/unicons-11.woff'},
        {path:'./fonts/unicon-line/unicons-12.woff'},
        {path:'./fonts/unicon-line/unicons-13.woff'},
        {path:'./fonts/unicon-line/unicons-14.woff'},
        {path:'./fonts/unicon-line/unicons-15.woff'},
        {path:'./fonts/unicon-line/unicons-16.woff'},
        {path:'./fonts/unicon-line/unicons-17.woff'},
        {path:'./fonts/unicon-line/unicons-18.woff'},
        {path:'./fonts/unicon-line/unicons-19.woff'},
        {path:'./fonts/unicon-line/unicons-20.woff'},
    ],
    display: 'block',
    variable: '--font-icon'
})
