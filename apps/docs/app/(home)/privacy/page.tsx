import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy practices for Vercel Experiments.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          Vercel Experiments is an educational open-source site. We aim to collect as
          little data as possible.
        </p>
        <p>
          Stateful demos such as the Webhook Playground may temporarily store request
          metadata and payloads in memory for short-lived sessions. Those sessions expire
          automatically and are not intended as durable storage.
        </p>
        <p>
          Do not send production secrets, personal data, or credentials into public demos.
          Sensitive headers are redacted when possible, but you remain responsible for
          what you submit.
        </p>
        <p>
          If analytics or speed insights are enabled in a deployment, they are used only
          to understand aggregate performance and traffic. Review your deployment
          environment configuration for details.
        </p>
      </div>
    </div>
  );
}
