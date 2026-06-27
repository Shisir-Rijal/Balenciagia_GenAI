"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScreenProps } from "@/lib/types";

type Phase = "live" | "flash" | "captured";
const COUNTDOWN_S = 3;

export default function ScreenCaptureLive({ dispatch, onNext }: ScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("live");
  const [capturedSrc, setCapturedSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);       // 0→1 over COUNTDOWN_S seconds
  const [statusSecs, setStatusSecs] = useState(COUNTDOWN_S); // countdown display
  const [time, setTime] = useState("");
  const [focusFlash, setFocusFlash] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" },
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch { /* camera denied */ }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    const base64 = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedSrc(base64);
    dispatch({ type: "SET_CAPTURED_IMAGE", base64 });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    // brief focus flash → then freeze
    setFocusFlash(true);
    setPhase("flash");
    setTimeout(() => {
      setFocusFlash(false);
      setPhase("captured");
    }, 300);
  }, [dispatch]);

  // camera on mount
  useEffect(() => {
    startCamera();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [startCamera]);

  // progress bar + countdown ticker
  useEffect(() => {
    if (phase !== "live") return;

    setProgress(0);
    setStatusSecs(COUNTDOWN_S);

    const start = Date.now();
    const duration = COUNTDOWN_S * 1000;

    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      setStatusSecs(Math.max(1, Math.ceil(COUNTDOWN_S - elapsed / 1000)));

      if (p >= 1) {
        clearInterval(id);
        capture();
      }
    }, 32);

    return () => clearInterval(id);
  }, [phase, capture]);

  // live clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const p = (x: number) => String(x).padStart(2, "0");
      setTime(`${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}:${p(Math.floor(n.getMilliseconds() / 10))}`);
    };
    tick();
    const id = setInterval(tick, 83);
    return () => clearInterval(id);
  }, []);

  const handleRetry = () => {
    setCapturedSrc(null);
    setProgress(0);
    setPhase("live");
    startCamera();
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Live feed */}
      {(phase === "live" || phase === "flash") && (
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
          }}
        />
      )}

      {/* Frozen frame */}
      {phase === "captured" && capturedSrc && (
        <img
          src={capturedSrc}
          alt="captured"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* White flash on capture */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#ffffff",
        opacity: phase === "flash" ? 0.75 : 0,
        transition: phase === "flash" ? "none" : "opacity 0.3s ease",
        pointerEvents: "none",
        zIndex: 20,
      }} />

      {/* HUD — visible in all phases */}

      {/* Corner brackets */}
      <div style={{ position: "absolute", top: 32, left: 32, width: 60, height: 60, borderTop: "1px solid rgba(255,255,255,0.85)", borderLeft: "1px solid rgba(255,255,255,0.85)" }} />
      <div style={{ position: "absolute", top: 32, right: 32, width: 60, height: 60, borderTop: "1px solid rgba(255,255,255,0.85)", borderRight: "1px solid rgba(255,255,255,0.85)" }} />
      <div style={{ position: "absolute", bottom: 32, left: 32, width: 60, height: 60, borderBottom: "1px solid rgba(255,255,255,0.85)", borderLeft: "1px solid rgba(255,255,255,0.85)" }} />
      <div style={{ position: "absolute", bottom: 32, right: 32, width: 60, height: 60, borderBottom: "1px solid rgba(255,255,255,0.85)", borderRight: "1px solid rgba(255,255,255,0.85)" }} />

      {/* Crosshair */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.15 }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "#fff" }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "#fff" }} />
      </div>

      {/* Center focus square */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 30, height: 30,
        border: `1px solid ${focusFlash ? "#ffffff" : "rgba(255,255,255,0.75)"}`,
        boxShadow: focusFlash ? "0 0 20px rgba(255,255,255,0.9)" : "none",
        transition: "box-shadow 0.1s, border-color 0.1s",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2,
      }}>
        <div style={{
          width: 4, height: 4,
          background: focusFlash ? "#ffffff" : "rgba(255,255,255,0.85)",
        }} />
      </div>

      {/* Status top-right */}
      <div style={{
        position: "absolute", top: 44, right: 48, zIndex: 3,
        fontFamily: "var(--font-space-mono)",
        fontSize: "10px",
        letterSpacing: "0.15em",
        lineHeight: 1.8,
        textAlign: "right",
      }}>
        {phase === "live" ? (
          <>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>REC // ON</div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>F/1.4  ISO-100</div>
            <div style={{ marginTop: "6px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>{time}</div>
            <div style={{
              marginTop: "12px",
              color: statusSecs <= 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
              letterSpacing: "0.12em",
              transition: "color 0.3s",
            }}>
              CAPTURE IN 0{statusSecs}s
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>CAPTURED</div>
            <div style={{ marginTop: "6px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>{time}</div>
          </>
        )}
      </div>

      {/* Progress bar — live phase only */}
      {phase === "live" && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: "rgba(255,255,255,0.1)",
          zIndex: 5,
        }}>
          <div style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "#ffffff",
            transition: "width 0.032s linear",
          }} />
        </div>
      )}

      {/* Bottom gradient for button readability */}
      {phase === "captured" && (
        <div style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          height: "30%",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />
      )}

      {/* RETRY / CONFIRM */}
      {phase === "captured" && (
        <div style={{
          position: "absolute",
          bottom: "52px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "20px",
          zIndex: 10,
        }}>
          <button
            onPointerDown={handleRetry}
            style={{
              width: "360px",
              height: "60px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-space-mono)",
              fontSize: "11px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            RETRY
          </button>

          <button
            onPointerDown={onNext}
            style={{
              width: "360px",
              height: "60px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.75)",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-space-mono)",
              fontSize: "11px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            CONFIRM
          </button>
        </div>
      )}
    </div>
  );
}
