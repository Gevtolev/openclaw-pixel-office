import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateProductionConfig } from '@/lib/security-utils';

describe('validateProductionConfig', () => {
  const origEnv = process.env;

  beforeEach(() => {
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it('returns ok=true when PIXEL_OFFICE_ENV is not production', () => {
    process.env.PIXEL_OFFICE_ENV = 'development';
    const result = validateProductionConfig();
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns ok=true when both secrets are valid in production', () => {
    process.env.PIXEL_OFFICE_ENV = 'production';
    process.env.SESSION_SECRET = 'a'.repeat(24);
    process.env.ASSET_DRAWER_PASS = 'strongpass';
    const result = validateProductionConfig();
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('errors when SESSION_SECRET is too short', () => {
    process.env.PIXEL_OFFICE_ENV = 'production';
    process.env.SESSION_SECRET = 'short';
    process.env.ASSET_DRAWER_PASS = 'strongpass';
    const result = validateProductionConfig();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('SESSION_SECRET'))).toBe(true);
  });

  it('errors when ASSET_DRAWER_PASS is too short', () => {
    process.env.PIXEL_OFFICE_ENV = 'production';
    process.env.SESSION_SECRET = 'a'.repeat(24);
    process.env.ASSET_DRAWER_PASS = 'abc';
    const result = validateProductionConfig();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('ASSET_DRAWER_PASS'))).toBe(true);
  });

  it('errors when ASSET_DRAWER_PASS is the default value', () => {
    process.env.PIXEL_OFFICE_ENV = 'production';
    process.env.SESSION_SECRET = 'a'.repeat(24);
    process.env.ASSET_DRAWER_PASS = 'openclaw';
    const result = validateProductionConfig();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('default'))).toBe(true);
  });
});
