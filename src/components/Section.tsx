import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, title, subtitle, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("py-24 border-b border-border last:border-0", className)}>
      <div className="container mx-auto px-6">
        {(title || subtitle) && (
          <div className="mb-16 max-w-2xl">
            {title && (
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground font-mono text-sm md:text-base tracking-wide">
                {subtitle}
              </p>
            )}
            <div className="h-1 w-20 bg-foreground mt-6" />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
