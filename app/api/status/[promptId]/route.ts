import { NextRequest, NextResponse } from "next/server";

const COMFY_URL = process.env.COMFY_URL ?? "http://localhost:8188";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const { promptId } = await params;

  let history: Record<string, unknown>;
  try {
    const res = await fetch(`${COMFY_URL}/history/${promptId}`);
    if (!res.ok) throw new Error(`history fetch failed: ${res.status}`);
    history = await res.json();
  } catch (err) {
    console.error("ComfyUI history error:", err);
    return NextResponse.json({ error: "comfy unreachable" }, { status: 502 });
  }

  const entry = history[promptId] as {
    outputs?: Record<string, { images?: { filename: string; subfolder: string; type: string }[] }>;
  } | undefined;

  if (!entry) {
    return NextResponse.json({ status: "pending" });
  }

  // Find first output image across all nodes
  const outputs = entry.outputs ?? {};
  for (const node of Object.values(outputs)) {
    const images = node.images ?? [];
    if (images.length > 0) {
      const { filename, subfolder, type } = images[0];
      const params = new URLSearchParams({ filename, subfolder, type });
      const imageUrl = `${COMFY_URL}/view?${params.toString()}`;
      return NextResponse.json({ status: "done", imageUrl });
    }
  }

  return NextResponse.json({ status: "pending" });
}
