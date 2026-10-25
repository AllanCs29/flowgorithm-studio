export class CompatibilityError extends Error {
  readonly code = 'COMPATIBILITY_UNKNOWN';
  constructor(message: string, readonly feature: string) { super(`${message} (COMPATIBILITY_UNKNOWN: ${feature})`); this.name = 'CompatibilityError'; }
}