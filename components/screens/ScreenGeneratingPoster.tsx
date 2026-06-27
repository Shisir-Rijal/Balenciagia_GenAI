import type { ScreenProps } from "@/lib/types";

export default function ScreenGeneratingPoster({ state, dispatch, onNext }: ScreenProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-label text-outline">ScreenGeneratingPoster</span>
    </div>
  );
}
