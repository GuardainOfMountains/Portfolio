import React, { Suspense } from "react";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/Section";
import { PROFILE } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TerminalAnimation = React.lazy(() => import("@/components/TerminalAnimation"));

export default function About() {
  return (
    <Layout>
      <div className="pt-16">
        <Section id="about" className="grid md:grid-cols-2 gap-12 items-start">
            <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8 uppercase">
                About Me
            </h2>
            <div className="text-xl md:text-2xl font-mono font-medium leading-tight mb-8">
                Systems Engineer & Infrastructure Developer with a maker approach to automation and user experience.
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
             I spent years organizing sound files for music production before I knew what a cloud server was, I just needed a better system, so I built one. I'm not tied to any one tool or medium—I just build things that are useful. If it helps someone work faster or understand something better, that's what keeps me going.
            </p>
            <div className="flex flex-wrap gap-2 mt-8">
                {PROFILE.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="rounded-none px-3 py-1 text-sm font-mono font-normal">
                    {skill}
                </Badge>
                ))}
            </div>
            </div>
            <Suspense fallback={<Skeleton className="h-[300px] w-full bg-secondary/20" />}>
              <TerminalAnimation />
            </Suspense>
        </Section>
      </div>
    </Layout>
  );
}
