"use client";

import { useEffect, useRef, useState } from "react";
import type { ScreenProps } from "@/lib/types";

const POLL_INTERVAL = 6000;
const MAX_WAIT_MS = 420_000; // 7 min timeout → MiniMax can take 3–6 min

export default function ScreenGeneratingVideo({ state, dispatch, onNext }: ScreenProps) {
  const [dots, setDots] = useState(".");
  const [phase, setPhase] = useState<"uploading" | "rendering" | "finalizing">("uploading");

  const SESSION_KEY = "video_request_id";

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    (async () => {
      // Use the composited poster (person already in environment) as first frame.
      // This gives Veo a complete cinematic scene to animate rather than a floating cutout.
      let imageBase64: string | null = state.generatedCutoutUrl ?? state.capturedImageBase64 ?? null;

      if (state.generatedPosterUrl) {
        try {
          const res = await fetch(state.generatedPosterUrl);
          const blob = await res.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          console.log("[video screen] using poster as first frame:", imageBase64.length, "chars");
        } catch {
          console.warn("[video screen] poster fetch failed, falling back to cutout");
        }
      } else {
        console.log("[video screen] no poster, falling back to cutout");
      }

      if (!imageBase64 || !imageBase64.startsWith("data:")) {
        await new Promise((r) => setTimeout(r, 6000));
        if (!cancelled) onNext();
        return;
      }

      try {
        // Recover existing requestId across HMR rebuilds / StrictMode remounts
        let requestId = sessionStorage.getItem(SESSION_KEY);

        if (!requestId) {
          setPhase("uploading");
          console.log("[video] submitting to /api/generate/video");
          const submitRes = await fetch("/api/generate/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64, selectedBackground: state.selectedBackground }),
          });

          const submitText = await submitRes.text();
          console.log("[video] submit response", submitRes.status, submitText);

          if (!submitRes.ok) {
            console.warn("[video] submit failed, skipping");
            await new Promise((r) => setTimeout(r, 4000));
            if (!cancelled) onNext();
            return;
          }

          const submitJson = JSON.parse(submitText);
          requestId = submitJson.requestId;
          console.log("[video] requestId:", requestId);

          if (!requestId) {
            console.warn("[video] no requestId, skipping");
            if (!cancelled) onNext();
            return;
          }

          sessionStorage.setItem(SESSION_KEY, requestId);
        } else {
          console.log("[video] resuming existing requestId:", requestId);
        }

        setPhase("rendering");

        // Poll status
        while (!cancelled) {
          if (Date.now() - started > MAX_WAIT_MS) {
            sessionStorage.removeItem(SESSION_KEY);
            console.warn("[video] timeout, skipping");
            if (!cancelled) onNext();
            return;
          }

          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
          if (cancelled) return;

          const statusRes = await fetch(`/api/generate/video/status?requestId=${requestId}`);
          const statusJson = await statusRes.json();
          console.log("[video] poll:", statusJson);
          const { status, videoUrl } = statusJson;

          if (status === "COMPLETED" && videoUrl) {
            sessionStorage.removeItem(SESSION_KEY);
            setPhase("finalizing");
            dispatch({ type: "SET_VIDEO_URL", url: videoUrl });
            await new Promise((r) => setTimeout(r, 800));
            if (!cancelled) onNext();
            return;
          }

          if (status === "FAILED") {
            sessionStorage.removeItem(SESSION_KEY);
            console.error("[video] generation FAILED, detail:", statusJson.detail ?? "none");
            if (!cancelled) onNext();
            return;
          }
        }
      } catch (err) {
        console.error("[video] unexpected error:", err);
        if (!cancelled) onNext();
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = state.capturedImageBase64;

  const statusLabel =
    phase === "uploading"
      ? `UPLOADING${dots}`
      : phase === "finalizing"
      ? `FINALIZING${dots}`
      : `RENDERING FILM${dots}`;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col items-center justify-center gap-4">

      {/* Ambient background — guest photo */}
      {photo && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(1) blur(48px) brightness(0.08)",
          transform: "scale(1.12)",
        }} />
      )}

      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 10%, rgba(0,0,0,0.97) 65%)",
        pointerEvents: "none",
      }} />

      {/* Cinematic frame — fits viewport height on all screen sizes */}
      <div style={{
        position: "relative",
        height: "clamp(300px, 58vh, 640px)",
        aspectRatio: "9/16",
        width: "auto",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#050505",
        boxShadow: "0 0 120px rgba(0,0,0,0.98), inset 0 0 60px rgba(0,0,0,0.8)",
        flexShrink: 0,
        zIndex: 2,
        overflow: "hidden",
      }}>
        {photo && (
          <img src={photo} alt="" style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            filter: "grayscale(1) contrast(1.4) brightness(0.7)",
            animation: "slowPan 8s ease-in-out infinite alternate",
          }} />
        )}

        {/* Scan lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)",
          pointerEvents: "none",
        }} />

        {/* Noise overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
          opacity: 0.18,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }} />

        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 80px rgba(0,0,0,0.95)", pointerEvents: "none" }} />

        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 8, left: 8, width: 16, height: 16, borderTop: "1px solid rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.4)" }} />
        <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderTop: "1px solid rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.4)" }} />
        <div style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderBottom: "1px solid rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.4)" }} />
        <div style={{ position: "absolute", bottom: 8, right: 8, width: 16, height: 16, borderBottom: "1px solid rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.4)" }} />

        {/* REC indicator */}
        <div style={{
          position: "absolute", top: 16, left: 16,
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#fff",
            animation: "blink 1.4s step-end infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "8px",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.6)",
          }}>
            GEN
          </span>
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
          {statusLabel}
        </p>
      </div>

      <style>{`
        @keyframes slowPan {
          0%   { transform: scale(1.08) translateY(0); }
          100% { transform: scale(1.12) translateY(-4%); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
      `}</style>
    </div>
  );
}
