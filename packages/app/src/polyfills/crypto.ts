import * as ExpoCrypto from "expo-crypto";

declare global {
  interface Crypto {
    randomUUID(): `${string}-${string}-${string}-${string}-${string}`;
  }
}

interface MutableGlobal {
  crypto?: Crypto;
}

export function polyfillCrypto(): void {
  const g = globalThis as unknown as MutableGlobal;

  if (!g.crypto) {
    g.crypto = {} as Crypto;
  }

  if (typeof g.crypto.randomUUID !== "function") {
    g.crypto.randomUUID = () =>
      ExpoCrypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`;
  }

  if (typeof g.crypto.getRandomValues !== "function") {
    g.crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (array === null) return array;
      return ExpoCrypto.getRandomValues(
        array as unknown as Parameters<typeof ExpoCrypto.getRandomValues>[0],
      ) as unknown as T;
    };
  }
}
