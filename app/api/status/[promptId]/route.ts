import { NextRequest, NextResponse } from "next/server";

const COMFY_URL = process.env.COMFY_URL ?? "http://localhost:8188";
const COMFY_API_KEY = process.env.COMFY_API_KEY ?? "";
const IS_CLOUD = !!COMFY_API_KEY;

function comfyHeaders(): Record<string, string> {
  return IS_CLOUD ? { "X-API-Key": COMFY_API_KEY } : {};
}

// The workflow generates all 3 backgrounds in parallel. Each has a SaveImage
// node whose filename_prefix maps to the kiosk background key.
type OutputMap = Record<string, { images?: { filename: string; subfolder: string; type: string }[] }>;

function findAndReturnImage(outputs: OutputMap, targetPrefix: string, viewBase: string) {
  // First: exact prefix match
  for (const node of Object.values(outputs)) {
    for (const img of node.images ?? []) {
      if (img.filename.startsWith(targetPrefix)) {
        const qs = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type });
        return NextResponse.json({ status: "done", imageUrl: `${viewBase}?${qs}` });
      }
    }
  }
  // Fallback: any 05x output rather than hanging
  for (const node of Object.values(outputs)) {
    for (const img of node.images ?? []) {
      if (img.filename.startsWith("05")) {
        const qs = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type });
        console.warn(`[status] prefix "${targetPrefix}" not found, fallback: ${img.filename}`);
        return NextResponse.json({ status: "done", imageUrl: `${viewBase}?${qs}` });
      }
    }
  }
  return NextResponse.json({ status: "pending" });
}

const BG_OUTPUT_PREFIX: Record<string, string> = {
  env1:    "05A_FINAL",
  env2:    "05B_FINAL",
  env3:    "05C_FINAL",
  "P-BG3": "05C_FINAL", // no 4th background in workflow yet — falls back to C
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const { promptId } = await params;
  const background = req.nextUrl.searchParams.get("background") ?? "env1";
  const targetPrefix = BG_OUTPUT_PREFIX[background] ?? "05A_FINAL";

  // ── Cloud path ────────────────────────────────────────────
  if (IS_CLOUD) {
    // Step 1: poll status
    let cloudStatus: string;
    try {
      const res = await fetch(`${COMFY_URL}/api/job/${promptId}/status`, { headers: comfyHeaders() });
      if (!res.ok) throw new Error(`status fetch failed: ${res.status}`);
      const json = await res.json() as { status: string };
      cloudStatus = json.status;
    } catch (err) {
      console.error("ComfyUI cloud status error:", err);
      return NextResponse.json({ error: "comfy unreachable" }, { status: 502 });
    }

    if (cloudStatus !== "completed") {
      if (cloudStatus === "failed" || cloudStatus === "cancelled") {
        return NextResponse.json({ status: "FAILED", detail: cloudStatus });
      }
      return NextResponse.json({ status: "pending" });
    }

    // Step 2: get outputs
    let outputs: Record<string, { images?: { filename: string; subfolder: string; type: string }[] }>;
    try {
      const res = await fetch(`${COMFY_URL}/api/jobs/${promptId}`, { headers: comfyHeaders() });
      if (!res.ok) throw new Error(`jobs fetch failed: ${res.status}`);
      const json = await res.json() as { outputs?: typeof outputs };
      outputs = json.outputs ?? {};
    } catch (err) {
      console.error("ComfyUI cloud outputs error:", err);
      return NextResponse.json({ error: "outputs fetch failed" }, { status: 502 });
    }

    return findAndReturnImage(outputs, targetPrefix, `${COMFY_URL}/api/view`);
  }

  // ── Local path ────────────────────────────────────────────
  let history: Record<string, unknown>;
  try {
    const res = await fetch(`${COMFY_URL}/history/${promptId}`, { headers: comfyHeaders() });
    if (!res.ok) throw new Error(`history fetch failed: ${res.status}`);
    history = await res.json();
  } catch (err) {
    console.error("ComfyUI history error:", err);
    return NextResponse.json({ error: "comfy unreachable" }, { status: 502 });
  }

  const entry = history[promptId] as {
    outputs?: Record<string, { images?: { filename: string; subfolder: string; type: string }[] }>;
  } | undefined;

  if (!entry) return NextResponse.json({ status: "pending" });

  return findAndReturnImage(entry.outputs ?? {}, targetPrefix, `${COMFY_URL}/view`);
}
