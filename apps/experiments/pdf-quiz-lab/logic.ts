export const MAX_TEXT_CHARS = 12_000;

export const SAMPLE_TEXT = `Vercel Blob is object storage for the web. Upload files from a Route Handler with put(), list them with list(), and delete with del(). Public blobs get a stable CDN URL. Prefer server-side tokens (BLOB_READ_WRITE_TOKEN) and never expose write credentials to the browser. For large uploads, use client uploads with a token from your server.`;

export function truncateText(text: string, max = MAX_TEXT_CHARS): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
}

export function isTextLikeFilename(name: string): boolean {
  return /\.(txt|md|markdown|pdf)$/i.test(name);
}

export type QuizQuestion = {
  question: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export type QuizResult = {
  questions: QuizQuestion[];
};

export function scoreQuiz(
  answers: Array<number | null>,
  questions: QuizQuestion[],
): { correct: number; total: number; detail: boolean[] } {
  const detail = questions.map((q, i) => answers[i] === q.correctIndex);
  return {
    correct: detail.filter(Boolean).length,
    total: questions.length,
    detail,
  };
}

export function downloadText(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
