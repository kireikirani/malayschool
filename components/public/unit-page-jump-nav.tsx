"use client";

import { useEffect, useState } from "react";
import { SectionJumpNav, type JumpNavItem } from "@/components/public/section-jump-nav";

/**
 * Client wrapper that scans the DOM for section headings and feeds them
 * to the floating SectionJumpNav. Must be rendered alongside UnitPage content.
 */
export function UnitPageJumpNav() {
  const [items, setItems] = useState<JumpNavItem[]>([]);

  useEffect(() => {
    // Find all elements with data-jump-id attribute (set by UnitPage sections)
    function collect() {
      const collected: JumpNavItem[] = [];
      const seen = new Set<string>();

      document.querySelectorAll<HTMLElement>("[data-jump-id]").forEach((el) => {
        const id = el.getAttribute("data-jump-id");
        const label = el.getAttribute("data-jump-label") || el.id || "";
        if (id && label && !seen.has(id)) {
          seen.add(id);
          collected.push({ id, label });
        }
      });

      document.querySelectorAll<HTMLElement>("main section[id]").forEach((el) => {
        const id = el.id;
        if (!id || seen.has(id)) return;
        const heading = el.querySelector<HTMLElement>("h1, h2, h3");
        const label = heading?.textContent?.trim();
        if (label) {
          seen.add(id);
          collected.push({ id, label });
        }
      });

      setItems(collected);
    }

    collect();
    // Re-collect on route changes (soft nav)
    const observer = new MutationObserver(collect);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <SectionJumpNav items={items} />;
}
