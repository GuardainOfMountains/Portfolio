import { Layout } from "@/components/Layout";
import { Section } from "@/components/Section";
import { PROFILE } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Server, Cpu, Shield, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Projects() {
  return (
    <Layout>
      <div className="pt-16">
        <Section id="projects" title="Home Lab" subtitle="Optimization & self-hosted infrastructure">
            {/* Gamification Promo Card */}
            <div className="mb-12">
                <Card className="rounded-none bg-card border-border hover:border-foreground/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold font-mono">
                            <Gamepad2 className="w-5 h-5 text-amber-500" />
                            <span>Terminus — Interactive Learning Game</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            A browser-based terminal adventure. Wake up with memory loss after a virus attack. 
                            Use standard Linux commands (`ls`, `cd`, `grep`, `sudo`) to recover your memory and defeat the Malware.
                        </p>
                        <a href="learning.html">
                            <Button className="rounded-none font-mono">
                                <Terminal className="w-4 h-4 mr-2" />
                                ./start_game.sh
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
            {PROFILE.projects.map((project, i) => (
                <Card key={i} className="rounded-none bg-card border-border hover:border-foreground/50 transition-colors flex flex-col h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-bold font-mono">{project.title}</CardTitle>
                        <div className="p-2 bg-secondary rounded-full">
                            {project.title.includes("Ad") ? <Shield className="w-4 h-4" /> :
                            project.title.includes("Server") ? <Server className="w-4 h-4" /> :
                            project.title.includes("AI") ? <Cpu className="w-4 h-4" /> :
                            <Terminal className="w-4 h-4" />}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-grow">
                    <div>
                        <span className="text-xs font-mono uppercase text-destructive block mb-1">Issue Detected</span>
                        <p className="text-sm text-muted-foreground">{project.problem}</p>
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase text-green-500 block mb-1">Patch Applied</span>
                        <p className="text-sm text-foreground font-medium">{project.solution}</p>
                    </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 mt-auto">
                    <div className="flex flex-wrap gap-2">
                        {project.tech.map(t => (
                            <Badge key={t} variant="outline" className="rounded-none text-[10px] border-border text-muted-foreground font-mono">
                                {t}
                            </Badge>
                        ))}
                    </div>
                </CardFooter>
                </Card>
            ))}
            </div>
        </Section>
      </div>
    </Layout>
  );
}
