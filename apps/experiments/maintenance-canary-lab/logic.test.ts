import { describe, expect, it } from 'vitest';
import { assignVariant, clampPercent, shouldShowMaintenance } from './logic';

describe('maintenance-canary-lab', () => {
  it('clamps percent', () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(150)).toBe(100);
  });

  it('respects sticky cookie', () => {
    const a = assignVariant({
      config: { maintenanceMode: false, canaryPercent: 100 },
      existingCookie: 'control',
      random: 0,
    });
    expect(a.variant).toBe('control');
    expect(a.reason).toBe('existing-cookie');
  });

  it('assigns canary by percent', () => {
    const a = assignVariant({
      config: { maintenanceMode: false, canaryPercent: 50 },
      random: 0.1,
    });
    expect(a.variant).toBe('canary');
  });

  it('maintenance kills switch', () => {
    expect(shouldShowMaintenance({ maintenanceMode: true, canaryPercent: 0 })).toBe(true);
  });
});
