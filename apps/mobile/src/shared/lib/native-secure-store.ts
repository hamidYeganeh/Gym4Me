export type NativeSecureStore = {
  isNative: boolean;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let runtimePromise: Promise<NativeSecureStore> | null = null;

export function getNativeSecureStore(): Promise<NativeSecureStore> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) {
        return {
          isNative: false,
          getItem: async () => null,
          setItem: async () => undefined,
          removeItem: async () => undefined,
        };
      }

      const { SecureStorage } = await import(
        "@aparajita/capacitor-secure-storage"
      );
      // Auth tokens are device-bound and must not sync through iCloud Keychain.
      await SecureStorage.setSynchronize(false);
      return {
        isNative: true,
        getItem: (key) => SecureStorage.getItem(key),
        setItem: (key, value) => SecureStorage.setItem(key, value),
        removeItem: (key) => SecureStorage.removeItem(key),
      };
    })();
  }
  return runtimePromise;
}
