import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const { promptId } = await params;
  // TODO: poll ComfyUI history endpoint for this promptId
  return NextResponse.json({ promptId, status: "not implemented" }, { status: 501 });
}
