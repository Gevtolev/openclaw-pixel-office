export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateProductionConfig } = await import('@/lib/security-utils');
    const result = validateProductionConfig();
    if (!result.ok) {
      console.error('[pixel-office] PRODUCTION SECURITY ERRORS:');
      for (const err of result.errors) {
        console.error(`  ✗ ${err}`);
      }
      process.exit(1);
    }
  }
}
