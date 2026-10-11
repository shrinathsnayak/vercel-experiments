'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import {
  MAX_TEXT_CHARS,
  SAMPLE_TEXT,
  scoreQuiz,
  type QuizQuestion,
} from './logic';

export default function PdfQuizLabDemo() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers([]);
    setSubmitted(false);
    try {
      const form = new FormData();
      form.set('text', text);
      if (file) form.set('file', file);
      const res = await fetch('/api/quiz', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      const qs = data.questions as QuizQuestion[];
      setQuestions(qs);
      setAnswers(qs.map(() => null));
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  const score = submitted ? scoreQuiz(answers, questions) : null;

  return (
    <DemoShell
      title="PDF quiz lab"
      description="Paste text or upload .txt / .md / .pdf, then generate a 5-question MCQ quiz via AI Gateway."
      onReset={() => {
        setText('');
        setFile(null);
        setQuestions([]);
        setAnswers([]);
        setSubmitted(false);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Source text" htmlFor="quiz-text">
          <Textarea
            id="quiz-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-28 text-sm"
            placeholder={`Paste text (max ~${MAX_TEXT_CHARS} chars) or upload a file`}
          />
        </Field>
        <Field label="Upload (.txt / .md / .pdf)" htmlFor="quiz-file">
          <Input
            id="quiz-file"
            type="file"
            accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={generate}>
            {loading ? 'Generating…' : 'Generate quiz'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setText(SAMPLE_TEXT);
              setFile(null);
            }}
          >
            Sample text
          </Button>
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}

        {questions.length > 0 ? (
          <div className="space-y-4" aria-live="polite">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-md border border-fd-border p-3">
                <p className="text-sm font-medium">
                  {qi + 1}. {q.question}
                </p>
                <div className="mt-2 grid gap-1">
                  {q.choices.map((choice, ci) => {
                    const selected = answers[qi] === ci;
                    const show = submitted;
                    const isCorrect = ci === q.correctIndex;
                    return (
                      <button
                        key={ci}
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[qi] = ci;
                            return next;
                          })
                        }
                        className={cn(
                          'rounded border px-2 py-1.5 text-left text-sm',
                          selected && !show && 'border-fd-primary bg-fd-accent/40',
                          show && isCorrect && 'border-emerald-600 bg-emerald-500/10',
                          show && selected && !isCorrect && 'border-red-600 bg-red-500/10',
                          !selected && !show && 'border-fd-border hover:bg-fd-accent/30',
                        )}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {submitted ? (
                  <p className="mt-2 text-xs text-fd-muted-foreground">{q.explanation}</p>
                ) : null}
              </div>
            ))}
            {!submitted ? (
              <Button
                type="button"
                size="sm"
                disabled={answers.some((a) => a === null)}
                onClick={() => setSubmitted(true)}
              >
                Score quiz
              </Button>
            ) : score ? (
              <DemoStatus tone="success">
                Score: {score.correct} / {score.total}
              </DemoStatus>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
