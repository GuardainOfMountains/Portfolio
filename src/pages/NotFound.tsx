import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-6">
        <Terminal className="w-16 h-16 text-muted-foreground mb-8 opacity-50" />
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-4 text-destructive">404</h1>
        <h2 className="text-2xl md:text-4xl font-mono mb-8 uppercase tracking-widest">
          System Error: Path Not Found
        </h2>
        <p className="text-xl text-muted-foreground max-w-lg mb-12">
          The requested resource could not be located in the current filesystem. It may have been moved, deleted, or never existed.
        </p>
        <a href="index.html">
          <Button size="lg" className="rounded-none text-lg px-8 h-14 bg-foreground text-background hover:bg-foreground/90 font-mono">
            cd /home
          </Button>
        </a>
      </div>
    </Layout>
  );
}
