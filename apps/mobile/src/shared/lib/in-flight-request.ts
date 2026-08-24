export function createInFlightRequestDeduper<T>() {
  const pending = new Map<string, Promise<T>>();

  return (key: string, request: () => Promise<T>): Promise<T> => {
    const existing = pending.get(key);
    if (existing) return existing;

    const promise = request();
    pending.set(key, promise);
    const clear = () => {
      if (pending.get(key) === promise) pending.delete(key);
    };
    void promise.then(clear, clear);
    return promise;
  };
}
