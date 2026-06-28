"use client";

import { useRef, useState } from "react";
import type { ScreenProps } from "@/lib/types";

const BACKGROUNDS = [
  { id: "P-BG1", src: "/backgrounds/P-BG1.png" },
  { id: "P-BG2", src: "/backgrounds/P-BG2.png" },
  { id: "P-BG3", src: "/backgrounds/P-BG3.png" },
  { id: "P-BG4", src: "/backgrounds/P-BG4.png" },
];

export default function ScreenBackgroundSelect({ state, dispatch, onNext }: ScreenProps) {
  const [selected, setSelected] = useState<string | null>(state.selectedBackground);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const hasDragged = useRef(false);

  // — drag logic on the track —
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    dragStartScroll.current = trackRef.current?.scrollLeft ?? 0;
    hasDragged.current = false;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) return;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > 6) hasDragged.current = true;
    if (trackRef.current) trackRef.current.scrollLeft = dragStartScroll.current + delta;
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasDragged.current) {
      // treat as tap — find which card is under the pointer
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el?.closest("[data-bg-id]") as HTMLElement | null;
      const id = card?.dataset.bgId;
      if (id) {
        setSelected(id);
        dispatch({ type: "SET_BACKGROUND", background: id });
      }
    }
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const handleGenerate = () => {
    if (!selected) return;
    onNext();
  };

  const handleSkip = () => {
    dispatch({ type: "SET_WANTS_POSTER", value: false });
    // navigate directly to RESULT
    dispatch({ type: "GO_TO", step: "RESULT" as never });
  };

  return (
    <div className="w-full h-full bg-black flex flex-col select-none overflow-hidden">

      {/* Header */}
      <div style={{ padding: "52px 72px 36px", flexShrink: 0 }}>
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          margin: "0 0 14px 0",
        }}>
          POSTER GENERATION
        </p>
        <h1 style={{
          fontFamily: "var(--font-hanken)",
          fontSize: "clamp(48px, 5.5vw, 76px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 0.9,
          color: "#ffffff",
          textTransform: "uppercase",
          margin: 0,
        }}>
          SELECT ENVIRONMENT
        </h1>
      </div>

      {/* Swipeable image track */}
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          gap: "12px",
          paddingLeft: "72px",
          overflowX: "scroll",
          overflowY: "hidden",
          scrollbarWidth: "none",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <style>{`::-webkit-scrollbar{display:none}`}</style>

        {BACKGROUNDS.map((bg, i) => {
          const isSelected = selected === bg.id;
          return (
            <div
              key={bg.id}
              data-bg-id={bg.id}
              style={{
                flexShrink: 0,
                width: "500px",
                position: "relative",
                overflow: "hidden",
                outline: isSelected ? "2px solid #ffffff" : "2px solid transparent",
                transition: "outline-color 0.15s ease",
              }}
            >
              <img
                src={bg.src}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: isSelected ? "brightness(1)" : "brightness(0.5)",
                  transition: "filter 0.2s ease",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />

              {/* Index label — always visible */}
              <span style={{
                position: "absolute",
                bottom: 16, left: 16,
                fontFamily: "var(--font-space-mono)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isSelected ? "#ffffff" : "rgba(255,255,255,0.3)",
                transition: "color 0.2s ease",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <>
                  {/* Corner brackets */}
                  <div style={{ position: "absolute", top: 12, left: 12, width: 22, height: 22, borderTop: "1px solid #fff", borderLeft: "1px solid #fff" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderTop: "1px solid #fff", borderRight: "1px solid #fff" }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, width: 22, height: 22, borderBottom: "1px solid #fff", borderLeft: "1px solid #fff" }} />
                  <div style={{ position: "absolute", bottom: 12, right: 12, width: 22, height: 22, borderBottom: "1px solid #fff", borderRight: "1px solid #fff" }} />

                  {/* SELECTED badge */}
                  <div style={{
                    position: "absolute",
                    top: 16, left: "50%",
                    transform: "translateX(-50%)",
                    background: "#ffffff",
                    color: "#000000",
                    fontFamily: "var(--font-space-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                  }}>
                    SELECTED
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div style={{ flexShrink: 0, width: "72px" }} />
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "28px 72px 36px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <button
          onPointerDown={handleSkip}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-space-mono)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "16px 36px",
            cursor: "pointer",
          }}
        >
          SKIP
        </button>

        <button
          onPointerDown={handleGenerate}
          style={{
            background: selected ? "#ffffff" : "transparent",
            border: `1px solid ${selected ? "#ffffff" : "rgba(255,255,255,0.15)"}`,
            color: selected ? "#000000" : "rgba(255,255,255,0.15)",
            fontFamily: "var(--font-space-mono)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "16px 48px",
            cursor: selected ? "pointer" : "default",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>GENERATE POSTER</span>
          <span style={{ fontSize: "16px" }}>→</span>
        </button>
      </div>
    </div>
  );
}
