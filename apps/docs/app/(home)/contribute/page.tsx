import type { Metadata } from 'next';
import Link from 'next/link';
import { githubUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'How to contribute experiments, documentation, and improvements.',
};

export default function ContributePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contribute</h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          Contributions are welcome. The fastest path is to add a focused experiment with
          a working demo, validated registry metadata, documentation, and tests.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Read the{' '}
            <Link href="/docs/adding-an-experiment" className="underline underline-offset-4">
              adding an experiment
            </Link>{' '}
            guide.
          </li>
          <li>
            Follow{' '}
            <Link href="/docs/experiment-conventions" className="underline underline-offset-4">
              experiment conventions
            </Link>
            .
          </li>
          <li>
            Open a pull request on{' '}
            <Link href={githubUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
              GitHub
            </Link>
            .
          </li>
        </ol>
        <p>
          Please review the code of conduct and security policy before submitting
          substantial changes.
        </p>
      </div>
    </div>
  );
}
