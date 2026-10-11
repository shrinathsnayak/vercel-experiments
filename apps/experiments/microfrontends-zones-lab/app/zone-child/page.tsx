export default function ZoneChildPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  return (
    <ZoneChildInner searchParams={searchParams} />
  );
}

async function ZoneChildInner({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  const sp = await searchParams;
  const zone = sp.zone ?? 'docs';
  return (
    <div className="min-h-[240px] bg-background p-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Zone child</p>
      <h1 className="mt-1 text-xl font-semibold">{zone} microfrontend</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Concrete iframe stand-in for a separately deployed zone. In production, Vercel microfrontends/zones
        route by path to different projects instead of embedding.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>Owns its UI under a basePath</li>
        <li>Shares shell chrome only via contract (nav, auth cookies)</li>
        <li>Deployed independently with its own lifecycle</li>
      </ul>
    </div>
  );
}
