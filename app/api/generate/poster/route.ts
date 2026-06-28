import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const COMFY_URL = process.env.COMFY_URL ?? "http://localhost:8188";

export async function POST(req: NextRequest) {
  let body: { image?: string; background?: string; guestCode?: string; designation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { image, background, guestCode, designation } = body;
  if (!image) return NextResponse.json({ error: "image required" }, { status: 400 });

  // Upload captured photo
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");
  const formData = new FormData();
  formData.append("image", new Blob([imageBuffer], { type: "image/jpeg" }), `poster_${guestCode ?? "unknown"}.jpg`);
  formData.append("overwrite", "true");

  let uploadedFilename: string;
  try {
    const uploadRes = await fetch(`${COMFY_URL}/upload/image`, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error(`upload failed: ${uploadRes.status}`);
    const uploadJson = await uploadRes.json();
    uploadedFilename = uploadJson.name as string;
  } catch (err) {
    console.error("ComfyUI upload error:", err);
    return NextResponse.json({ error: "comfy upload failed" }, { status: 502 });
  }

  // Load poster workflow and inject values
  let workflow: Record<string, unknown>;
  try {
    const raw = readFileSync(join(process.cwd(), "workflows", "poster.json"), "utf-8");
    const replaced = raw
      .replace(/"__INPUT_IMAGE__"/g, JSON.stringify(uploadedFilename))
      .replace(/"__BACKGROUND__"/g, JSON.stringify(background ?? ""))
      .replace(/"__GUEST_NAME__"/g, JSON.stringify(designation ?? ""))
      .replace(/"__GUEST_CODE__"/g, JSON.stringify(guestCode ?? ""));
    workflow = JSON.parse(replaced);
  } catch (err) {
    console.error("Workflow load error:", err);
    return NextResponse.json({ error: "workflow not configured" }, { status: 500 });
  }

  try {
    const promptRes = await fetch(`${COMFY_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });
    if (!promptRes.ok) throw new Error(`prompt failed: ${promptRes.status}`);
    const promptJson = await promptRes.json();
    return NextResponse.json({ promptId: promptJson.prompt_id });
  } catch (err) {
    console.error("ComfyUI prompt error:", err);
    return NextResponse.json({ error: "comfy queue failed" }, { status: 502 });
  }
}
