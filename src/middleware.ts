import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // iron-session の Cookie が存在するかチェック（中身のデシリアライズはしない）
    const sessionCookie = request.cookies.get('workmania-session')

    const isLoginPage = request.nextUrl.pathname.startsWith('/login')
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')

    // API ルートはミドルウェアでブロックしない（各APIで認証チェック済み）
    if (isApiRoute) {
        return NextResponse.next()
    }

    // 未ログイン → /login 以外にアクセスしたらリダイレクト
    if (!sessionCookie && !isLoginPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // ログイン済み → /login にアクセスしたらメインページにリダイレクト
    if (sessionCookie && isLoginPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
