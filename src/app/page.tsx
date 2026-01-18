"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TaskInput } from "@/components/timer/TaskInput";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // "uncategorized" という値がSelectから返ってきた場合は null として扱う
  const handleCategoryChange = (value: string | null) => {
    if (value === "uncategorized") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(value);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[500px] bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

      <Header />

      <div className="pt-24 pb-12 flex flex-col items-center">
        <TimerDisplay
          description={description}
          categoryId={selectedCategoryId}
        />
        <TaskInput
          description={description}
          setDescription={setDescription}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={handleCategoryChange}
        />
      </div>

      <Dashboard />
    </main>
  );
}
