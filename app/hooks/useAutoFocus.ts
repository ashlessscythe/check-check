import { useEffect, useRef } from "react";

interface UseAutoFocusOptions {
  disabled?: boolean;
  delay?: number;
}

export function useAutoFocus<T extends HTMLElement>({
  disabled = false,
  delay = 2000,
}: UseAutoFocusOptions = {}) {
  const elementRef = useRef<T>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (!disabled) {
        inactivityTimerRef.current = setTimeout(() => {
          // Only focus if the input isn't already focused
          if (document.activeElement !== elementRef.current) {
            elementRef.current?.focus();
          }
        }, delay);
      }
    };

    // Set up event listeners for user activity
    const events = ["mousedown", "keydown", "touchstart", "mousemove"];
    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Initial focus timer
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [disabled, delay]);

  return elementRef;
}
