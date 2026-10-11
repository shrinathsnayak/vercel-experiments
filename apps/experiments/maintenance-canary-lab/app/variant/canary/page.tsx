export default function CanaryVariant() {
  return (
    <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-8">
      <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">Variant B · canary</p>
      <h1 className="mt-2 text-2xl font-semibold">New checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">Percentage rollout via sticky canary cookie.</p>
    </div>
  );
}
