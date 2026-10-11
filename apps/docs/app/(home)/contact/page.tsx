import type { Metadata } from 'next';
import Link from 'next/link';
import {
  appName,
  getContactEmail,
  githubIssuesUrl,
  githubUrl,
  portfolioUrl,
} from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact the maintainers of ${appName} for questions, contributions, and security reports.`,
};

export default function ContactPage() {
  const email = getContactEmail();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          {appName} is an independent open-source catalog of Next.js and Vercel
          developer tools. The fastest way to reach maintainers is through the
          public repository so questions, bugs, and experiment proposals stay
          searchable for other contributors.
        </p>
        <p>
          For product questions, documentation gaps, or ideas for new labs, open an
          issue on{' '}
          <Link
            href={githubIssuesUrl}
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Issues
          </Link>
          . Include the experiment slug when the report is about a specific lab,
          and link to the docs page if you already found related material.
        </p>
        <p>
          Pull requests are welcome. Follow the contribution guide before opening a
          large change, and keep demos honest when configuration is missing. Source
          lives at{' '}
          <Link
            href={githubUrl}
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            {githubUrl}
          </Link>
          .
        </p>
        {email ? (
          <p>
            You can also email the maintainers at{' '}
            <a href={`mailto:${email}`} className="underline underline-offset-4">
              {email}
            </a>{' '}
            for private coordination. Do not send production secrets or personal
            data from demos.
          </p>
        ) : (
          <p>
            There is no public support inbox for day-to-day questions. Prefer GitHub
            Issues so the community can help. Maintainer context is also available
            on{' '}
            <Link
              href={portfolioUrl}
              className="underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              snayak.dev
            </Link>
            .
          </p>
        )}
        <p>
          For exploitable security vulnerabilities, do not open a public issue.
          Follow the reporting process in{' '}
          <Link
            href={`${githubUrl}/blob/main/SECURITY.md`}
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            SECURITY.md
          </Link>{' '}
          and include impact, reproduction steps, and any suggested remediation.
          This project does not offer paid support or SLAs.
        </p>
      </div>
    </div>
  );
}
