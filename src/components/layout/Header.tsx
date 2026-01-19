import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { signOut } from "@/app/login/actions";

export function Header() {
    return (
        <header className="fixed top-0 left-0 w-full h-16 border-b border-border bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-background">WM</span>
                </div>
                <h1 className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    時間集計アプリ
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt="@user" />
                                <AvatarFallback className="bg-primary/10 text-primary">NM</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">ねまこ</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    user@example.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <form action={signOut}>
                            <button type="submit" className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left">
                                ログアウト
                            </button>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
