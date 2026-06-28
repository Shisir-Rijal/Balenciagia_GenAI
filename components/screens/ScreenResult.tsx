"use client";

import { useState } from "react";
import type { ScreenProps } from "@/lib/types";

const ROW1 = ["Q","W","E","R","T","Y","U","I","O","P"];
const ROW2 = ["A","S","D","F","G","H","J","K","L"];
const ROW3 = ["Z","X","C","V","B","N","M"];
const KEYBOARD_H = "44%";

export default function ScreenResult({ state, dispatch, onNext }: ScreenProps) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const email = state.email;
  const hasPoster = !!state.generatedPosterUrl;

  const handleKey = (k: string) => {
    if (k === "DEL") {
      dispatch({ type: "SET_EMAIL", value: email.slice(0, -1) });
    } else if (k === "SPACE") {
      // no spaces in email
    } else {
      dispatch({ type: "SET_EMAIL", value: email + k });
    }
  };

  const handleDispatch = async () => {
    if (!email.includes("@") || sending) return;
    setSending(true);
    try {
      await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          designation: state.designation,
          guestCode: state.guestCode,
          idCardUrl: state.generatedIdCardUrl ?? null,
          posterUrl: state.generatedPosterUrl ?? null,
        }),
      });
    } catch { /* fail silently */ }
    onNext();
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col">

      {/* Asset area — shrinks when keyboard opens */}
      <div style={{
        height: keyboardOpen ? `calc(100% - ${KEYBOARD_H} - 120px)` : "60%",
        transition: "height 0.35s cubic-bezier(0.32,0,0.67,0)",
        flexShrink: 0,
        display: "flex",
        gap: "8px",
        padding: "24px 48px 16px",
        overflow: "hidden",
      }}>
        {/* ID Card */}
        <div style={{
          flex: 1,
          position: "relative",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          background: "#080808",
        }}>
          {state.generatedIdCardUrl ? (
            <img src={state.generatedIdCardUrl} alt="ID Card"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            /* placeholder — card layout preview */
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>VETEMENTS S/S24</span>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>ID_{state.guestCode || "000000"}</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                <div style={{ fontFamily: "var(--font-hanken)", fontSize: "clamp(20px, 3vw, 36px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                  {state.designation || "—"}
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>ARCHIVED // SS24</span>
              </div>
            </div>
          )}
          {/* Corner brackets */}
          <div style={{ position: "absolute", top: 8, left: 8, width: 16, height: 16, borderTop: "1px solid rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderTop: "1px solid rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderBottom: "1px solid rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", bottom: 8, right: 8, width: 16, height: 16, borderBottom: "1px solid rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.4)" }} />
        </div>

        {/* Poster — only if generated */}
        {hasPoster && (
          <div style={{
            flex: 1,
            position: "relative",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}>
            <img src={state.generatedPosterUrl!} alt="Poster"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 16, left: 20 }}>
              <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>SYS.LOG // SECURE</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom content — email + dispatch */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        bottom: keyboardOpen ? `calc(${KEYBOARD_H} + 8px)` : "24px",
        transition: "bottom 0.35s cubic-bezier(0.32,0,0.67,0)",
        padding: "0 48px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          margin: 0,
          textAlign: "center",
        }}>
          [ FINALIZING SEQUENCE ]
        </p>

        <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
          {/* Email field */}
          <div
            onPointerDown={() => setKeyboardOpen(true)}
            style={{
              flex: 1,
              borderBottom: `1px solid ${keyboardOpen ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)"}`,
              paddingBottom: "12px",
              cursor: "text",
              transition: "border-color 0.2s",
            }}
          >
            <p style={{
              fontFamily: "var(--font-space-mono)",
              fontSize: "9px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              margin: "0 0 10px 0",
            }}>
              TRANSMISSION ADDRESS
            </p>
            <div style={{
              fontFamily: "var(--font-space-mono)",
              fontSize: "13px",
              letterSpacing: "0.05em",
              color: email ? "#ffffff" : "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              minHeight: "18px",
            }}>
              <span>{email || "..."}</span>
              {keyboardOpen && (
                <span style={{
                  display: "inline-block", width: "2px", height: "13px",
                  background: "#fff", marginLeft: "2px",
                  animation: "blink 1s step-end infinite",
                }} />
              )}
            </div>
          </div>

          {/* Dispatch — always white */}
          <button
            onPointerDown={handleDispatch}
            style={{
              flexShrink: 0,
              alignSelf: "flex-end",
              height: "48px",
              padding: "0 32px",
              background: sending ? "rgba(255,255,255,0.6)" : "#ffffff",
              border: "none",
              color: "#000000",
              fontFamily: "var(--font-space-mono)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: sending ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "background 0.2s",
            }}
          >
            {sending ? "SENDING..." : <>{`DISPATCH`} <span style={{ fontSize: "15px" }}>→</span></>}
          </button>
        </div>
      </div>

      {/* Keyboard */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        height: KEYBOARD_H,
        background: "#090909",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        transform: keyboardOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.32,0,0.67,0)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "2px",
        padding: "10px 24px",
      }}>
        <KbRow keys={ROW1} onPress={handleKey} />
        <KbRow keys={ROW2} onPress={handleKey} />
        <div style={{ display: "flex", justifyContent: "center", gap: "2px" }}>
          <KbKey label="DEL" onPress={handleKey} fixedWidth={80} />
          {ROW3.map(k => <KbKey key={k} label={k} onPress={handleKey} />)}
          <KbKey label="→" onPress={handleDispatch} fixedWidth={80} highlight={email.includes("@")} />
        </div>
        {/* Email special chars */}
        <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginTop: "2px" }}>
          {["@", ".", "-", "_", ".COM"].map(k => (
            <KbKey key={k} label={k} onPress={(v) => dispatch({ type: "SET_EMAIL", value: email + (v === ".COM" ? ".com" : v) })} fixedWidth={k === ".COM" ? 120 : 80} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}

function KbRow({ keys, onPress }: { keys: string[]; onPress: (k: string) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "2px" }}>
      {keys.map(k => <KbKey key={k} label={k} onPress={onPress} />)}
    </div>
  );
}

function KbKey({ label, onPress, fixedWidth, highlight = false }: {
  label: string; onPress: (k: string) => void; fixedWidth?: number; highlight?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={(e) => { e.stopPropagation(); setPressed(true); onPress(label); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: fixedWidth ? `${fixedWidth}px` : undefined,
        flex: fixedWidth ? undefined : 1,
        height: "46px",
        background: highlight ? "#ffffff" : pressed ? "rgba(255,255,255,0.09)" : "transparent",
        border: "none",
        color: highlight ? "#000" : pressed ? "#fff" : "rgba(255,255,255,0.65)",
        fontFamily: "var(--font-space-mono)",
        fontSize: "10px",
        letterSpacing: "0.1em",
        cursor: "pointer",
        transition: "background 0.06s",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
