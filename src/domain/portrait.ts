export const portraitMaxBytes = 2 * 1024 * 1024;

export function isCharacterPortrait(value: string): boolean {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return false;

  const [, format, encoded] = match;
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  if (encoded.length % 4 !== 0 || encoded.length * 3 / 4 - padding > portraitMaxBytes) return false;

  const header = atob(encoded.slice(0, 16));
  if (format === "png") return header.startsWith("\x89PNG\r\n\x1a\n");
  if (format === "jpeg") return header.startsWith("\xff\xd8\xff");
  return header.startsWith("RIFF") && header.slice(8) === "WEBP";
}
