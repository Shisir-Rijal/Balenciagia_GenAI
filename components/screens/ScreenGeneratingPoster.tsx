"use client";

import { useEffect, useRef, useState } from "react";
import type { ScreenProps } from "@/lib/types";

const BG_PATHS: Record<string, string> = {
  "env1": "/backgrounds/env1.JPG",
  "env2": "/backgrounds/env2.JPG",
  "env3": "/backgrounds/env3.JPG",
  "P-BG3": "/backgrounds/P-BG3.png",
};

export default function ScreenGeneratingPoster({ state, dispatch, onNext }: ScreenProps) {
  const [dots, setDots] = useState(".");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/generate/poster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: state.capturedImageBase64,
            background: state.selectedBackground,
            guestCode: state.guestCode,
            designation: state.designation,
          }),
        });
        if (!res.ok) return;
        const { promptId } = await res.json();

        pollRef.current = setInterval(async () => {
          try {
            const s = await fetch(`/api/status/${promptId}`);
            const { status, imageUrl } = await s.json();
            if (status === "done" && imageUrl) {
              clearInterval(pollRef.current!);
              dispatch({ type: "SET_POSTER_URL", url: imageUrl });
              onNext();
            }
          } catch { /* keep polling */ }
        }, 2000);
      } catch { /* fail silently */ }
    })();

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = state.capturedImageBase64;
  const bgSrc = state.selectedBackground ? BG_PATHS[state.selectedBackground] : null;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col items-center justify-center gap-8">

      {/* Selected background — very dark, blurred */}
      {bgSrc && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${bgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(32px) brightness(0.12)",
          transform: "scale(1.08)",
        }} />
      )}

      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.95) 70%)",
        pointerEvents: "none",
      }} />

      {/* Portrait frame — same as GeneratingId */}
      <div style={{
        position: "relative",
        width: "clamp(220px, 18vw, 300px)",
        aspectRatio: "2/3",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "5px",
        background: "#080808",
        boxShadow: "0 0 100px rgba(0,0,0,0.95), inset 0 0 40px rgba(0,0,0,0.7)",
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          {photo ? (
            <img
              src={photo}
              alt=""
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                filter: "grayscale(1) contrast(1.3) brightness(0.85)",
                animation: "flicker 0.18s step-end infinite",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#0d0d0d" }} />
          )}

          {/* Noise */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "160px 160px",
            opacity: 0.3,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }} />

          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,0.9)", pointerEvents: "none" }} />

          {/* Corner brackets */}
          <div style={{ position: "absolute", top: 6, left: 6, width: 12, height: 12, borderTop: "1px solid rgba(255,255,255,0.5)", borderLeft: "1px solid rgba(255,255,255,0.5)" }} />
          <div style={{ position: "absolute", top: 6, right: 6, width: 12, height: 12, borderTop: "1px solid rgba(255,255,255,0.5)", borderRight: "1px solid rgba(255,255,255,0.5)" }} />
          <div style={{ position: "absolute", bottom: 6, left: 6, width: 12, height: 12, borderBottom: "1px solid rgba(255,255,255,0.5)", borderLeft: "1px solid rgba(255,255,255,0.5)" }} />
          <div style={{ position: "absolute", bottom: 6, right: 6, width: 12, height: 12, borderBottom: "1px solid rgba(255,255,255,0.5)", borderRight: "1px solid rgba(255,255,255,0.5)" }} />
        </div>
      </div>

      {/* Name + status */}
      <div style={{ textAlign: "center", zIndex: 2, display: "flex", flexDirection: "column", gap: "16px" }}>
        {state.designation && (
          <p style={{
            fontFamily: "var(--font-hanken)",
            fontSize: "clamp(28px, 3vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textTransform: "uppercase",
            margin: 0,
          }}>
            {state.designation}
          </p>
        )}
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          margin: 0,
        }}>
          COMPOSING{dots}
        </p>
      </div>

      <style>{`
        @keyframes flicker {
          0%  { opacity: 1; }
          8%  { opacity: 0.15; }
          12% { opacity: 0.9; }
          20% { opacity: 0.05; }
          25% { opacity: 1; }
          40% { opacity: 0.7; }
          45% { opacity: 0.08; }
          50% { opacity: 1; }
          62% { opacity: 0.3; }
          65% { opacity: 0.95; }
          78% { opacity: 0.05; }
          82% { opacity: 1; }
          91% { opacity: 0.6; }
          95% { opacity: 0.1; }
          100%{ opacity: 1; }
        }
      `}</style>
    </div>
  );
}
