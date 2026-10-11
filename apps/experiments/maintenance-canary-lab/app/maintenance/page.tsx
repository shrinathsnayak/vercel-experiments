export default function MaintenancePage() {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-8 text-center">
      <h1 className="text-2xl font-semibold">Maintenance</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Kill switch active (env MAINTENANCE_MODE or Global Config). Traffic is rewritten here.
      </p>
    </div>
  );
}
