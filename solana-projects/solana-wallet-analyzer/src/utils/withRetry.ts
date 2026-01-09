/**
 * Executes an async operation with retry and exponential backoff.
 */
export async function withRetry<T>(
  taskFn: () => Promise<T>,
  options?: {
    retries?: number;
    delayMs?: number;
    backoffFactor?: number;
  }
): Promise<T>
{
  const maxRetries = options?.retries ?? 5;
  const initialDelayMs = options?.delayMs ?? 500;
  const backoffFactor = options?.backoffFactor ?? 2;

  let attempt = 0;
  let delayMs = initialDelayMs;

  while (true)
  {
    try
    {
      return await taskFn();
    }
    catch (error: any)
    {
      attempt++;

      if (attempt > maxRetries)
      {
        throw error;
      }

      // Retry only for rate-limit or transient network errors
      const message = String(error?.message ?? "");
      if (
        !message.includes("429") &&
        !message.includes("Too Many Requests")
      ) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= backoffFactor;
    }
  }
}
