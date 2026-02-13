import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-muted-foreground font-mono text-xs mt-auto">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <span>© {SITE_CONFIG.year} {SITE_CONFIG.author}</span>
        <span>
          Status: <span className="text-green-500">●</span> {SITE_CONFIG.status}
        </span>
      </div>
    </footer>
  );
}
