"use client";

import type { ScreenProps } from "@/lib/types";

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","DEL"];
const MAX_DIGITS = 6;

export default function ScreenGuestCode({ state, dispatch, onNext }: ScreenProps) {
  const code = state.guestCode;

  const handleKey = (key: string) => {
    if (key === "DEL") {
      dispatch({ type: "SET_CODE", value: code.slice(0, -1) });
    } else if (code.length < MAX_DIGITS) {
      const next = code + key;
      dispatch({ type: "SET_CODE", value: next });
      if (next.length === MAX_DIGITS) {
        setTimeout(onNext, 400);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black select-none">

      {/* Label */}
      <p style={{
        fontFamily: "var(--font-space-mono)",
        fontSize: "12px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.6)",
        marginBottom: "32px",
      }}>
        ENTER GUEST IDENTIFIER CODE
      </p>

      {/* 6 dash input display */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "48px" }}>
        {Array.from({ length: MAX_DIGITS }).map((_, i) => (
          <div key={i} style={{
            width: "32px",
            height: "2px",
            background: i < code.length ? "#ffffff" : "rgba(255,255,255,0.25)",
            transition: "background 0.15s ease",
          }} />
        ))}
      </div>

      {/* Numpad */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 100px)",
        gap: "8px",
      }}>
        {KEYS.map((key, i) => (
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onPointerDown={() => handleKey(key)}
              style={{
                height: "100px",
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontFamily: key === "DEL" ? "var(--font-space-mono)" : "var(--font-hanken)",
                fontSize: key === "DEL" ? "12px" : "48px",
                fontWeight: key === "DEL" ? 400 : 700,
                letterSpacing: key === "DEL" ? "0.2em" : "-0.02em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {key}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
