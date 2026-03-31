export interface SecurityCheckResult {
  ok: boolean;
  errors: string[];
}

export function validateProductionConfig(): SecurityCheckResult {
  const errors: string[] = [];

  if (process.env.PIXEL_OFFICE_ENV !== 'production') {
    return { ok: true, errors };
  }

  const secret = process.env.SESSION_SECRET || '';
  if (secret.length < 24) {
    errors.push('SESSION_SECRET must be at least 24 characters in production');
  }

  const pass = process.env.ASSET_DRAWER_PASS || '';
  if (pass.length < 8) {
    errors.push('ASSET_DRAWER_PASS must be at least 8 characters in production');
  }
  if (pass === 'openclaw') {
    errors.push('ASSET_DRAWER_PASS must not be the default value "openclaw" in production');
  }

  return { ok: errors.length === 0, errors };
}
