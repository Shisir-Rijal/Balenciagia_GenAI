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

  useEffect(() => {
    const id = setInterval(() => setStatusIndex((i) => (i + 1) % STATUS_LINES.length), 1800);
    return () => clearInterval(id);
  }, []);

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

        pollRef.current = setInterval(async () => {
          try {
            const s = await fetch(`/api/status/${promptId}`);
            const { status, imageUrl } = await s.json();
            if (status === "done" && imageUrl) {
              clearInterval(pollRef.current!);
              dispatch({ type: "SET_ID_CARD_URL", url: imageUrl });
              onNext();
            }
          } catch { /* keep polling */ }
        }, 2000);
      } catch {
        setError("CONNECTION FAILED — RETRYING...");
      }
    })();

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = state.capturedImageBase64;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col items-center justify-center gap-10">

      {/* Ambient background — blurred photo, very dark */}
      {photo && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(1) contrast(1.25) blur(40px) brightness(0.12)",
          transform: "scale(1.1)",
        }} />
      )}

      {/* Radial vignette over background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.92) 75%)",
        pointerEvents: "none",
      }} />

      {/* Portrait frame */}
      <div style={{
        position: "relative",
        width: "clamp(260px, 22vw, 380px)",
        aspectRatio: "9/12",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "6px",
        background: "#0a0a0a",
        boxShadow: "0 0 80px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.6)",
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>

          {/* The photo */}
          {photo ? (
            <img
              src={photo}
              alt="captured"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                filter: "grayscale(1) contrast(1.35) brightness(0.88)",
                animation: "flicker 5s infinite alternate",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#0d0d0d" }} />
          )}

          {/* Silver-nitrate noise overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
            opacity: 0.35,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }} />

          {/* Deep inner vignette */}
          <div style={{
            position: "absolute", inset: 0,
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.85)",
            pointerEvents: "none",
          }} />

          {/* Scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: "1px",
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)",
            animation: "scan 2.8s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          {/* Corner brackets */}
          {[
            { top: 8, left: 8, borderTop: "1px solid rgba(255,255,255,0.6)", borderLeft: "1px solid rgba(255,255,255,0.6)" },
            { top: 8, right: 8, borderTop: "1px solid rgba(255,255,255,0.6)", borderRight: "1px solid rgba(255,255,255,0.6)" },
            { bottom: 8, left: 8, borderBottom: "1px solid rgba(255,255,255,0.6)", borderLeft: "1px solid rgba(255,255,255,0.6)" },
            { bottom: 8, right: 8, borderBottom: "1px solid rgba(255,255,255,0.6)", borderRight: "1px solid rgba(255,255,255,0.6)" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 16, height: 16, ...s }} />
          ))}

          {/* Center crosshair */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0.25, pointerEvents: "none",
          }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "#fff" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "#fff" }} />
          </div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: "center", zIndex: 2 }}>
        <h1 style={{
          fontFamily: "var(--font-hanken)",
          fontSize: "clamp(52px, 6.5vw, 88px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 0.88,
          color: "#ffffff",
          textTransform: "uppercase",
          margin: "0 0 28px 0",
        }}>
          ASSEMBLING<br />IDENTITY
        </h1>

        {/* Status pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 20px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
        }}>
          <span style={{
            display: "inline-block",
            width: 6, height: 6,
            background: error ? "rgba(255,80,80,0.8)" : "#ffffff",
            animation: error ? "none" : "blink 1.2s step-end infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: error ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.45)",
          }}>
            {error ?? STATUS_LINES[statusIndex]}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes flicker {
          0%   { opacity: 0.92; }
          5%   { opacity: 0.86; }
          10%  { opacity: 0.94; }
          20%  { opacity: 0.9; }
          50%  { opacity: 1; }
          80%  { opacity: 0.93; }
          100% { opacity: 0.88; }
        }
        @keyframes scan {
          0%   { top: 0%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
