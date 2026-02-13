import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black flex flex-col">
      <Navbar />
      <main className={`flex-grow ${className || ""}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
