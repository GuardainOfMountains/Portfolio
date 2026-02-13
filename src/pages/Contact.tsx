import { Layout } from "@/components/Layout";
import { PROFILE } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="pt-16 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="container mx-auto px-6 max-w-3xl">
           <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 uppercase">
            Get in Touch.
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Currently seeking roles.
            Let's build tools that people love to use.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
             <div className="flex items-center gap-0 border border-border bg-background p-1 pl-4 h-14 w-full md:w-auto min-w-[300px]">
                <span className="font-mono text-muted-foreground mr-4 text-sm">$ mailto:</span>
                <span className="font-mono text-foreground font-bold flex-grow">{PROFILE.email}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2 h-12 w-12 rounded-none hover:bg-secondary"
                    onClick={copyEmail}
                    aria-label="Copy email address"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
             </div>
             <div className="text-sm text-muted-foreground font-mono">
                {copied ? "Address copied to clipboard" : "Click to copy"}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
