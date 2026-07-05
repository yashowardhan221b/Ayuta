import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import GlobalTimerBar from "@/components/GlobalTimerBar";
import CelebrationHost from "@/components/CelebrationHost";

export const metadata: Metadata = {
  title: "Ayuta — Time to Mastery",
  description:
    "A gamified time-to-mastery tracker for polymaths. Commit to a Path, log your hours, and climb from Novice to Expert one checkpoint at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="aurora" aria-hidden />
        <CelebrationHost />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <GlobalTimerBar />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-28 pt-4 md:pb-10">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
