import { describe, expect, it } from 'vitest';
import {
  guessCompanyFromEmail,
  heuristicUrgency,
  normalizeEmail,
  truncateText,
} from './logic';

describe('form-to-crm-lab logic', () => {
  it('normalizes email and guesses company', () => {
    expect(normalizeEmail('  Alex@Acme.io ')).toBe('alex@acme.io');
    expect(guessCompanyFromEmail('alex@acme-widgets.io')).toBe('Acme-widgets');
    expect(guessCompanyFromEmail('me@gmail.com')).toBe('Unknown / personal email');
  });

  it('heuristics urgency from message', () => {
    expect(heuristicUrgency('ASAP please')).toBe('high');
    expect(heuristicUrgency('this week would be great')).toBe('medium');
    expect(heuristicUrgency('just browsing')).toBe('low');
  });

  it('truncates message', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(50), 8).length).toBe(8);
  });
});
