export interface NavItem {
  href: string;
  label: string;
  icon: string; // emoji
  primary?: boolean; // shown in the mobile bottom bar
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "🏠", primary: true },
  { href: "/log", label: "Log time", icon: "➕", primary: true },
  { href: "/stats", label: "Stats", icon: "📊", primary: true },
  { href: "/achievements", label: "Awards", icon: "🏅", primary: true },
  { href: "/ideas", label: "Ideas", icon: "💡" },
  { href: "/settings", label: "Settings", icon: "⚙️", primary: true },
];
