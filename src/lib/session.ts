import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export type SessionData = {
    userId: string
    employeeId: string
    isLoggedIn: boolean
}

const sessionOptions = {
    password: process.env.SESSION_PASSWORD || 'wm-secret-session-key-2024-xK9mP3nQ7rS',
    cookieName: 'workmania-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
    },
}

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies()
    return getIronSession<SessionData>(cookieStore, sessionOptions)
}
