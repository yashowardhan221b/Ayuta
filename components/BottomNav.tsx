"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./navItems";
import { NAV_ICONS } from "./icons";
import { haptic } from "@/lib/feedback";

export default function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => i.primary);
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-bg2/80 backdrop-blur-xl">
      <div className="flex">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => haptic(8)}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[54px] justify-center text-[10px] transition-colors ${
                active ? "text-text" : "text-dim"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-glow"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-grad"
                  style={{ boxShadow: "0 0 10px var(--accent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="leading-none"
                style={{ color: active ? "var(--accent)" : undefined }}
              >
                {(() => {
                  const Ico = NAV_ICONS[item.iconKey];
                  return Ico ? <Ico size={22} /> : item.icon;
                })()}
              </motion.span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
