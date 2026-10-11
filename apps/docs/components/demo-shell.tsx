'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, Copy, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type DemoShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  example?: string;
  onReset?: () => void;
  announcement?: string;
  className?: string;
};

export function DemoShell({
  title,
  description,
  children,
  toolbar,
  example,
  onReset,
  announcement,
  className,
}: DemoShellProps) {
  const explanationId = useId();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleCopy() {
    if (!example) return;
    await navigator.clipboard.writeText(example);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className={cn('gap-0 py-0', className)} aria-label={`${title} demo`}>
      <CardHeader className="border-b [.border-b]:pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-sm">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-xs">{description}</CardDescription>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {example ? (
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                <Copy data-icon="inline-start" />
                {copied ? 'Copied' : 'Copy example'}
              </Button>
            ) : null}
            {onReset ? (
              <Button type="button" variant="outline" size="sm" onClick={onReset}>
                <RotateCcw data-icon="inline-start" />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">{children}</CardContent>
      {example ? (
        <Collapsible open={open} onOpenChange={setOpen} className="border-t">
          <CollapsibleTrigger
            className="flex h-auto w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
            aria-controls={explanationId}
          >
            Example configuration
            <ChevronDown
              className={cn('size-4 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre
              id={explanationId}
              className="overflow-x-auto border-t bg-muted/40 p-4 text-xs leading-relaxed"
            >
              <code>{example}</code>
            </pre>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
    </Card>
  );
}

export function DemoStatus({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'error';
  children: ReactNode;
}) {
  return (
    <Alert
      variant={tone === 'error' ? 'destructive' : 'default'}
      className={cn(
        'text-xs',
        tone === 'success' &&
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        tone === 'warning' &&
        'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200',
        tone === 'neutral' && 'bg-muted/40',
      )}
    >
      <AlertDescription
        className={cn(
          tone === 'success' && 'text-emerald-700 dark:text-emerald-300',
          tone === 'warning' && 'text-amber-800 dark:text-amber-200',
          tone === 'error' && 'text-destructive',
        )}
      >
        {children}
      </AlertDescription>
    </Alert>
  );
}
