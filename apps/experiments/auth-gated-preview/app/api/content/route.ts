import { contentFor, COOKIE } from '../../../logic';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const unlocked = cookie.split(';').some((p) => p.trim() === `${COOKIE}=1`);
  return Response.json({ content: contentFor(unlocked), unlocked });
}
