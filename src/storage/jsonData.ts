export type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
export type JsonObject = { [key: string]: JsonValue };

export class CharacterJsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CharacterJsonError";
  }
}

export function isObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function object(value: JsonValue | undefined, path: string, legacy = false): JsonObject {
  if (value === undefined) return {};
  if (isObject(value)) return value;
  if (legacy && Array.isArray(value) && value.length === 1 && isObject(value[0])) return value[0];
  throw new CharacterJsonError(`Ein Objekt erwartet (${path}).`);
}

export function list(value: JsonValue | undefined, path: string): JsonValue[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  throw new CharacterJsonError(`Eine Liste erwartet (${path}).`);
}

export function requiredObject(value: JsonValue | undefined, path: string): JsonObject {
  if (isObject(value)) return value;
  throw new CharacterJsonError(`Ein Objekt erwartet (${path}).`);
}

export function number(value: JsonValue | undefined, path: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof parsed === "number" && Number.isFinite(parsed)) return parsed;
  throw new CharacterJsonError(`Eine gültige Zahl erwartet (${path}).`);
}

export function text(value: JsonValue | undefined, path: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  throw new CharacterJsonError(`Ein Text erwartet (${path}).`);
}

export function nonemptyText(value: JsonValue | undefined, path: string): string {
  const result = text(value, path);
  if (result?.trim()) return result;
  throw new CharacterJsonError(`Ein Name fehlt (${path}).`);
}

export function fieldPath(path: string, field: string | number) {
  return `${path}/${String(field).replace(/~/g, "~0").replace(/\//g, "~1")}`;
}

export class LegacyArchive {
  private readonly fields: Map<string, JsonValue>;

  constructor(fields: JsonObject = {}) {
    this.fields = new Map(Object.entries(fields));
  }

  preserve(path: string, value: JsonValue) {
    const listPath = path;
    let copy = 1;
    while (this.fields.has(path)) {
      if (JSON.stringify(this.fields.get(path)) === JSON.stringify(value)) return;
      path = `${listPath}#${++copy}`;
    }
    this.fields.set(path, value);
  }

  preserveOtherFields(data: JsonObject, path: string, readFields: readonly string[]) {
    for (const [key, value] of Object.entries(data)) {
      if (!readFields.includes(key)) this.preserve(fieldPath(path, key), value);
    }
  }

  snapshot(): JsonObject | undefined {
    return this.fields.size ? Object.fromEntries(this.fields) : undefined;
  }
}
