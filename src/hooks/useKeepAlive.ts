import { useEffect } from 'react'

const PING_INTERVAL = 5 * 60 * 1000 // 5分ごと

/**
 * Render無料プランのサーバースリープを防止するため、
 * 定期的にヘルスチェックAPIにpingを送るフック
 */
export function useKeepAlive() {
    useEffect(() => {
        const ping = () => {
            fetch('/api/health').catch(() => {
                // エラーは無視（ネットワーク切断時など）
            })
        }

        // 初回ping
        ping()

        const interval = setInterval(ping, PING_INTERVAL)

        return () => clearInterval(interval)
    }, [])
}
