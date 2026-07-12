import { NextRequest, NextResponse } from "next/server";

const MODEL = "fal-ai/veo3/fast/image-to-video";
const FAL_REST = "https://rest.fal.ai";

// Prompt matched to selected background — update descriptions when real BGs are confirmed
const PROMPT_BY_BG: Record<string, string> = {
  env1: "VETEMENTS S/S24 fashion editorial. Figure standing motionless in a fluorescent-lit supermarket aisle, rows of stacked products stretching into the background, cold white overhead lighting casting hard shadows on the linoleum floor. Oversized deconstructed tailoring, heavy fabric drape, expressionless gaze directly into camera. Slow imperceptible dolly push-in. Desaturated palette, clinical and flat, lifted shadows. The mundane setting contrasts brutally with the editorial silhouette. 24fps, organic film grain, no camera shake, no text, no logos.",
  env2: "Figure standing in a Paris metro corridor, tiled walls, directional signage blurred in background, hands clasped at front, calm intimidating expression. Oversized deconstructed blazer, wide-leg trousers with raw seams, heavy fabric drape. Harsh fluorescent overhead lighting with cold greenish cast, long shadows on tiled floor. Gritty-clean color grade, desaturated. Shot on Sony A7R V, 50mm f/1.4, full-body portrait. VETEMENTS S/S24. No logos, no text.",
  env3: "Figure stepping off a curb onto wet asphalt at night, neon signage reflections pooling on the ground, wearing oversized deconstructed tailoring with raw hems and heavy drape, expressionless forward gaze, confident stride. Paparazzi flash burst lighting, high contrast, blown highlights, deep shadows. Grainy tabloid energy with high-end editorial precision. Shot on Canon EOS R5, 50mm f/1.8, full-body. VETEMENTS S/S24. No logos, no text, no brand marks.",
  "P-BG3": "Figure at a barren desert roadside, oversized black windbreaker and wide cargo pants with fabric pulled taut by strong wind, dark sunglasses, expressionless. Low late-afternoon sun casting a hard rim light separating the silhouette from the bleached horizon. Dusty muted color grade, desaturated earth tones, lifted shadows. Shot on RED Cinema camera, 70mm lens feel, full-body portrait. VETEMENTS S/S24. No logos, no text.",
};

const FALLBACK_PROMPT = "Figure mid-stride on a minimal concrete catwalk, oversized coat with exaggerated structured shoulders and heavy drape, stark split black-and-white lighting, audience dissolved into total darkness behind. Crisp freeze-motion, ultra-realistic fabric movement caught mid-swing. Shot on Canon EOS R1, 135mm, shallow depth of field. Editorial sharpness, silver gelatin print aesthetic. VETEMENTS S/S24. No logos, no text.";

export async function POST(req: NextRequest) {
  const key = process.env.FAL_KEY;
  if (!key) {
    return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 503 });
  }

  let body: { imageBase64?: string; selectedBackground?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { imageBase64, selectedBackground } = body;
  const PROMPT = PROMPT_BY_BG[selectedBackground ?? ""] ?? FALLBACK_PROMPT;
  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch?.[1] ?? "image/jpeg";
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  console.log("[video/route] image size:", buffer.byteLength, "bytes, type:", mimeType);

  // Step 1: initiate upload → get upload_url + file_url
  const initiateRes = await fetch(
    `${FAL_REST}/storage/upload/initiate?storage_type=fal-cdn-v3`,
    {
      method: "POST",
      headers: {
        "Authorization": `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_type: mimeType,
        file_name: mimeType === "image/png" ? "guest.png" : "guest.jpg",
      }),
    }
  );

  if (!initiateRes.ok) {
    const errText = await initiateRes.text();
    console.error("[video/route] initiate failed:", initiateRes.status, errText);
    return NextResponse.json({ error: "initiate failed", detail: errText }, { status: 502 });
  }

  const { upload_url, file_url } = await initiateRes.json();
  console.log("[video/route] upload_url:", upload_url?.slice(0, 60), "file_url:", file_url?.slice(0, 60));

  // Step 2: PUT binary to upload_url
  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: buffer,
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    console.error("[video/route] PUT failed:", putRes.status, errText);
    return NextResponse.json({ error: "put failed", detail: errText }, { status: 502 });
  }

  console.log("[video/route] uploaded:", file_url);

  console.log("[video/route] prompt:", PROMPT.slice(0, 80));

  // Step 3: submit to Veo 3 Fast queue
  const submitRes = await fetch(`https://queue.fal.run/${MODEL}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: file_url,
      prompt: PROMPT,
      duration: 8,
      aspect_ratio: "9:16",
      generate_audio: false,
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    console.error("[video/route] submit failed:", submitRes.status, errText);
    return NextResponse.json({ error: "submit failed", detail: errText }, { status: 502 });
  }

  const { request_id } = await submitRes.json();
  console.log("[video/route] request_id:", request_id);

  return NextResponse.json({ requestId: request_id });
}
