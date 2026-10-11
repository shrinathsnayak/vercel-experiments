import type { Metadata } from 'next';
import Link from 'next/link';
import { appName, githubUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${appName}, an independent community playground for Next.js and Vercel.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          {appName} is an independent open-source project for developers who want to
          explore modern Next.js patterns and Vercel platform capabilities through small,
          useful, interactive experiments.
        </p>
        <p>
          It is inspired by the idea behind Cloudflare Experiments, but focused on the
          Vercel and Next.js ecosystem. This project is not affiliated with, endorsed by,
          or sponsored by Vercel.
        </p>
        <p>
          Every published experiment should teach something concrete: a working demo, a
          visual explanation, a developer utility, a reusable pattern, or a reproducible
          comparison.
        </p>
        <p>
          Source code and contribution docs live on{' '}
          <Link href={githubUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
            GitHub
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
