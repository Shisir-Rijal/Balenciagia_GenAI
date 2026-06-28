import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "VETEMENTS S/S24 <noreply@vetements-ss24.com>";

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    designation?: string;
    guestCode?: string;
    idCardUrl?: string;
    posterUrl?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { email, designation, guestCode, idCardUrl, posterUrl } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const attachments: { filename: string; path: string }[] = [];

  if (idCardUrl) attachments.push({ filename: "credential.jpg", path: idCardUrl });
  if (posterUrl) attachments.push({ filename: "poster.jpg", path: posterUrl });

  const posterLine = posterUrl
    ? `<p style="margin:0;font-size:11px;letter-spacing:0.1em;color:rgba(255,255,255,0.5)">YOUR POSTER IS ATTACHED.</p>`
    : "";

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `VETEMENTS S/S24 — ${(designation ?? "GUEST").toUpperCase()} — CREDENTIAL`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono&display=swap');
    body { background:#000; color:#fff; font-family:'Space Mono',monospace; margin:0; padding:0; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:48px 40px;">
    <tr><td>
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.35);text-transform:uppercase">VETEMENTS S/S24</p>
      <p style="margin:0 0 32px;font-size:10px;letter-spacing:0.15em;color:rgba(255,255,255,0.2);text-transform:uppercase">ID_${guestCode ?? "000000"}</p>
      <p style="margin:0 0 8px;font-size:36px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;line-height:1">${(designation ?? "GUEST").toUpperCase()}</p>
      <p style="margin:0 0 32px;font-size:10px;letter-spacing:0.18em;color:rgba(255,255,255,0.4);text-transform:uppercase">YOUR CREDENTIAL IS ATTACHED.</p>
      ${posterLine}
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0"/>
      <p style="margin:0;font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.2);text-transform:uppercase">ARCHIVED // SS24</p>
    </td></tr>
  </table>
</body>
</html>`,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "send failed" }, { status: 502 });
  }
}
