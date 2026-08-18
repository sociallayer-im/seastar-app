import { cookies, headers, type UnsafeUnwrappedCookies, type UnsafeUnwrappedHeaders } from 'next/headers'
import {sanitizeReturnTarget} from '@/utils'

/**
 * Server-side counterpart of utils' returnTarget(): where to send someone once
 * they're signed in. Middleware wrote this cookie from ?return=, keeping the
 * same contract the standalone auth app used.
 *
 * The request's Host is passed explicitly — sanitizeReturnTarget compares the
 * target against the current registrable domain, and there is no
 * window.location to read it from here.
 */
export const returnTargetFromCookies = (): string =>
    sanitizeReturnTarget((cookies() as unknown as UnsafeUnwrappedCookies).get('return')?.value, (headers() as unknown as UnsafeUnwrappedHeaders).get('host'))
