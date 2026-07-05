"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:sticky md:top-0 md:h-screen md:shrink-0 bg-surface/40 px-3 py-5">
      <Link href="/" className="px-3 mb-6 block">
        <div className="text-xl font-semibold tracking-tight">
          Ayuta <span className="text-dim text-sm font-normal">अयुत</span>
        </div>
        <div className="text-xs text-dim">time → mastery</div>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-raised text-text"
                  : "text-muted hover:text-text hover:bg-surface"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
