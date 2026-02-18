import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/session'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    const session = await getIronSession<SessionData>(request, response, {
        password: process.env.SESSION_PASSWORD || 'wm-secret-session-key-2024-xK9mP3nQ7rS',
        cookieName: 'workmania-session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax' as const,
        },
    })

    if (
        !session.isLoggedIn &&
        !request.nextUrl.pathname.startsWith('/login')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // ログイン済みの場合、/login にアクセスしたらメインページにリダイレクト
    if (
        session.isLoggedIn &&
        request.nextUrl.pathname.startsWith('/login')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
