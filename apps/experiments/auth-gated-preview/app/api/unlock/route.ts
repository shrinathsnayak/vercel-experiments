import { checkPassword, contentFor, COOKIE } from '../../../logic';

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const password = typeof (json as Record<string, unknown>).password === 'string'
    ? String((json as Record<string, unknown>).password) : '';
  if (!checkPassword(password)) return Response.json({ error: 'Invalid password.' }, { status: 401 });
  return Response.json(
    { content: contentFor(true), unlocked: true },
    { headers: { 'set-cookie': `${COOKIE}=1; Path=/; SameSite=Lax; Max-Age=3600` } },
  );
}
