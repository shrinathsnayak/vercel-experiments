import type { Metadata } from 'next';
import Link from 'next/link';
import { appName, contactRoute, githubUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy practices for ${appName}, an educational open-source developer tools catalog.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          {appName} is an educational open-source site that catalogs deployable Next.js
          and Vercel developer tools. We aim to collect as little personal data as
          possible. This policy describes how the hub and public demos handle
          information.
        </p>
        <p>
          Stateful demos such as the Webhook Playground may temporarily store request
          metadata and payloads in memory for short-lived sessions. Those sessions
          expire automatically and are not intended as durable storage. Do not send
          production secrets, personal data, or credentials into public demos.
          Sensitive headers are redacted when possible, but you remain responsible for
          what you submit.
        </p>
        <p>
          If analytics or speed insights are enabled in a deployment, they are used
          only to understand aggregate performance and traffic. Review your deployment
          environment configuration for details. The public catalog API returns
          experiment metadata only and does not require authentication or cookies.
        </p>
        <p>
          Questions about privacy practices can go through the{' '}
          <Link href={contactRoute} className="underline underline-offset-4">
            contact page
          </Link>{' '}
          or the repository on{' '}
          <Link href={githubUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
            GitHub
          </Link>
          . This project does not sell personal data.
        </p>
      </div>
    </div>
  );
}
