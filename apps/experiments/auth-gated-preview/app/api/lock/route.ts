import { COOKIE, contentFor } from '../../../logic';

export async function POST() {
  return Response.json(
    { content: contentFor(false), unlocked: false },
    { headers: { 'set-cookie': `${COOKIE}=; Path=/; Max-Age=0` } },
  );
}
