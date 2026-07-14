"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JumpNavItem {
  id: string;
  label: string;
}

interface SectionJumpNavProps {
  items: JumpNavItem[];
}

export function SectionJumpNav({ items }: SectionJumpNavProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Show nav only after user scrolls a bit
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Observe sections to track active one
  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80; // account for sticky header
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  if (items.length < 2) return null;

  return (
    <div
      className={cn(
        "fixed left-3 top-1/2 z-40 -translate-y-1/2 transition-all duration-300",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "relative flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background/90 p-1.5 shadow-xl backdrop-blur-md transition-all duration-300",
          collapsed ? "w-10" : "w-44",
        )}
      >
        {/* Header */}
        <div className="mb-1 flex items-center justify-between px-1">
          {!collapsed && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <LayoutList className="size-3" />
              Seksyen
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "ml-auto flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            )}
            aria-label={collapsed ? "Buka navigasi" : "Tutup navigasi"}
          >
            {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </button>
        </div>

        {/* Nav items */}
        <div className="overflow-y-auto" style={{ maxHeight: "min(60vh, 400px)" }}>
          {items.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                title={label}
                className={cn(
                  "group relative flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "block h-1.5 w-1.5 shrink-0 rounded-full transition-all",
                    isActive ? "bg-primary-foreground" : "bg-muted-foreground/40 group-hover:bg-foreground/40",
                  )}
                />
                {!collapsed && (
                  <span className="line-clamp-1 leading-tight">{label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
