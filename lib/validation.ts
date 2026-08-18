export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function str(value: unknown, name: string, min = 1): string {
  if (typeof value !== "string" || value.trim().length < min) {
    throw new ValidationError(`${name} is invalid`);
  }
  return value.trim();
}

export function strOptional(value: unknown, name: string, min = 1): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length < min) {
    throw new ValidationError(`${name} is invalid`);
  }
  return value.trim();
}

export function strOrNull(value: unknown, name: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return str(value, name);
}

export function email(value: unknown): string {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    throw new ValidationError("A valid email is required");
  }
  return value.trim().toLowerCase();
}

export function url(value: unknown, name: string, allowEmpty = false): string {
  if (allowEmpty && (value === "" || value === undefined)) return "";
  if (typeof value !== "string" || !/^https?:\/\/[^\s]+$/.test(value.trim())) {
    throw new ValidationError(`${name} is invalid`);
  }
  return value.trim();
}

export function bool(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new ValidationError(`${name} is invalid`);
  return value;
}

export function positiveInt(value: unknown, name: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new ValidationError(`${name} is invalid`);
  return parsed;
}

export function oneOf(value: unknown, options: readonly string[], name: string, fallback?: string): string {
  if (typeof value === "string" && options.includes(value)) return value;
  if (fallback !== undefined) return fallback;
  throw new ValidationError(`${name} is invalid`);
}

export function maxLength(value: string | null | undefined, limit: number, name: string): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string" || value.length > limit) throw new ValidationError(`${name} is too long`);
  return value;
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null ? body : {};
  } catch {
    throw new ValidationError("Invalid request body");
  }
}