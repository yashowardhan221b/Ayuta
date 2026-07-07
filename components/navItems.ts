export interface NavItem {
  href: string;
  label: string;
  icon: string; // emoji fallback
  iconKey: string; // key into NAV_ICONS custom set
  primary?: boolean; // shown in the mobile bottom bar
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "🏠", iconKey: "home", primary: true },
  { href: "/portfolio", label: "Portfolio", icon: "🦋", iconKey: "portfolio", primary: true },
  { href: "/log", label: "Log time", icon: "➕", iconKey: "log", primary: true },
  { href: "/profile", label: "Profile", icon: "🧭", iconKey: "profile", primary: true },
  { href: "/stats", label: "Stats", icon: "📊", iconKey: "stats" },
  { href: "/achievements", label: "Awards", icon: "🏅", iconKey: "awards" },
  { href: "/ideas", label: "Ideas", icon: "💡", iconKey: "ideas" },
  { href: "/settings", label: "Settings", icon: "⚙️", iconKey: "settings", primary: true },
];
