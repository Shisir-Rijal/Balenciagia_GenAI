import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: build ComfyUI workflow for Asset 1 and forward to COMFY_URL
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
