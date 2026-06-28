"use client";

import { useEffect, useRef, useState } from "react";
import type { ScreenProps } from "@/lib/types";

const STATUS_LINES = [
  "PROCESSING CAPTURE...",
  "EXTRACTING IDENTITY...",
  "ASSEMBLING CREDENTIAL...",
  "CALIBRATING ARCHIVE...",
  "FINALIZING RECORD...",
];

export default function ScreenGeneratingId({ state, dispatch, onNext }: ScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  // cycle status text
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // kick off generation + polling
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/generate/idcard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: state.capturedImageBase64,
            guestCode: state.guestCode,
            designation: state.designation,
          }),
        });

        if (!res.ok) throw new Error("generate failed");
        const { promptId } = await res.json();

        // poll for result
        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/status/${promptId}`);
            const { status, imageUrl } = await statusRes.json();
            if (status === "done" && imageUrl) {
              clearInterval(pollRef.current!);
              dispatch({ type: "SET_ID_CARD_URL", url: imageUrl });
              onNext();
            }
          } catch {
            // transient poll error — keep trying
          }
        }, 2000);
      } catch {
        setError("CONNECTION FAILED — RETRYING...");
      }
    })();

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const photo = state.capturedImageBase64;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col items-center justify-center">

      {/* Background: blurred captured photo */}
      {photo && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(32px) brightness(0.18)",
          transform: "scale(1.08)",
        }} />
      )}

      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
        pointerEvents: "none",
      }} />

      {/* Portrait frame */}
      <div style={{
        position: "relative",
        width: "320px",
        aspectRatio: "3/4",
        flexShrink: 0,
        marginBottom: "48px",
      }}>
        {photo ? (
          <img
            src={photo}
            alt="captured"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#111" }} />
        )}

        {/* HUD corner brackets */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 24, height: 24, borderTop: "1px solid rgba(255,255,255,0.8)", borderLeft: "1px solid rgba(255,255,255,0.8)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, borderTop: "1px solid rgba(255,255,255,0.8)", borderRight: "1px solid rgba(255,255,255,0.8)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 24, height: 24, borderBottom: "1px solid rgba(255,255,255,0.8)", borderLeft: "1px solid rgba(255,255,255,0.8)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderBottom: "1px solid rgba(255,255,255,0.8)", borderRight: "1px solid rgba(255,255,255,0.8)" }} />

        {/* Scan line animation */}
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)",
          animation: "scan 2.4s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "var(--font-hanken)",
        fontSize: "clamp(56px, 7vw, 96px)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 0.9,
        color: "#ffffff",
        textTransform: "uppercase",
        textAlign: "center",
        margin: 0,
        marginBottom: "32px",
        position: "relative",
        zIndex: 2,
      }}>
        ASSEMBLING<br />IDENTITY
      </h1>

      {/* Status text */}
      <p style={{
        fontFamily: "var(--font-space-mono)",
        fontSize: "11px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: error ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.4)",
        margin: 0,
        position: "relative",
        zIndex: 2,
        transition: "opacity 0.4s ease",
      }}>
        {error ?? STATUS_LINES[statusIndex]}
      </p>

      <style>{`
        @keyframes scan {
          0%   { top: 0%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
