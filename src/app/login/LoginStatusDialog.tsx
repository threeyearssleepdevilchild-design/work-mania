"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LoginStatusDialog({ message, error }: { message?: string; error?: string }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (message || error) {
            setOpen(true);
        }
    }, [message, error]);

    const handleClose = () => {
        setOpen(false);
        // Clean URL params
        router.replace('/login');
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className={error ? "text-red-400" : "text-purple-400"}>
                        {error ? "エラー" : "お知らせ"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-300 mt-2">
                        {message || error}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleClose} className="bg-slate-800 hover:bg-slate-700 text-white w-full sm:w-auto">
                        閉じる
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
