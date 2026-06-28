"use client";

import { useEffect } from "react";
import type { ScreenProps } from "@/lib/types";

// Confirm/retry is handled inside ScreenCaptureLive — this step passes through instantly.
export default function ScreenCaptureConfirm({ onNext }: ScreenProps) {
  useEffect(() => { onNext(); }, []);
  return null;
}
