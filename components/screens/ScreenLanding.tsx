"use client";

import { useEffect, useState } from "react";
import type { ScreenProps } from "@/lib/types";

export default function ScreenLanding({ onNext }: ScreenProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}:${ms}`);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onPointerDown={onNext}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/backgrounds/landing.jpg')",
            filter: "blur(2px) brightness(0.4)",
            transform: "scale(1.05)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      </div>

      {/* Film grain */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          opacity: 0.15,
          mixBlendMode: "overlay",
        }}
      />

      {/* Horizontal scan line */}
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.12)",
          animation: "scanH 6s linear infinite",
        }}
      />

      {/* Top bar */}
      <header className="relative z-30 flex justify-between items-start px-16 pt-8">
        <span
          className="text-white/40"
          style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          SYS://VETEMENTS_SS24
        </span>
        <span
          className="text-white/40 tabular-nums"
          style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "12px",
            letterSpacing: "0.2em",
          }}
        >
          {time}
        </span>
      </header>

      {/* Center content */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center gap-6">
        {/* VETEMENTS outline */}
        <h1
          style={{
            fontFamily: "var(--font-hanken)",
            fontSize: "clamp(80px, 14vw, 200px)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.7)",
            margin: 0,
          }}
        >
          VETEMENTS
        </h1>

        {/* S/S 24 */}
        <h2
          style={{
            fontFamily: "var(--font-hanken)",
            fontSize: "clamp(24px, 3vw, 48px)",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}
        >
          S / S &nbsp; 2 4
        </h2>

        {/* ENTER CTA */}
        <div
          className="flex items-center gap-4 mt-12 cursor-pointer group"
          style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "14px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span className="group-active:text-white transition-colors">ENTER</span>
          <span
            className="group-active:translate-x-2 transition-transform duration-200"
            style={{ fontSize: "18px" }}
          >
            →
          </span>
        </div>
      </main>

      <style>{`
        @keyframes scanH {
          0%   { top: -1px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
