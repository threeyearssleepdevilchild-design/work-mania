"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2 } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";

type TimerDisplayProps = {
    description: string;
    categoryId: string | null;
};

export function TimerDisplay({ description, categoryId }: TimerDisplayProps) {
    const { isPlaying, seconds, isLoading, toggleTimer } = useTimer();

    // 時間のフォーマット関数 (HH:MM:SS)
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // 【追加機能】ブラウザのタブタイトルを動的に変更
    useEffect(() => {
        if (isPlaying) {
            document.title = `▶ ${formatTime(seconds)} - 作業マニア`;
        } else {
            document.title = "作業マニア | Work Mania";
        }
    }, [seconds, isPlaying]);

    // 【追加機能】スペースキーでスタート/ストップ
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 入力フォームにいる時は反応させない
            // Dialogが開いているときも反応させない方が良いが、簡易的にはInput系を除外
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (event.code === "Space") {
                event.preventDefault(); // スクロール防止
                // ロード中は操作させない
                if (!isLoading) {
                    toggleTimer(description, categoryId);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleTimer, isLoading, description, categoryId]); // description, categoryId を依存配列に追加

    const handleToggle = () => {
        toggleTimer(description, categoryId);
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 w-full max-w-4xl mx-auto">
            <div className="text-[12vw] sm:text-[120px] leading-none font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
                {formatTime(seconds)}
            </div>

            <div className="flex items-center gap-6 mt-12">
                {isLoading ? (
                    <Button
                        size="lg"
                        disabled
                        className="h-20 w-20 rounded-full text-xl bg-slate-800 transition-all opacity-50 cursor-not-allowed"
                    >
                        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    </Button>
                ) : !isPlaying ? (
                    <Button
                        size="lg"
                        className="h-20 w-20 rounded-full text-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer"
                        onClick={handleToggle}
                    >
                        <Play className="h-10 w-10 fill-current ml-1" />
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        variant="destructive"
                        className="h-20 w-20 rounded-full text-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer"
                        onClick={handleToggle}
                    >
                        <Pause className="h-10 w-10 fill-current" />
                    </Button>
                )}
            </div>

            {/* 操作ガイドを表示 */}
            <p className="mt-8 text-sm text-muted-foreground opacity-50">
                Press <span className="font-mono bg-white/10 px-1 rounded">Space</span> to Start/Stop
            </p>
        </div>
    );
}