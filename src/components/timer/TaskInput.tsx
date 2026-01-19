"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";

type TaskInputProps = {
    description: string;
    setDescription: (value: string) => void;
    selectedCategoryId: string | null;
    setSelectedCategoryId: (value: string | null) => void;
};

export function TaskInput({
    description,
    setDescription,
    selectedCategoryId,
    setSelectedCategoryId,
}: TaskInputProps) {
    const { categories, addCategory } = useCategories();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("#a855f7"); // Default purple

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        await addCategory(newCatName, newCatColor);
        setNewCatName("");
        setIsDialogOpen(false);
    };

    return (
        <div className="flex items-center gap-4 w-full max-w-2xl mx-auto mt-8 p-4 bg-muted/20 rounded-xl backdrop-blur-sm border border-white/5 shadow-lg">
            <div
                className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-300"
                style={{
                    backgroundColor: selectedCategoryId
                        ? categories.find(c => c.id.toString() === selectedCategoryId)?.color || "#22d3ee"
                        : "#64748b",
                    color: selectedCategoryId
                        ? categories.find(c => c.id.toString() === selectedCategoryId)?.color || "#22d3ee"
                        : "#64748b"
                }}
            ></div>
            <Input
                placeholder="今、何に取り組んでいますか？"
                className="flex-1 bg-transparent border-none text-lg focus-visible:ring-0 placeholder:text-muted-foreground/50 text-foreground"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <Select value={selectedCategoryId || ""} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-[180px] bg-background/50 border-white/10">
                    <SelectValue placeholder="カテゴリなし" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="uncategorized">未分類</SelectItem>
                    {categories.filter(c => !c.is_archived).map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                ></span>
                                {category.name}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10">
                        <Plus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle>新しいカテゴリを作成</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            タスクを整理するための新しいカテゴリを追加します。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                                名前
                            </label>
                            <Input
                                id="name"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                className="col-span-3 bg-slate-900 border-slate-700"
                                placeholder="例: 開発, デザイン..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium self-start mt-2">
                                カラー
                            </label>
                            <div className="col-span-3">
                                <div className="grid grid-cols-7 gap-2">
                                    {[
                                        "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981",
                                        "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
                                        "#ec4899", "#f43f5e", "#64748b", "#94a3b8", "#1e293b", "#0f172a", "#ffffff"
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border border-slate-700 transition-all ${newCatColor === color ? "ring-2 ring-white scale-110" : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewCatColor(color)}
                                            aria-label={`Select color ${color}`}
                                        />
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-slate-400">選択中:</span>
                                    <span className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: newCatColor }}></span>
                                    <span className="text-xs font-mono text-slate-300">{newCatColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleCreateCategory} className="bg-purple-600 hover:bg-purple-700 text-white">
                            作成する
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
