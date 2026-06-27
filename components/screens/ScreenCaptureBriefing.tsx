"use client";

import { useEffect, useRef, useState } from "react";
import type { ScreenProps } from "@/lib/types";

export default function ScreenCaptureBriefing({ onNext }: ScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().then(() => setCameraReady(true));
        }
      })
      .catch(() => setCameraReady(true));
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

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

  return (
    <div className="w-full h-full flex bg-black select-none overflow-hidden">

      {/* LEFT — instructions */}
      <section style={{
        width: "45%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px 72px",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}>

        {/* Top block: label + headline + steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "52px" }}>
          <p style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            margin: 0,
          }}>
            CAPTURE SEQUENCE
          </p>

          <h1 style={{
            fontFamily: "var(--font-hanken)",
            fontSize: "clamp(64px, 7vw, 104px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
            color: "#ffffff",
            textTransform: "uppercase",
            margin: 0,
          }}>
            CAPTURE<br />SEQUENCE
          </h1>

          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
            {[
              { n: "01", text: "ALIGN TO CENTRAL AXIS", dim: true },
              { n: "02", text: "MAINTAIN NEUTRAL EXPRESSION", dim: true },
              { n: "03", text: "AWAIT SHUTTER COMMAND", dim: false },
            ].map(({ n, text, dim }, i, arr) => (
              <li key={n} style={{
                display: "flex",
                gap: "28px",
                alignItems: "flex-start",
                padding: "22px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}>
                <span style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.25)",
                  paddingTop: "3px",
                  flexShrink: 0,
                }}>{n}</span>
                <span style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: dim ? "rgba(255,255,255,0.6)" : "#ffffff",
                }}>{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom CTA */}
        <div
          onPointerDown={onNext}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            cursor: "pointer",
            fontFamily: "var(--font-space-mono)",
            fontSize: "13px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>START CAPTURING</span>
          <span style={{ fontSize: "18px", color: "#ffffff" }}>→</span>
        </div>
      </section>

      {/* RIGHT — live camera viewfinder */}
      <section style={{
        flex: 1,
        position: "relative",
        background: "#060606",
        overflow: "hidden",
      }}>

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
            opacity: cameraReady ? 0.82 : 0,
            transition: "opacity 1s ease",
          }}
        />

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
          border: "1px solid rgba(255,255,255,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}>
          <div style={{ width: 4, height: 4, background: "rgba(255,255,255,0.85)" }} />
        </div>

        {/* Status top-right */}
        <div style={{
          position: "absolute", top: 44, right: 48, zIndex: 3,
          fontFamily: "var(--font-space-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          lineHeight: 1.8,
          color: "rgba(255,255,255,0.55)",
          textAlign: "right",
        }}>
          <div>REC // ON</div>
          <div>F/1.4  ISO-100</div>
          <div style={{ marginTop: "6px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>{time}</div>
        </div>

        {!cameraReady && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-space-mono)",
            fontSize: "10px",
            letterSpacing: "0.25em",
            color: "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
          }}>
            INITIALIZING CAMERA...
          </div>
        )}
      </section>
    </div>
  );
}
