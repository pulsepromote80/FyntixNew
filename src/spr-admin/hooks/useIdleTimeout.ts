import { useEffect, useRef } from "react";

const DEFAULT_EVENTS = ["mousemove", "keydown", "scroll", "click"] as const;

/**
 * Invokes `onIdle` after `timeoutMs` of no user activity. Useful for
 * auto-logout / session-expiry warnings in protected areas of the app.
 */
export function useIdleTimeout(onIdle: () => void, timeoutMs = 15 * 60_000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onIdle, timeoutMs);
    }

    resetTimer();
    DEFAULT_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer),
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      DEFAULT_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
    };
  }, [onIdle, timeoutMs]);
}
