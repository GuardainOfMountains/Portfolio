import { Terminal, Menu, X, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Get the current path from window.location
    const path = window.location.pathname.split("/").pop() || "index.html";
    setCurrentPath(path === "" ? "index.html" : path);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="index.html" className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest hover:text-primary/80 transition-colors" aria-label="Go to homepage">
            <Terminal className="w-5 h-5" />
            <span>Montana's.sys</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            // Determine active state
            // Handle home page case: both "index.html" and "/" should match
            const isActive = 
              (currentPath === "index.html" || currentPath === "") && item.href === "index.html" 
              ? true 
              : currentPath === item.href;

            return (
              <a 
                key={item.href} 
                href={item.href}
                className={`text-sm font-mono transition-colors uppercase tracking-wider ${isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
                aria-current={isActive ? "page" : undefined}
              >
                  {item.label}
              </a>
            );
          })}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="ml-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <button
            className="p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-2xl">
          {NAV_ITEMS.map((item) => {
             const isActive = 
              (currentPath === "index.html" || currentPath === "") && item.href === "index.html" 
              ? true 
              : currentPath === item.href;

             return (
              <a
                key={item.href}
                href={item.href}
                className={`text-lg font-mono py-2 border-l-2 pl-4 transition-all ${isActive ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:border-primary hover:text-foreground"}`}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                  {item.label}
              </a>
             );
          })}
        </div>
      )}
    </nav>
  );
}
