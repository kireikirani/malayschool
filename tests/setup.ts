// Global test setup
// Polyfill crypto.randomUUID for Node < 21
import { randomUUID } from "crypto";
if (!globalThis.crypto) {
  // @ts-expect-error – polyfill
  globalThis.crypto = { randomUUID };
}
