/**
 * Pure-native Base64 utilities to replace the `buffer` package dependency.
 * Uses `TextEncoder`/`TextDecoder` (Hermes RN 0.70+) and `atob`/`btoa` (RN 0.72+).
 */

/**
 * Encode a UTF-8 string to Base64.
 * Replaces: Buffer.from(str, "utf8").toString("base64")
 */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a Base64 string to a UTF-8 string.
 * Replaces: Buffer.from(base64, "base64").toString("utf8")
 */
export function base64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Decode a Base64 string to a Uint8Array.
 * Replaces: Buffer.from(base64, "base64")
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode a Uint8Array / ArrayBuffer to Base64.
 * Replaces: Buffer.from(chunk).toString("base64")
 */
export function uint8ArrayToBase64(data: ArrayBuffer | ArrayBufferView): string {
  const view = new Uint8Array(
    "buffer" in data ? (data as ArrayBufferView).buffer : data,
    "byteOffset" in data ? (data as ArrayBufferView).byteOffset : 0,
    "byteLength" in data ? (data as ArrayBufferView).byteLength : (data as ArrayBuffer).byteLength,
  );
  let binary = "";
  for (let i = 0; i < view.length; i++) {
    binary += String.fromCharCode(view[i]);
  }
  return btoa(binary);
}
