import type { FlowState, FlowAction } from "@/lib/steps";

export interface ScreenProps {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  onNext: () => void;
}
