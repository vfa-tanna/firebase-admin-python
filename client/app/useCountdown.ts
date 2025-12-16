import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const ONE_SECOND_IN_MS = 1000;
export const ONE_MINUTE_IN_MS = 60 * ONE_SECOND_IN_MS;
export const COUNTDOWN_IN_MS = 3 * ONE_MINUTE_IN_MS;

export const EVENT_COUNTDOWN_START = "countdown:start";
export const EVENT_COUNTDOWN_END = "countdown:end";
export const EVENT_DEADLINE_REMAINING = "countdown:deadline-remaining";
export const EVENT_DEADLINE_ENDING = "countdown:deadline-ending";

interface CountdownMilestoneEvent {
  name: string;
  remainingInMs: number;
}

interface UseCountdownOptions {
  autoStart?: boolean;
  countdownInMs?: number;
  milestoneEvents?: CountdownMilestoneEvent[];
  onEvent?: (eventName: string, remainingInMs: number) => void;
}

interface UseCountdownResult {
  timeLeftInMs: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const DEFAULT_MILESTONES: CountdownMilestoneEvent[] = [];

/**
 * Configurable countdown hook.
 *
 * - Always emits `onEvent(remainingInMs, EVENT_COUNTDOWN_START)` when the timer begins.
 * - Emits `onEvent(remainingInMs, eventName)` for each configured milestone.
 * - Emits `onEvent(0, EVENT_COUNTDOWN_END)` when the countdown finishes.
 */
export function useCountdown({
  autoStart = false,
  countdownInMs = COUNTDOWN_IN_MS,
  milestoneEvents,
  onEvent,
}: UseCountdownOptions = {}): UseCountdownResult {
  const [timeLeftInMs, setTimeLeftInMs] = useState(countdownInMs);
  const [isRunning, setIsRunning] = useState(false);

  const timeLeftRef = useRef(timeLeftInMs);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredEventsRef = useRef<Set<string>>(new Set());
  const onEventRef = useRef(onEvent);
  const milestoneEventsRef = useRef<CountdownMilestoneEvent[]>([]);

  useEffect(() => {
    timeLeftRef.current = timeLeftInMs;
  }, [timeLeftInMs]);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    milestoneEventsRef.current =
      milestoneEvents && milestoneEvents.length > 0
        ? milestoneEvents
        : DEFAULT_MILESTONES;
  }, [milestoneEvents]);

  const resetEventTracking = useCallback(() => {
    triggeredEventsRef.current = new Set();
  }, []);

  const emitEvent = useCallback((eventName: string, remainingInMs: number) => {
    onEventRef.current?.(eventName, remainingInMs);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    const shouldResetEvents =
      timeLeftRef.current <= 0 || timeLeftRef.current > countdownInMs;
    const getInitialRemaining = () => {
      const current = timeLeftRef.current;
      if (current > 0 && current <= countdownInMs) {
        return current;
      }
      return countdownInMs;
    };

    setTimeLeftInMs((prev) => {
      if (prev <= 0 || prev > countdownInMs) {
        resetEventTracking();
        timeLeftRef.current = countdownInMs;
        return countdownInMs;
      }
      return prev;
    });

    setIsRunning((prev) => {
      if (prev) {
        return prev;
      }
      if (shouldResetEvents) {
        resetEventTracking();
      }
      if (!triggeredEventsRef.current.has(EVENT_COUNTDOWN_START)) {
        emitEvent(EVENT_COUNTDOWN_START, getInitialRemaining());
        triggeredEventsRef.current.add(EVENT_COUNTDOWN_START);
      }
      return true;
    });
  }, [countdownInMs, emitEvent, resetEventTracking]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    resetEventTracking();
    setIsRunning(false);
    setTimeLeftInMs(countdownInMs);
    timeLeftRef.current = countdownInMs;
  }, [clearTimer, countdownInMs, resetEventTracking]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeftInMs((prev) => {
        if (prev <= 0) {
          timeLeftRef.current = 0;
          return 0;
        }

        const next = Math.max(prev - ONE_SECOND_IN_MS, 0);
        timeLeftRef.current = next;

        milestoneEventsRef.current.forEach(({ name, remainingInMs }) => {
          if (!triggeredEventsRef.current.has(name) && next <= remainingInMs) {
            triggeredEventsRef.current.add(name);
            emitEvent(name, next);
          }
        });

        if (
          next === 0 &&
          !triggeredEventsRef.current.has(EVENT_COUNTDOWN_END)
        ) {
          clearTimer();
          setIsRunning(false);
          emitEvent(EVENT_COUNTDOWN_END, 0);
          triggeredEventsRef.current.add(EVENT_COUNTDOWN_END);
        }

        return next;
      });
    }, ONE_SECOND_IN_MS);

    return clearTimer;
  }, [clearTimer, emitEvent, isRunning]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const minutes = useMemo(
    () => Math.floor(timeLeftInMs / ONE_MINUTE_IN_MS),
    [timeLeftInMs]
  );
  const seconds = useMemo(
    () => Math.floor((timeLeftInMs % ONE_MINUTE_IN_MS) / ONE_SECOND_IN_MS),
    [timeLeftInMs]
  );

  const formatted = useMemo(() => {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [minutes, seconds]);

  return {
    timeLeftInMs,
    minutes,
    seconds,
    formatted,
    isRunning,
    start,
    pause,
    reset,
  };
}
