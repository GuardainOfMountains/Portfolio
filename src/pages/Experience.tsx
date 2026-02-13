import { Layout } from "@/components/Layout";
import { Section } from "@/components/Section";
import { PROFILE } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Activity, Check } from "lucide-react";

export default function Experience() {
  return (
    <Layout>
      <div className="pt-16">
        <Section id="experience" title="Experience" subtitle="Regulated environments & clinical workflows">
            <div className="space-y-8">
            {PROFILE.experience.map((job, i) => (
                <Card key={i} className="rounded-none border-border bg-background shadow-none relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-foreground transition-all group-hover:w-2" />
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <CardTitle className="text-2xl font-bold">{job.role} <span className="text-muted-foreground font-normal">@ {job.company}</span></CardTitle>
                    <span className="font-mono text-xs border border-border px-2 py-1 bg-secondary">{job.period}</span>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                    <h4 className="font-mono text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2"><Activity className="w-3 h-3" /> The Problem</h4>
                    <p className="text-foreground/90 leading-relaxed">{job.problem}</p>
                    </div>
                    <div className="space-y-2">
                    <h4 className="font-mono text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> The Solution</h4>
                    <p className="text-foreground/90 leading-relaxed">{job.solution}</p>
                    </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                        {job.tech.map(t => (
                            <span key={t} className="text-xs font-mono text-muted-foreground">#{t}</span>
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
