import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  error: Error | null;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    error: null,
  });

  const retry = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      setState({ isRetrying: true, attempt: 0, error: null });

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setState(prev => ({ ...prev, attempt }));
          onRetry?.(attempt);

          const result = await asyncFn(...args);

          setState({ isRetrying: false, attempt, error: null });
          onSuccess?.();
          toast.success('Operation completed successfully');

          return result;
        } catch (error) {
          const err = error as Error;
          console.error(`Attempt ${attempt} failed:`, err);

          if (attempt === maxAttempts) {
            setState({ isRetrying: false, attempt, error: err });
            onFailure?.(err);
            toast.error(`Failed after ${maxAttempts} attempts: ${err.message}`);
            return null;
          }

          // Wait before next attempt (exponential backoff)
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          toast.loading(`Retry attempt ${attempt + 1} in ${delay / 1000}s...`, {
            duration: delay,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return null;
    },
    [asyncFn, maxAttempts, delayMs, backoffMultiplier, onRetry, onSuccess, onFailure]
  );

  const reset = useCallback(() => {
    setState({ isRetrying: false, attempt: 0, error: null });
  }, []);

  return {
    retry,
    reset,
    ...state,
  };
}

/**
 * Batch retry for multiple operations
 */
export function useBatchRetry<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: RetryOptions = {}
) {
  const [state, setState] = useState<{
    isRetrying: boolean;
    completed: number;
    failed: number;
    total: number;
  }>({
    isRetrying: false,
    completed: 0,
    failed: 0,
    total: 0,
  });

  const retryBatch = useCallback(
    async (items: Parameters<T>[]): Promise<{
      successful: ReturnType<T>[];
      failed: { item: Parameters<T>; error: Error }[];
    }> => {
      setState({
        isRetrying: true,
        completed: 0,
        failed: 0,
        total: items.length,
      });

      const successful: ReturnType<T>[] = [];
      const failed: { item: Parameters<T>; error: Error }[] = [];

      const promises = items.map(async (item) => {
        try {
          const result = await asyncFn(...item);
          successful.push(result);
          setState(prev => ({ ...prev, completed: prev.completed + 1 }));
          return { success: true, result };
        } catch (error) {
          const err = error as Error;
          failed.push({ item, error: err });
          setState(prev => ({ ...prev, failed: prev.failed + 1 }));
          return { success: false, error: err };
        }
      });

      await Promise.allSettled(promises);

      setState(prev => ({ ...prev, isRetrying: false }));

      // Show summary toast
      if (failed.length === 0) {
        toast.success(`All ${successful.length} operations completed successfully`);
      } else if (successful.length === 0) {
        toast.error(`All ${failed.length} operations failed`);
      } else {
        toast(`${successful.length} succeeded, ${failed.length} failed`, {
          icon: '⚠️',
        });
      }

      return { successful, failed };
    },
    [asyncFn]
  );

  return {
    retryBatch,
    ...state,
  };
}
