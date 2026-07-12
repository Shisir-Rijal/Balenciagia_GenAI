"use client";

import { useEffect, useState } from "react";
import type { ScreenProps } from "@/lib/types";

const BG_PATHS: Record<string, string> = {
  "env1": "/backgrounds/env1.JPG",
  "env2": "/backgrounds/env2.JPG",
  "env3": "/backgrounds/env3.JPG",
  "P-BG3": "/backgrounds/P-BG3.png",
};

const MOCK_POSTERS: Record<string, string> = {
  "env1": "/mock/05A_FINAL_00004_.png",
  "env2": "/mock/poster-env2.png",
  "env3": "/mock/poster-env3.png",
  "P-BG3": "/mock/poster-env1.png",
};

function buildTicketCanvas(
  cutoutImg: HTMLImageElement,
  designation: string,
  guestCode: string
): string {
  const W = 1200, H = 420;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // Corner brackets
  const bs = 18;
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1.5;
  ([
    [16, 16, 1, 1], [W - 16, 16, -1, 1], [16, H - 16, 1, -1], [W - 16, H - 16, -1, -1],
  ] as [number, number, number, number][]).forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * bs);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * bs, cy);
    ctx.stroke();
  });

  // ── LEFT STRIP (0–70) ────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(70, 0); ctx.lineTo(70, H); ctx.stroke();

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = '700 9px "Space Mono", monospace';
  ctx.translate(35, H - 20);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("VETEMENTS  S/S 24  PARIS", 0, 0);
  ctx.restore();

  // ── PHOTO + NAME SECTION (70–380) ────────────────────────
  const photoX = 88, photoY = 34, photoSize = 210;

  // Photo cell dark bg
  ctx.fillStyle = "#111111";
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  // Draw cutout grayscale
  ctx.save();
  ctx.filter = "grayscale(1) contrast(1.3) brightness(0.75)";
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoSize, photoSize);
  ctx.clip();
  const iAsp = cutoutImg.naturalWidth / cutoutImg.naturalHeight;
  let dW = iAsp > 1 ? photoSize * iAsp : photoSize;
  let dH = iAsp > 1 ? photoSize : photoSize / iAsp;
  // Align to top so the head is always visible
  ctx.drawImage(cutoutImg, photoX - (dW - photoSize) / 2, photoY, dW, dH);
  ctx.restore();

  // Vertical accent lines on photo
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillRect(photoX + 4, photoY, 7, photoSize);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(photoX + 17, photoY, 2, photoSize);

  // AUTHORISED PERSONNEL label
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = '700 8px "Space Mono", monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("AUTHORISED PERSONNEL", photoX, photoY + photoSize + 24);

  // Guest name — up to two words
  const nameParts = designation.toUpperCase().split(" ");
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  let nameY = photoY + photoSize + 60;
  const nameFontSize = nameParts.some((p) => p.length > 7) ? 46 : 54;
  ctx.font = `800 ${nameFontSize}px "Hanken Grotesk", "Arial Black", sans-serif`;
  nameParts.slice(0, 2).forEach((part) => {
    ctx.fillText(part, photoX, nameY);
    nameY += nameFontSize + 6;
  });

  // ── CENTER GRID (390–820) ─────────────────────────────────
  const sec1 = 388;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sec1, 0); ctx.lineTo(sec1, H); ctx.stroke();

  const cMid = 610;
  ctx.beginPath(); ctx.moveTo(sec1, H / 2); ctx.lineTo(820, H / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cMid, 0); ctx.lineTo(cMid, H); ctx.stroke();

  const lbl = "rgba(255,255,255,0.3)";
  const val = "#ffffff";
  const cX = sec1 + 28;

  const cells: [string, string, number, number][] = [
    ["EVENT",  "S/S24 PARIS", cX,        H / 2 - 60],
    ["STATUS", "INVITED",     cMid + 28, H / 2 - 60],
    ["ACCESS", "ALL AREAS",   cX,        H / 2 + 48],
    ["DATE",   "2024.10.01",  cMid + 28, H / 2 + 48],
  ];
  cells.forEach(([label, value, x, y]) => {
    ctx.fillStyle = lbl;
    ctx.font = '700 8px "Space Mono", monospace';
    ctx.textAlign = "left";
    ctx.fillText(label, x, y);
    ctx.fillStyle = val;
    ctx.font = '700 15px "Space Mono", monospace';
    ctx.fillText(value, x, y + 22);
  });

  // ── TEAR LINE + RIGHT SECTION (820–1200) ─────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(820, 0); ctx.lineTo(820, H); ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  ctx.beginPath(); ctx.moveTo(841, 0); ctx.lineTo(841, H); ctx.stroke();
  ctx.setLineDash([]);

  const rX = 862;

  // GUEST CODE label + censored value
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = '700 8px "Space Mono", monospace';
  ctx.textAlign = "left";
  ctx.fillText("GUEST CODE", rX, 44);
  const raw = (guestCode || "662810").replace(/\D/g, "");
  const half = Math.ceil(raw.length / 2);
  const displayCode = raw.slice(0, half) + "-" + "***".slice(0, raw.length - half);
  ctx.fillStyle = "#ffffff";
  ctx.font = '700 13px "Space Mono", monospace';
  ctx.fillText(displayCode, rX, 62);

  // Barcode
  const bcX = rX, bcY = 82, bcW = 280, bcH = 200;
  const seed = (guestCode || "662810").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let bx = bcX;
  let bi = 0;
  while (bx < bcX + bcW) {
    const w = ((seed * (bi + 7) * 13) % 4) + 1;
    ctx.fillStyle = bi % 2 === 0 ? "#ffffff" : "#0a0a0a";
    ctx.fillRect(bx, bcY, w, bcH);
    bx += w;
    bi++;
  }

  // Half-censor lower barcode with asterisk grid
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(bcX, bcY + bcH / 2, bcW, bcH / 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = '11px "Space Mono", monospace';
  ctx.textAlign = "left";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 17; col++) {
      ctx.fillText("*", bcX + col * 17, bcY + bcH / 2 + 18 + row * 20);
    }
  }

  // SCAN TO ENTER button
  const btnY = bcY + bcH + 16;
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(rX, btnY, 280, 34);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(rX, btnY, 280, 34);
  ctx.fillStyle = "#ffffff";
  ctx.font = '700 9px "Space Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO ENTER", rX + 140, btnY + 21);

  ctx.textAlign = "left";
  return canvas.toDataURL("image/png");
}

function buildSocialCanvas(
  cutoutImg: HTMLImageElement,
  designation: string,
  guestCode: string
): string {
  const S = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // ── Background ────────────────────────────────────────────
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, S, S);

  // ── Person — full-bleed, top-aligned, grayscale ───────────
  ctx.save();
  ctx.filter = "grayscale(1) contrast(1.25) brightness(0.82)";
  const iAsp = cutoutImg.naturalWidth / cutoutImg.naturalHeight;
  // Scale to fill full width; align top
  const dW = S;
  const dH = S / iAsp;
  ctx.drawImage(cutoutImg, 0, 0, dW, dH);
  ctx.restore();

  // ── Top gradient (for text legibility) ───────────────────
  const topGrad = ctx.createLinearGradient(0, 0, 0, 180);
  topGrad.addColorStop(0, "rgba(5,5,5,0.88)");
  topGrad.addColorStop(1, "rgba(5,5,5,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, S, 180);

  // ── Bottom gradient ───────────────────────────────────────
  const btmGrad = ctx.createLinearGradient(0, S - 200, 0, S);
  btmGrad.addColorStop(0, "rgba(5,5,5,0)");
  btmGrad.addColorStop(1, "rgba(5,5,5,0.95)");
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, S - 200, S, 200);

  // ── Top-left: VETEMENTS ───────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.font = '800 38px "Hanken Grotesk", "Arial Black", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("VETEMENTS", 40, 40);

  // S/S 24 below brand
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = '700 12px "Space Mono", monospace';
  ctx.fillText("S/S 24", 40, 88);

  // ── Top-right: PARIS ─────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = '700 12px "Space Mono", monospace';
  ctx.textAlign = "right";
  ctx.fillText("PARIS", S - 40, 88);

  // ── Bottom: horizontal rule ───────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, S - 108);
  ctx.lineTo(S - 40, S - 108);
  ctx.stroke();

  // ── Bottom-left: coordinates ──────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = '700 10px "Space Mono", monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("48.8566° N  2.3522° E", 40, S - 80);

  // Guest code small
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = '700 9px "Space Mono", monospace';
  ctx.fillText(guestCode || "000000", 40, S - 58);

  // ── Bottom-right: guest name ──────────────────────────────
  const nameParts = designation.toUpperCase().split(" ");
  const fontSize = nameParts.some((p) => p.length > 8) ? 52 : 62;
  ctx.textAlign = "right";

  // Underline
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(S - 40, S - 36);
  ctx.lineTo(S - 40 - 260, S - 36);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${fontSize}px "Hanken Grotesk", "Arial Black", sans-serif`;
  ctx.textBaseline = "alphabetic";
  // Stack two words if needed
  if (nameParts.length >= 2) {
    ctx.fillText(nameParts[1], S - 40, S - 46);
    ctx.fillText(nameParts[0], S - 40, S - 46 - fontSize - 4);
  } else {
    ctx.fillText(nameParts[0], S - 40, S - 46);
  }

  // ── Inset border ─────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(8.5, 8.5, S - 17, S - 17);

  // Corner brackets
  const bs = 20;
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1.5;
  ([
    [20, 20, 1, 1], [S - 20, 20, -1, 1], [20, S - 20, 1, -1], [S - 20, S - 20, -1, -1],
  ] as [number, number, number, number][]).forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * bs, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * bs);
    ctx.stroke();
  });

  return canvas.toDataURL("image/png");
}

async function buildPostcard(
  posterUrl: string,
  designation: string,
  guestCode: string
): Promise<{ postcard: string; cutout: string; ticket: string; social: string }> {
  const { removeBackground } = await import("@imgly/background-removal");

  // Pre-fetch as blob to avoid URL-encoding issues (spaces/parens in filenames)
  const fetchRes = await fetch(posterUrl);
  const imageBlob = await fetchRes.blob();

  // Remove background — returns transparent PNG blob
  const blob = await removeBackground(imageBlob, {
    model: "isnet_quint8",
    output: { format: "image/png", quality: 0.9 },
  });

  // Transparent PNG data URL (for video first frame)
  const cutoutDataUrl = await new Promise<string>((res) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.readAsDataURL(blob);
  });

  const cutoutObjectUrl = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = 600;
      const H = 900;

      URL.revokeObjectURL(cutoutObjectUrl);

      // ── Postcard ──────────────────────────────────────────
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      const scale = H / img.naturalHeight;
      const drawW = img.naturalWidth * scale;
      const leftMargin = 80;
      const drawX = leftMargin + ((W - leftMargin) - drawW) / 2;
      ctx.drawImage(img, drawX, 0, drawW, H);

      ctx.save();
      ctx.font = '800 100px "Hanken Grotesk", "Arial Black", sans-serif';
      const measured = ctx.measureText("VETEMENTS");
      const targetW = H * 0.85;
      const fontSize = Math.floor(100 * (targetW / measured.width));
      ctx.font = `800 ${fontSize}px "Hanken Grotesk", "Arial Black", sans-serif`;
      ctx.fillStyle = "#000000";
      ctx.textBaseline = "alphabetic";
      ctx.translate(fontSize * 0.78, H * 0.94);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("VETEMENTS", 0, 0);
      ctx.restore();

      ctx.fillStyle = "#000000";
      ctx.font = 'bold 16px "Space Mono", monospace';
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("S/S 24", W - 28, H - 28);

      const postcard = canvas.toDataURL("image/png");

      // ── Ticket ────────────────────────────────────────────
      const ticket = buildTicketCanvas(img, designation, guestCode);

      // ── Social media square ───────────────────────────────
      const social = buildSocialCanvas(img, designation, guestCode);

      resolve({ postcard, cutout: cutoutDataUrl, ticket, social });
    };
    img.src = cutoutObjectUrl;
  });
}

export default function ScreenGeneratingPoster({ state, dispatch, onNext }: ScreenProps) {
  const [dots, setDots] = useState(".");
  const [phase, setPhase] = useState<"composing" | "cutting">("composing");

  useEffect(() => {
    const id = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Step 1: get poster URL — try ComfyUI, fall back to mock
      const mockUrl = MOCK_POSTERS[state.selectedBackground ?? "env1"] ?? MOCK_POSTERS["env1"];
      let posterUrl = mockUrl;

      if (state.capturedImageBase64) {
        try {
          // Submit to ComfyUI
          const submitRes = await fetch("/api/generate/poster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: state.capturedImageBase64,
              background: state.selectedBackground,
              guestCode: state.guestCode,
              designation: state.designation,
            }),
          });

          if (submitRes.ok) {
            const { promptId } = await submitRes.json();
            console.log("[poster] ComfyUI promptId:", promptId);

            // Poll until done (max 3 min)
            const deadline = Date.now() + 180_000;
            while (!cancelled && Date.now() < deadline) {
              await new Promise(r => setTimeout(r, 2500));
              if (cancelled) return;
              const statusRes = await fetch(`/api/status/${promptId}?background=${state.selectedBackground ?? "env1"}`);
              const statusJson = await statusRes.json();
              console.log("[poster] status:", statusJson.status);
              if (statusJson.status === "done" && statusJson.imageUrl) {
                posterUrl = statusJson.imageUrl;
                break;
              }
            }
          } else {
            console.warn("[poster] ComfyUI not available, using mock");
          }
        } catch (err) {
          console.warn("[poster] ComfyUI error, using mock:", err);
        }
      } else {
        // No real photo yet — dev mode, use mock with small delay
        await new Promise(r => setTimeout(r, 1800));
      }

      if (cancelled) return;
      dispatch({ type: "SET_POSTER_URL", url: posterUrl });

      // Step 2: build postcard + ticket via background removal
      setPhase("cutting");
      try {
        const { postcard, cutout, ticket, social } = await buildPostcard(
          posterUrl,
          state.designation,
          state.guestCode
        );
        if (cancelled) return;
        dispatch({ type: "SET_ID_CARD_URL", url: postcard });
        dispatch({ type: "SET_CUTOUT_URL", url: cutout });
        dispatch({ type: "SET_TICKET_URL", url: ticket });
        dispatch({ type: "SET_SOCIAL_URL", url: social });
      } catch (e) {
        console.warn("Background removal failed, skipping postcard:", e);
      }

      if (!cancelled) onNext();
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = state.capturedImageBase64;
  const bgSrc = state.selectedBackground ? BG_PATHS[state.selectedBackground] : null;

  const statusText = phase === "cutting" ? `CUTTING OUT${dots}` : `COMPOSING${dots}`;

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

      {/* Portrait frame */}
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
            <img src={photo} alt="" style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              filter: "grayscale(1) contrast(1.3) brightness(0.85)",
              animation: "flicker 0.18s step-end infinite",
            }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#0d0d0d" }} />
          )}

          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "160px 160px",
            opacity: 0.3,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,0.9)", pointerEvents: "none" }} />
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
          {statusText}
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
