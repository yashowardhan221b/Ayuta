export interface NavItem {
  href: string;
  label: string;
  icon: string; // emoji
  primary?: boolean; // shown in the mobile bottom bar
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "🏠", primary: true },
  { href: "/portfolio", label: "Portfolio", icon: "🦋", primary: true },
  { href: "/log", label: "Log time", icon: "➕", primary: true },
  { href: "/profile", label: "Profile", icon: "🧭", primary: true },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/achievements", label: "Awards", icon: "🏅" },
  { href: "/ideas", label: "Ideas", icon: "💡" },
  { href: "/settings", label: "Settings", icon: "⚙️", primary: true },
];
