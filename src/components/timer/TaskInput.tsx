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
                    {categories.map((category) => (
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
                            <label htmlFor="color" className="text-right text-sm font-medium">
                                カラー
                            </label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={newCatColor}
                                    onChange={(e) => setNewCatColor(e.target.value)}
                                    className="w-12 h-10 p-1 bg-slate-900 border-slate-700 cursor-pointer"
                                />
                                <span className="text-sm text-slate-400 font-mono">{newCatColor}</span>
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
