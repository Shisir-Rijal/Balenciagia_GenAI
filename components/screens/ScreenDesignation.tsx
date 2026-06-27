"use client";

import { useState } from "react";
import type { ScreenProps } from "@/lib/types";

const ROW1 = ["Q","W","E","R","T","Y","U","I","O","P"];
const ROW2 = ["A","S","D","F","G","H","J","K","L"];
const ROW3 = ["Z","X","C","V","B","N","M"];
const MAX = 16;
const KEYBOARD_HEIGHT = "42%";

export default function ScreenDesignation({ state, dispatch, onNext }: ScreenProps) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const name = state.designation;

  const handleKey = (key: string) => {
    if (key === "DEL") {
      dispatch({ type: "SET_DESIGNATION", value: name.slice(0, -1) });
    } else if (key === "SPACE") {
      if (name.length < MAX) dispatch({ type: "SET_DESIGNATION", value: name + " " });
    } else if (name.length < MAX) {
      dispatch({ type: "SET_DESIGNATION", value: name + key });
    }
  };

  const handleConfirm = () => {
    if (name.trim().length > 0) onNext();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black select-none overflow-hidden">

      {/* Upper area — shrinks when keyboard opens */}
      <div
        style={{
          height: keyboardOpen ? `calc(100% - ${KEYBOARD_HEIGHT})` : "100%",
          transition: "height 0.35s cubic-bezier(0.32, 0, 0.67, 0)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          cursor: "pointer",
          padding: "0 32px",
        }}
        onPointerDown={() => !keyboardOpen && setKeyboardOpen(true)}
      >
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "12px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          margin: 0,
        }}>
          ENTER DESIGNATION
        </p>

        {/* Name display with cursor */}
        <div style={{
          fontFamily: "var(--font-hanken)",
          fontSize: "clamp(40px, 5vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#ffffff",
          minHeight: "72px",
          display: "flex",
          alignItems: "center",
          margin: 0,
        }}>
          {name.length > 0
            ? name
            : <span style={{ color: "rgba(255,255,255,0.12)" }}>—</span>
          }
          {keyboardOpen && (
            <span style={{
              display: "inline-block",
              width: "3px",
              height: "0.8em",
              background: "#ffffff",
              marginLeft: "4px",
              animation: "blink 1s step-end infinite",
            }} />
          )}
        </div>

        {/* Underline */}
        <div style={{
          width: "min(400px, 60%)",
          height: "1px",
          background: keyboardOpen ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
          transition: "background 0.3s ease",
          margin: 0,
        }} />

        {!keyboardOpen && (
          <p style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
            margin: 0,
          }}>
            TAP TO ENTER
          </p>
        )}
      </div>

      {/* Archived subtext — always bottom */}
      <p style={{
        position: "absolute",
        bottom: keyboardOpen ? `calc(${KEYBOARD_HEIGHT} + 16px)` : "24px",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "var(--font-space-mono)",
        fontSize: "10px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.18)",
        whiteSpace: "nowrap",
        transition: "bottom 0.35s cubic-bezier(0.32, 0, 0.67, 0)",
        margin: 0,
      }}>
        THIS NAME WILL BE ARCHIVED.
      </p>

      {/* Keyboard */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: KEYBOARD_HEIGHT,
        background: "#090909",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        transform: keyboardOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.32, 0, 0.67, 0)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "2px",
        padding: "12px 24px",
      }}>
        <Row keys={ROW1} onPress={handleKey} />
        <Row keys={ROW2} onPress={handleKey} />

        <div style={{ display: "flex", justifyContent: "center", gap: "2px" }}>
          <Key label="DEL" onPress={handleKey} fixedWidth={96} />
          {ROW3.map(k => <Key key={k} label={k} onPress={handleKey} />)}
          <Key label="→" onPress={handleConfirm} fixedWidth={96} highlight={name.trim().length > 0} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "2px" }}>
          <Key label="SPACE" onPress={handleKey} fixedWidth={480} />
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Row({ keys, onPress }: { keys: string[]; onPress: (k: string) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "2px" }}>
      {keys.map(k => <Key key={k} label={k} onPress={onPress} />)}
    </div>
  );
}

function Key({ label, onPress, fixedWidth, highlight = false }: {
  label: string;
  onPress: (k: string) => void;
  fixedWidth?: number;
  highlight?: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onPointerDown={(e) => {
        e.stopPropagation();
        setPressed(true);
        onPress(label === "SPACE" ? "SPACE" : label);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: fixedWidth ? `${fixedWidth}px` : undefined,
        flex: fixedWidth ? undefined : 1,
        height: "52px",
        background: highlight ? "#ffffff" : pressed ? "rgba(255,255,255,0.09)" : "transparent",
        border: "none",
        color: highlight ? "#000000" : pressed ? "#ffffff" : "rgba(255,255,255,0.7)",
        fontFamily: "var(--font-space-mono)",
        fontSize: label === "→" ? "18px" : "11px",
        letterSpacing: "0.12em",
        cursor: "pointer",
        transition: "background 0.08s, color 0.08s",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
