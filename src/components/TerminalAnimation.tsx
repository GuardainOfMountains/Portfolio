export default function TerminalAnimation() {
  return (
    <div className="bg-secondary/20 p-8 border border-border font-mono text-sm relative">
      <div className="absolute top-0 left-0 bg-foreground text-background px-2 py-1 text-xs font-bold">
        ~/init.sh
      </div>
      <div className="space-y-4 mt-4 text-muted-foreground">
        <p>
          <span className="text-green-500">➜</span>{" "}
          <span className="text-foreground">whoami</span>
        </p>
        <p>Montana</p>
        <p>
          <span className="text-green-500">➜</span>{" "}
          <span className="text-foreground">cat role.txt</span>
        </p>
        <p>Platform / DevX / UX</p>
        <p>
          <span className="text-green-500">➜</span>{" "}
          <span className="text-foreground">echo $FOCUS</span>
        </p>
        <p>Making systems fast and low-friction.</p>
        <p>
          <span className="text-green-500">➜</span>{" "}
          <span className="text-foreground">
            ./optimize.sh --target=infrastructure
          </span>
        </p>
        <p className="animate-pulse">Running diagnostics...</p>
      </div>
    </div>
  );
}
