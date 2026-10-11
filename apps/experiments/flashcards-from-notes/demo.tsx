'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';
import { downloadJson, SAMPLE_NOTES, type Flashcard } from './logic';

export default function FlashcardsFromNotesDemo() {
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setCards([]);
    setFlipped([]);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      const next = data.cards as Flashcard[];
      setCards(next);
      setFlipped(next.map(() => false));
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Flashcards from notes"
      description="Turn study notes into flip cards with generateObject, then export JSON."
      onReset={() => {
        setNotes(SAMPLE_NOTES);
        setCards([]);
        setFlipped([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-28 text-sm"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Generating…' : 'Make flashcards'}
          </Button>
          {cards.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadJson('flashcards.json', { cards })}
            >
              Export JSON
            </Button>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                setFlipped((prev) => {
                  const next = [...prev];
                  next[i] = !next[i];
                  return next;
                })
              }
              className={cn(
                'min-h-28 rounded-md border border-fd-border p-3 text-left text-sm transition',
                flipped[i] ? 'bg-fd-accent/40' : 'bg-fd-secondary/40',
              )}
            >
              <p className="mb-1 text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                {flipped[i] ? 'Back' : 'Front'} · tap to flip
              </p>
              <p>{flipped[i] ? card.back : card.front}</p>
            </button>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
