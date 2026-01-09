/**
 * Creates a rate-limited executor for async calls.
 *
 * Ensures sequential execution with a minimum delay
 * between invocations.
 */
export function rateLimit(intervalMs: number)
{
  let lastExecutionTime = 0;
  let queue: Promise<unknown> = Promise.resolve();

  return function <T>(taskFn: () => Promise<T>): Promise<T>
  {
    const task = async (): Promise<T> =>
    {
      const now = Date.now();
      const waitMs = Math.max(0, intervalMs - (now - lastExecutionTime));

      if (waitMs > 0)
      {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      lastExecutionTime = Date.now();
      return taskFn();
    };

    const result = queue.then(task);
    queue = result.catch(() => {});
    return result;
  };
}
