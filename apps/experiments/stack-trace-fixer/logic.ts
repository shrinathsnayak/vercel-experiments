export const MAX_FIELD_CHARS = 16_000;

export type FixPlan = {
  likelyCause: string;
  nextjsTips: string[];
  reproChecklist: string[];
  docsHints: string[];
};

export const SAMPLE_ERROR = `Error: Event handlers cannot be passed to Client Component props.
  <button onClick={function onClick} className=...>`;

export const SAMPLE_STACK = `    at stringify (<anonymous>)
    at renderPage (app/page.tsx:12:5)
    at Object.react_stack_bottom_frame
    at renderWithHooks (react-dom)
    at Home (app/page.tsx:8:17)`;

export function truncateText(text: string, max = MAX_FIELD_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function detectHints(error: string, stack: string): string[] {
  const blob = `${error}\n${stack}`.toLowerCase();
  const hints: string[] = [];
  if (blob.includes('event handlers cannot be passed')) {
    hints.push('server-client-boundary');
  }
  if (blob.includes("module not found") || blob.includes("can't resolve")) {
    hints.push('module-resolution');
  }
  if (blob.includes('hydration')) hints.push('hydration');
  if (blob.includes('dynamic server usage') || blob.includes('static bailout')) {
    hints.push('cache-components');
  }
  if (blob.includes('headers()') || blob.includes('cookies()')) {
    hints.push('dynamic-apis');
  }
  return hints;
}

export function clampPlan(plan: FixPlan): FixPlan {
  const clean = (arr: string[], n: number) =>
    arr
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, n);
  return {
    likelyCause: plan.likelyCause.trim().slice(0, 400),
    nextjsTips: clean(plan.nextjsTips, 8),
    reproChecklist: clean(plan.reproChecklist, 8),
    docsHints: clean(plan.docsHints, 6),
  };
}
