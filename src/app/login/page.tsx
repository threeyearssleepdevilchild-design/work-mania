import { login, signup } from './actions'
import { LoginStatusDialog } from './LoginStatusDialog'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const { message, error } = await searchParams

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black text-white p-4">
            <LoginStatusDialog message={message} error={error} />
            <div className="w-full max-w-md p-8 rounded-2xl border border-purple-500/30 bg-slate-950/50 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.25)]">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                        時間集計アプリ
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">ログインして業務を開始</p>
                </div>

                <form className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                            氏名コード
                        </label>
                        <input
                            id="employee_id"
                            name="employee_id"
                            type="text"
                            required
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:bg-slate-900 focus:ring-1 focus:ring-purple-500"
                            placeholder="123456"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                            パスワード
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:bg-slate-900 focus:ring-1 focus:ring-purple-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            formAction={login}
                            className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-purple-500/25 active:scale-[0.98]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                ログイン
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>

                        <button
                            formAction={signup}
                            className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white active:bg-slate-700"
                        >
                            新規登録
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
