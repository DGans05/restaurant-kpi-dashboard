"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      {/* Left: Page title / Greeting */}
      <div className="flex items-center gap-2 pl-10 md:pl-0">
        <h1 className="text-2xl font-display text-foreground">DASHBOARD</h1>
      </div>

      {/* Center: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Zoeken..."
            className="w-full rounded-2xl border border-border bg-secondary/50 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right: User profile + Theme toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="hidden md:flex items-center gap-2 px-3 py-2 h-auto rounded-xl"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-white">
            AM
          </div>
          <span className="text-sm font-medium text-foreground">Aiden Max</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
