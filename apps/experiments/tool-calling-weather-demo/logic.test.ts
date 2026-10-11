import { describe, expect, it } from 'vitest';
import { mockCalc, mockWeather, truncateText } from './logic';

describe('tool-calling-weather-demo logic', () => {
  it('truncates and mocks weather deterministically', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(mockWeather('Lisbon')).toEqual(mockWeather('lisbon'));
    expect(mockWeather('Lisbon').tempC).toBeTypeOf('number');
  });

  it('evaluates safe calc expressions', () => {
    expect(mockCalc('19*3').result).toBe(57);
    expect(mockCalc('alert(1)').error).toBeTruthy();
  });
});
