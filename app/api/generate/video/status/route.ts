import { NextRequest, NextResponse } from "next/server";

const MODEL_QUEUE = "fal-ai/veo3/fast/image-to-video";

export async function GET(req: NextRequest) {
  const key = process.env.FAL_KEY;
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (!requestId || !key) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  // Check status
  const statusUrl = `https://queue.fal.run/${MODEL_QUEUE}/requests/${requestId}/status`;
  console.log("[video/status] polling:", statusUrl);

  const statusRes = await fetch(statusUrl, {
    headers: { "Authorization": `Key ${key}` },
  });

  const statusText = await statusRes.text();
  console.log("[video/status] raw response:", statusRes.status, statusText.slice(0, 500));

  if (!statusRes.ok) {
    return NextResponse.json({ status: "FAILED", detail: statusText });
  }

  const statusJson = JSON.parse(statusText);

  if (statusJson.status === "COMPLETED") {
    // Use response_url from status JSON — this is the correct SDK-documented pattern
    const resultUrl = statusJson.response_url;
    console.log("[video/status] fetching result from:", resultUrl);
    const resultRes = await fetch(resultUrl, {
      headers: { "Authorization": `Key ${key}` },
    });
    const resultText = await resultRes.text();
    console.log("[video/status] result HTTP:", resultRes.status, "body:", resultText.slice(0, 600));
    if (!resultRes.ok || !resultText) {
      return NextResponse.json({ status: "FAILED", detail: `result fetch ${resultRes.status}: ${resultText}` });
    }
    const result = JSON.parse(resultText);
    const videoUrl: string | undefined =
      result?.video?.url ?? result?.outputs?.video?.url ?? result?.video_url;
    return NextResponse.json({ status: "COMPLETED", videoUrl: videoUrl ?? null });
  }

  if (statusJson.status === "FAILED") {
    const detail = statusJson.error ?? statusJson.detail ?? JSON.stringify(statusJson);
    console.error("[video/status] FAILED:", detail);
    return NextResponse.json({ status: "FAILED", detail });
  }

  return NextResponse.json({ status: statusJson.status });
}
