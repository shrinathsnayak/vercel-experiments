import { describe, expect, it } from 'vitest';
import { summarizeConfig } from './logic';

describe('global-config-lab logic', () => {
  it('summarizes keys', () => {
    expect(summarizeConfig({ greeting: 'hi', maintenanceMode: false })).toEqual({
      keyCount: 2,
      keys: ['greeting', 'maintenanceMode'],
    });
  });
});
