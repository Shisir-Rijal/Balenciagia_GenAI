"use client";

import { useReducer, useEffect, useRef, useState } from "react";
import { flowReducer, initialState, Step, PROGRESS_STEPS, STEP_ORDER } from "@/lib/steps";

// Screen components (stubs — replace one by one)
import ScreenLanding from "@/components/screens/ScreenLanding";
import ScreenGuestCode from "@/components/screens/ScreenGuestCode";
import ScreenDesignation from "@/components/screens/ScreenDesignation";
import ScreenCaptureBriefing from "@/components/screens/ScreenCaptureBriefing";
import ScreenCaptureLive from "@/components/screens/ScreenCaptureLive";
import ScreenCaptureConfirm from "@/components/screens/ScreenCaptureConfirm";
import ScreenGeneratingId from "@/components/screens/ScreenGeneratingId";
import ScreenBackgroundSelect from "@/components/screens/ScreenBackgroundSelect";
import ScreenGeneratingPoster from "@/components/screens/ScreenGeneratingPoster";
import ScreenResult from "@/components/screens/ScreenResult";
import ScreenConfirmation from "@/components/screens/ScreenConfirmation";

export default function KioskFlow() {
  const [state, dispatch] = useReducer(flowReducer, initialState);
  const [animating, setAnimating] = useState(false);
  const [displayStep, setDisplayStep] = useState(state.step);
  const [slideIn, setSlideIn] = useState(false);
  const prevStep = useRef(state.step);

  useEffect(() => {
    if (state.step === prevStep.current) return;

    setAnimating(true);
    setSlideIn(false);

    const timer = setTimeout(() => {
      setDisplayStep(state.step);
      setSlideIn(true);
      prevStep.current = state.step;
      setTimeout(() => {
        setAnimating(false);
        setSlideIn(false);
      }, 350);
    }, 250);

    return () => clearTimeout(timer);
  }, [state.step]);

  const next = () => dispatch({ type: "NEXT_STEP" });

  const prev = () => {
    const idx = STEP_ORDER.indexOf(state.step);
    if (idx > 0) dispatch({ type: "GO_TO", step: STEP_ORDER[idx - 1] });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.step]);

  const progressIndex = PROGRESS_STEPS.indexOf(displayStep);
  const showProgress = displayStep !== Step.LANDING && displayStep !== Step.CONFIRMATION;

  const screenProps = { state, dispatch, onNext: next };

  function renderScreen() {
    switch (displayStep) {
      case Step.LANDING:            return <ScreenLanding {...screenProps} />;
      case Step.GUEST_CODE:         return <ScreenGuestCode {...screenProps} />;
      case Step.DESIGNATION:        return <ScreenDesignation {...screenProps} />;
      case Step.CAPTURE_BRIEFING:   return <ScreenCaptureBriefing {...screenProps} />;
      case Step.CAPTURE_LIVE:       return <ScreenCaptureLive {...screenProps} />;
      case Step.CAPTURE_CONFIRM:    return <ScreenCaptureConfirm {...screenProps} />;
      case Step.GENERATING_ID:      return <ScreenGeneratingId {...screenProps} />;
      case Step.BACKGROUND_SELECT:  return <ScreenBackgroundSelect {...screenProps} />;
      case Step.GENERATING_POSTER:  return <ScreenGeneratingPoster {...screenProps} />;
      case Step.RESULT:             return <ScreenResult {...screenProps} />;
      case Step.CONFIRMATION:       return <ScreenConfirmation {...screenProps} />;
      default:                      return null;
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Screen with slide transition */}
      <div
        className="w-full h-full transition-transform duration-[250ms] ease-in-out"
        style={{
          transform: animating
            ? slideIn
              ? "translateX(0)"
              : "translateX(-100%)"
            : slideIn
            ? "translateX(0)"
            : "translateX(0)",
        }}
      >
        {renderScreen()}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: "2px" }}>
          {PROGRESS_STEPS.map((s, i) => (
            <div
              key={s}
              className="flex-1 transition-colors duration-500"
              style={{
                background:
                  i <= progressIndex
                    ? "var(--color-primary)"
                    : "var(--color-surface-bright)",
                marginRight: i < PROGRESS_STEPS.length - 1 ? "2px" : "0",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
