"use client";

import type { ScreenProps } from "@/lib/types";

export default function ScreenConfirmation({ state, dispatch, onNext }: ScreenProps) {
  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">

      {/* Name — full bleed headline */}
      <h1 style={{
        fontFamily: "var(--font-hanken)",
        fontSize: "clamp(72px, 11vw, 160px)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        color: "#ffffff",
        textTransform: "uppercase",
        textAlign: "center",
        margin: "0 0 48px 0",
        padding: "0 40px",
        wordBreak: "break-all",
      }}>
        {state.designation || "GUEST"}
      </h1>

      {/* Confirmation text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          margin: 0,
        }}>
          YOUR CREDENTIAL HAS BEEN DISPATCHED.
        </p>
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          margin: 0,
        }}>
          CHECK YOUR TRANSMISSION ADDRESS.
        </p>
      </div>

      {/* Reset — bottom */}
      <button
        onPointerDown={handleReset}
        style={{
          position: "absolute",
          bottom: "48px",
          background: "transparent",
          border: "none",
          fontFamily: "var(--font-space-mono)",
          fontSize: "10px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
          cursor: "pointer",
          padding: "8px 16px",
        }}
      >
        START_NEW_SEQUENCE
      </button>
    </div>
  );
}
