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
  const hasVideo = !!state.generatedVideoUrl;

  const handleKey = (k: string) => {
    if (k === "DEL") {
      dispatch({ type: "SET_EMAIL", value: email.slice(0, -1) });
    } else if (k === "SPACE") {
      // no spaces in email
    } else {
      dispatch({ type: "SET_EMAIL", value: email + k });
    }
  };

  const compositePoster = async (url: string): Promise<string> => {
    const blob = await fetch(url).then(r => r.blob());
    const objUrl = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const W = img.naturalWidth, H = img.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objUrl);

        // VETEMENTS centered
        ctx.font = `800 ${Math.round(W * 0.18)}px "Hanken Grotesk", "Arial Black", sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 24;
        ctx.fillText("VETEMENTS", W / 2, H / 2);

        // S/S 24 bottom right
        ctx.shadowBlur = 8;
        ctx.font = `700 ${Math.round(W * 0.032)}px "Space Mono", monospace`;
        ctx.textAlign = "right";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText("S/S 24", W - Math.round(W * 0.04), H - Math.round(H * 0.03));

        resolve(canvas.toDataURL("image/png"));
      };
      img.src = objUrl;
    });
  };

  const downloadAll = async () => {
    const dl = (href: string, filename: string) => {
      const a = document.createElement("a");
      a.href = href; a.download = filename; a.click();
    };

    if (state.generatedIdCardUrl) { dl(state.generatedIdCardUrl, "id_card.png"); await new Promise(r => setTimeout(r, 200)); }
    if (state.generatedPosterUrl) {
      const composited = await compositePoster(state.generatedPosterUrl);
      dl(composited, "poster.png");
      await new Promise(r => setTimeout(r, 200));
    }
    if (state.generatedTicketUrl) { dl(state.generatedTicketUrl, "ticket.png"); await new Promise(r => setTimeout(r, 200)); }
    if (state.generatedSocialUrl) { dl(state.generatedSocialUrl, "social.png"); await new Promise(r => setTimeout(r, 200)); }
    if (state.generatedVideoUrl) {
      const blob = await fetch(state.generatedVideoUrl).then(r => r.blob());
      const href = URL.createObjectURL(blob);
      dl(href, "video.mp4");
      await new Promise(r => setTimeout(r, 200));
      URL.revokeObjectURL(href);
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

      {/* ASSETS — two-column layout */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: "12px",
        padding: "20px 32px 12px",
        overflow: "hidden",
        minHeight: 0,
      }}>

        {/* LEFT — three portrait assets */}
        <div style={{
          flex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          overflow: "hidden",
          minWidth: 0,
        }}>
          {/* ID Card — portrait 3:4 */}
          <div style={{
            height: "100%",
            aspectRatio: "3/4",
            position: "relative",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
            background: "#080808",
            flexShrink: 0,
          }}>
            {state.generatedIdCardUrl ? (
              <img src={state.generatedIdCardUrl} alt="ID Card"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>VETEMENTS S/S24</span>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>ID_{state.guestCode || "000000"}</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                  <div style={{ fontFamily: "var(--font-hanken)", fontSize: "clamp(16px, 2vw, 32px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                    {state.designation || "—"}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>ARCHIVED // SS24</span>
                </div>
              </div>
            )}
            <div style={{ position: "absolute", top: 8, left: 8, width: 14, height: 14, borderTop: "1px solid rgba(255,255,255,0.35)", borderLeft: "1px solid rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", top: 8, right: 8, width: 14, height: 14, borderTop: "1px solid rgba(255,255,255,0.35)", borderRight: "1px solid rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", bottom: 8, left: 8, width: 14, height: 14, borderBottom: "1px solid rgba(255,255,255,0.35)", borderLeft: "1px solid rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", bottom: 8, right: 8, width: 14, height: 14, borderBottom: "1px solid rgba(255,255,255,0.35)", borderRight: "1px solid rgba(255,255,255,0.35)" }} />
          </div>

          {/* Poster — portrait 2:3 */}
          {hasPoster && (
            <div style={{
              height: "100%",
              aspectRatio: "2/3",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              <img src={state.generatedPosterUrl!} alt="Poster"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontFamily: "var(--font-hanken)", fontWeight: 800, fontSize: "clamp(16px, 2.5vw, 40px)", letterSpacing: "-0.02em", textTransform: "uppercase", color: "#ffffff", textShadow: "0 2px 28px rgba(0,0,0,0.85)", lineHeight: 1 }}>VETEMENTS</span>
              </div>
              <div style={{ position: "absolute", bottom: 12, right: 14, pointerEvents: "none" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>S/S 24</span>
              </div>
            </div>
          )}

          {/* Video — portrait 9:16 */}
          {hasVideo && (
            <div style={{
              height: "100%",
              aspectRatio: "9/16",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              <video src={state.generatedVideoUrl!} autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 12, left: 14, pointerEvents: "none" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>FILM</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — social media (coming) + ticket */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: 0,
          justifyContent: "center",
        }}>

          {/* Social media — 1:1 square */}
          <div style={{
            width: "100%",
            aspectRatio: "1/1",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "#080808",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {state.generatedSocialUrl ? (
              <img src={state.generatedSocialUrl} alt="Social"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "8px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}>SOCIAL</span>
            )}
          </div>

          {/* Ticket — landscape, width matches column */}
          {state.generatedTicketUrl && (
            <div style={{
              width: "100%",
              aspectRatio: "1200/420",
              border: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              <img src={state.generatedTicketUrl} alt="Souvenir"
                style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM — email + dispatch */}
      <div style={{
        flexShrink: 0,
        padding: "16px 48px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        <p style={{
          fontFamily: "var(--font-space-mono)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
          margin: 0,
          textAlign: "center",
        }}>
          [ FINALIZING SEQUENCE ]
        </p>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
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
              letterSpacing: "0.04em",
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

          {/* Download all */}
          <button
            onPointerDown={downloadAll}
            style={{
              flexShrink: 0,
              height: "48px",
              padding: "0 24px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#ffffff",
              fontFamily: "var(--font-space-mono)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ↓ SAVE ALL
          </button>

          {/* Dispatch */}
          <button
            onPointerDown={handleDispatch}
            style={{
              flexShrink: 0,
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
