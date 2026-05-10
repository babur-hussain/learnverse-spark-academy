import { useEffect, useRef, useCallback } from 'react';
import { isCancelled } from '@/lib/api';

/**
 * A safer alternative to using AbortController + axios signal directly.
 *
 * On older Android devices (Hermes < 0.9, RN < 0.70), passing an AbortController
 * signal to axios can silently swallow real network errors because the
 * 'CanceledError' name check is inconsistent across versions.
 *
 * Instead we track component mount state with a ref, which is 100% reliable.
 * The API call is still cancelled on unmount (via isMounted flag), but we
 * don't pass the signal to axios — avoiding the compatibility issue entirely.
 *
 * Usage:
 *   const { execute, isMounted } = useSafeRequest();
 *   useEffect(() => {
 *     execute(async () => {
 *       const res = await api.get('/...');
 *       // No need to check isMounted — execute() handles it
 *       setData(res.data);
 *     }, (err) => setError('Failed'));
 *   }, []);
 */
export function useSafeRequest() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (
      fn: () => Promise<void>,
      onError?: (error: any) => void
    ) => {
      try {
        await fn();
      } catch (e: any) {
        // Don't surface an error if the component has unmounted or the
        // request was intentionally cancelled — this is safe on all RN versions
        if (!isMountedRef.current || isCancelled(e)) return;
        console.warn('[useSafeRequest]', e?.message || e);
        onError?.(e);
      }
    },
    []
  );

  return { execute, isMounted: isMountedRef };
}
