"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EVENTS, STATUS } from "react-joyride";
import type { EventData } from "react-joyride";

const disabledKey = (key: string) => `tour-off-${key}`;

export function usePageTour(tourKey: string) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoEnabled, setAutoEnabled] = useState(true);
  // `ready` gates the button visibility so they don't flash before the auto-tour starts.
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const disabled = localStorage.getItem(disabledKey(tourKey)) === "1";
    setAutoEnabled(!disabled);

    if (disabled) {
      // Auto-start is off → show buttons straight away.
      setReady(true);
    } else {
      // Auto-start is on → delay so data-tour elements are mounted,
      // then start; buttons appear only after the tour ends.
      const t = setTimeout(() => setRun(true), 400);
      return () => clearTimeout(t);
    }
  }, [tourKey]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
    setReady(false);
  }, []);

  const toggleAuto = useCallback(() => {
    setAutoEnabled((prev) => {
      const next = !prev;
      if (next) {
        localStorage.removeItem(disabledKey(tourKey));
        setStepIndex(0);
        setRun(true);
        setReady(false);
      } else {
        localStorage.setItem(disabledKey(tourKey), "1");
        setRun(false);
        setReady(true);
      }
      return next;
    });
  }, [tourKey]);

  const handleEvent = useCallback((data: EventData) => {
    const { action, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Dismissed for this visit — will auto-start again on next page access.
      setRun(false);
      setReady(true);
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex((i) => i + (action === "prev" ? -1 : 1));
    }
  }, []);

  return { run, stepIndex, autoEnabled, ready, startTour, toggleAuto, handleEvent };
}
