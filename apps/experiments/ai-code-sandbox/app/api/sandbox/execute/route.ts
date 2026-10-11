import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  isSandboxEnabled,
  parseAllowlistedArithmetic,
  SANDBOX_SETUP_REQUIREMENTS,
} from '../../../../logic';
const bodySchema = z.object({
  expression: z.string().min(1).max(120),
});

const SETUP_MESSAGE =
  'Isolated execution unavailable. Enable SANDBOX_ENABLED=true on a Vercel project with Sandbox access (OIDC), or provide VERCEL_TOKEN + project/team IDs locally. Only allowlisted arithmetic is accepted.';

export async function POST(request: Request) {
  if (!isSandboxEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        message: SETUP_MESSAGE,
        requirements: SANDBOX_SETUP_REQUIREMENTS,
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid expression payload' }, { status: 400 });
  }

  const arithmetic = parseAllowlistedArithmetic(parsed.data.expression);
  if (!arithmetic.ok) {
    return NextResponse.json({ ok: false, error: arithmetic.error }, { status: 422 });
  }

  try {
    const { Sandbox } = await import('@vercel/sandbox');
    const sandbox = await Sandbox.create({
      timeout: 60_000,
      networkPolicy: 'deny-all',
    });

    try {
      // Run only the already-validated numeric literal in the microVM - never raw user text.
      await sandbox.writeFiles([
        {
          path: 'run.mjs',
          content: Buffer.from(
            `const value = ${JSON.stringify(arithmetic.value)};\nconsole.log(value);\n`,
          ),
        },
      ]);
      const result = await sandbox.runCommand('node', ['run.mjs']);
      const stdout = (await result.stdout()).trim();
      const value = Number(stdout);
      if (result.exitCode !== 0 || !Number.isFinite(value)) {
        const stderr = await result.stderr();
        return NextResponse.json(
          {
            ok: false,
            error: `Sandbox execution failed: ${stderr || 'unknown error'}`,
          },
          { status: 500 },
        );
      }
      return NextResponse.json({
        ok: true,
        value,
        mode: 'vercel-sandbox',
        note: 'Executed inside a Vercel Sandbox microVM with network denied. Expression was allowlisted before launch.',
      });
    } finally {
      await sandbox.stop().catch(() => undefined);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sandbox failed';
    return NextResponse.json(
      {
        ok: false,
        error: message,
        fallback: arithmetic.value,
        note: 'Sandbox launch failed; arithmetic was still validated locally without eval.',
      },
      { status: 502 },
    );
  }
}
