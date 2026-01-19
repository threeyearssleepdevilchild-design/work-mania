"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";

import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { LogData, DashboardRange } from "@/hooks/useDashboardData"; // Import LogData type

export function Dashboard() {
    const { totalTime, chartData, logs, isLoading, deleteLog, updateLog, refreshLogs, range, setRange } = useDashboardData();
    const { categories } = useCategories();

    // Edit State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
    const [editHours, setEditHours] = useState(0);
    const [editMinutes, setEditMinutes] = useState(0);

    const handleEditClick = (log: LogData) => {
        setEditingLogId(log.id);
        setEditTitle(log.title);
        // Find category ID from name
        const matchedCat = categories.find(c => c.name === log.category);
        setEditCategoryId(matchedCat ? matchedCat.id : "uncategorized");

        // Calculate hours and minutes from duration
        const h = Math.floor(log.duration / 3600);
        const m = Math.floor((log.duration % 3600) / 60);
        setEditHours(h);
        setEditMinutes(m);

        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingLogId) return;

        const totalDuration = (editHours * 3600) + (editMinutes * 60);

        await updateLog(editingLogId, {
            title: editTitle,
            categoryId: editCategoryId === "uncategorized" ? null : editCategoryId,
            duration: totalDuration
        });

        setIsEditOpen(false);
        setEditingLogId(null);
    };

    const getRangeLabel = () => {
        switch (range) {
            case 'today': return "今日の記録";
            case 'week': return "今週の記録";
            case 'month': return "今月の記録";
            case 'all': return "全期間の記録";
            default: return "記録";
        }
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-12 px-6 flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 px-6 pb-20">
            <Tabs value={range} onValueChange={(v) => setRange(v as DashboardRange)} className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold tracking-tight">ダッシュボード</h2>
                        <Button variant="ghost" size="sm" onClick={refreshLogs} className="text-muted-foreground">
                            更新
                        </Button>
                    </div>
                    <TabsList className="bg-muted/30">
                        <TabsTrigger value="today">今日</TabsTrigger>
                        <TabsTrigger value="week">週間</TabsTrigger>
                        <TabsTrigger value="month">月間</TabsTrigger>
                        <TabsTrigger value="all">全期間</TabsTrigger>
                    </TabsList>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">合計時間</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{totalTime}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-green-400">{getRangeLabel()}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">トップカテゴリ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    {chartData.length > 0 ? [...chartData].sort((a, b) => b.value - a.value)[0].name : "-"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {chartData.length > 0 ? "最多アクティビティ" : "データなし"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">記録回数</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-secondary">{logs.length}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-secondary">完了したセッション</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                        {/* Chart */}
                        <Card className="bg-card/50 backdrop-blur-sm border-white/5 h-full">
                            <CardHeader>
                                <CardTitle>時間配分</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] p-0 pb-4">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                                                itemStyle={{ color: "#fff" }}
                                                formatter={(value: any, name: any, props: any) => {
                                                    const val = Number(value || 0);
                                                    const h = Math.floor(val / 3600);
                                                    const m = Math.floor((val % 3600) / 60);
                                                    // Calculate percent manually if needed, or just show time
                                                    return [`${h}時間 ${m}分`, name];
                                                }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        データがありません
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* List */}
                        <Card className="bg-card/50 backdrop-blur-sm border-white/5 h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>最近のログ</CardTitle>
                                <CardDescription>最新のアクティビティログ</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-[280px] w-full pr-4">
                                    {logs.length > 0 ? (
                                        <div className="space-y-4">
                                            {logs.map((log) => (
                                                <div key={log.id} className="group flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-sm">{log.title}</span>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: log.color }}></span>
                                                            {log.category}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right mr-2">
                                                            <div className="font-mono text-sm font-bold">{log.time}</div>
                                                            <div className="text-xs text-muted-foreground">{log.date}</div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                                            onClick={() => handleEditClick(log)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                            onClick={() => deleteLog(log.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            ログはまだありません
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>ログの修正</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">タスク名</Label>
                                <Input
                                    id="edit-title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">カテゴリ</Label>
                                <Select value={editCategoryId || "uncategorized"} onValueChange={setEditCategoryId}>
                                    <SelectTrigger id="edit-category">
                                        <SelectValue placeholder="カテゴリを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="uncategorized">未分類</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-hours">時間</Label>
                                    <Input
                                        id="edit-hours"
                                        type="number"
                                        min="0"
                                        value={editHours}
                                        onChange={(e) => setEditHours(Number(e.target.value))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-minutes">分</Label>
                                    <Input
                                        id="edit-minutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={editMinutes}
                                        onChange={(e) => setEditMinutes(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>キャンセル</Button>
                            <Button onClick={handleSaveEdit}>保存</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tabs>
        </div>
    );
}
