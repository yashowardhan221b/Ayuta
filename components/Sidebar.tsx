"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./navItems";
import { haptic } from "@/lib/feedback";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:sticky md:top-0 md:h-screen md:shrink-0 bg-bg2/30 px-3 py-5">
      <Link href="/" className="px-3 mb-8 block">
        <div className="text-2xl font-black tracking-tight">
          <span className="gradient-text">Ayuta</span>{" "}
          <span className="text-dim text-sm font-normal">अयुत</span>
        </div>
        <div className="text-xs text-dim">time → mastery</div>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => haptic(8)}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-text" : "text-muted hover:text-text hover:bg-surface"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="side-active"
                  className="absolute inset-0 rounded-xl bg-accent-grad opacity-[0.16] border border-accent/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-base relative">{item.icon}</span>
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
