import { NextResponse } from 'next/server';
import { createChallenge } from '../../../logic';
import { storeChallenge } from '../../../lib/challenge-store';

export async function POST() {
  const challenge = createChallenge();
  storeChallenge(challenge.challengeId, challenge.answer, challenge.expiresAt);
  return NextResponse.json({
    challengeId: challenge.challengeId,
    question: challenge.question,
    expiresAt: challenge.expiresAt,
    note: 'Educational challenge gate - not Vercel BotID. Integrate @vercel/botid for platform bot protection.',
  });
}
