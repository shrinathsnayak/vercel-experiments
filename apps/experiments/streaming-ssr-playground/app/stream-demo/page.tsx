import { Suspense } from 'react';

async function DelayedBlock({
  label,
  ms,
  className,
}: {
  label: string;
  ms: number;
  className?: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return (
    <div className={className}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-fd-muted-foreground">Rendered after ~{ms}ms artificial delay.</p>
    </div>
  );
}

function Fallback({ label }: { label: string }) {
  return (
    <div
      className="animate-pulse rounded-md border border-dashed border-fd-border bg-fd-muted/30 p-4 text-xs text-fd-muted-foreground"
      role="status"
    >
      Loading {label}…
    </div>
  );
}

export default function StreamDemoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Suspense stream demo</h1>
        <p className="text-sm text-fd-muted-foreground">
          Real delayed server components inside Suspense boundaries. Delays are intentional - not
          benchmark results.
        </p>
      </header>
      <Suspense fallback={<Fallback label="header" />}>
        <DelayedBlock
          label="Header section"
          ms={400}
          className="rounded-md border border-fd-border p-4"
        />
      </Suspense>
      <Suspense fallback={<Fallback label="main content" />}>
        <DelayedBlock
          label="Main content"
          ms={900}
          className="rounded-md border border-fd-border p-4"
        />
      </Suspense>
      <Suspense fallback={<Fallback label="footer" />}>
        <DelayedBlock
          label="Footer section"
          ms={600}
          className="rounded-md border border-fd-border p-4"
        />
      </Suspense>
    </div>
  );
}
