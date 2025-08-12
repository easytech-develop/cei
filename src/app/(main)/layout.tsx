"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={cn(
          "flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-0" : "ml-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}