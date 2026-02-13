import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs font-mono mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEMS_ONLINE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            I BUILD TOOLS <br />
            <span className="text-muted-foreground">THAT HELPS PEOPLE</span> <br />
            WORK BETTER.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 font-light">
           Builder and problem-solver focused on practical tools and systems. 
          I make things useful whether that's software, infrastructure, or something creative.
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="projects.html">
              <Button size="lg" className="rounded-none text-lg px-8 h-14 bg-foreground text-background hover:bg-foreground/90 cursor-pointer">
                View System Logs
              </Button>
            </a>
            <a href="contact.html">
              <Button size="lg" variant="outline" className="rounded-none text-lg px-8 h-14 border-foreground/20 hover:bg-secondary cursor-pointer">
                Establish Connection
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
