import type { ClientSession } from "mongoose";
export async function withTransaction<T>(
  startSession: () => Promise<ClientSession>,
  handler: (session: ClientSession) => Promise<T>,
  retries = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const session = await startSession();
    try {
      let result!: T;
      await session.withTransaction(async () => {
        result = await handler(session);
      });
      return result;
    } catch (error) {
      lastError = error;
      const labels = (error as { errorLabels?: string[] })?.errorLabels ?? [];
      if (
        !labels.some(
          (label) =>
            label === "TransientTransactionError" || label === "UnknownTransactionCommitResult",
        ) ||
        attempt === retries - 1
      )
        throw error;
    } finally {
      await session.endSession();
    }
  }
  throw lastError;
}
