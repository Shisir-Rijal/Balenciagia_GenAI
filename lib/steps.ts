export enum Step {
  LANDING = "LANDING",
  GUEST_CODE = "GUEST_CODE",
  DESIGNATION = "DESIGNATION",
  CAPTURE_BRIEFING = "CAPTURE_BRIEFING",
  CAPTURE_LIVE = "CAPTURE_LIVE",
  CAPTURE_CONFIRM = "CAPTURE_CONFIRM",
  GENERATING_ID = "GENERATING_ID",
  BACKGROUND_SELECT = "BACKGROUND_SELECT",
  GENERATING_POSTER = "GENERATING_POSTER",
  RESULT = "RESULT",
  CONFIRMATION = "CONFIRMATION",
}

export const STEP_ORDER: Step[] = [
  Step.LANDING,
  Step.GUEST_CODE,
  Step.DESIGNATION,
  Step.CAPTURE_BRIEFING,
  Step.CAPTURE_LIVE,
  Step.CAPTURE_CONFIRM,
  Step.GENERATING_ID,
  Step.BACKGROUND_SELECT,
  Step.GENERATING_POSTER,
  Step.RESULT,
  Step.CONFIRMATION,
];

// Steps that are part of the progress bar (excludes optional/sub-steps)
export const PROGRESS_STEPS: Step[] = [
  Step.GUEST_CODE,
  Step.DESIGNATION,
  Step.CAPTURE_BRIEFING,
  Step.CAPTURE_LIVE,
  Step.GENERATING_ID,
  Step.RESULT,
  Step.CONFIRMATION,
];

export interface FlowState {
  step: Step;
  guestCode: string;
  designation: string;
  capturedImageBase64: string | null;
  generatedIdCardUrl: string | null;
  selectedBackground: string | null;
  generatedPosterUrl: string | null;
  email: string;
  wantsPoster: boolean;
}

export const initialState: FlowState = {
  step: Step.LANDING,
  guestCode: "",
  designation: "",
  capturedImageBase64: null,
  generatedIdCardUrl: null,
  selectedBackground: null,
  generatedPosterUrl: null,
  email: "",
  wantsPoster: false,
};

export type FlowAction =
  | { type: "NEXT_STEP" }
  | { type: "GO_TO"; step: Step }
  | { type: "SET_CODE"; value: string }
  | { type: "SET_DESIGNATION"; value: string }
  | { type: "SET_CAPTURED_IMAGE"; base64: string }
  | { type: "SET_ID_CARD_URL"; url: string }
  | { type: "SET_BACKGROUND"; background: string }
  | { type: "SET_POSTER_URL"; url: string }
  | { type: "SET_EMAIL"; value: string }
  | { type: "SET_WANTS_POSTER"; value: boolean }
  | { type: "RESET" };

function getNextStep(current: Step, state: FlowState): Step {
  switch (current) {
    case Step.LANDING:           return Step.GUEST_CODE;
    case Step.GUEST_CODE:        return Step.DESIGNATION;
    case Step.DESIGNATION:       return Step.CAPTURE_BRIEFING;
    case Step.CAPTURE_BRIEFING:  return Step.CAPTURE_LIVE;
    case Step.CAPTURE_LIVE:      return Step.CAPTURE_CONFIRM;
    case Step.CAPTURE_CONFIRM:   return Step.GENERATING_ID;
    case Step.GENERATING_ID:     return Step.BACKGROUND_SELECT;
    case Step.BACKGROUND_SELECT: return state.wantsPoster ? Step.GENERATING_POSTER : Step.RESULT;
    case Step.GENERATING_POSTER: return Step.RESULT;
    case Step.RESULT:            return Step.CONFIRMATION;
    case Step.CONFIRMATION:      return Step.LANDING;
    default:                     return current;
  }
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, step: getNextStep(state.step, state) };
    case "GO_TO":
      return { ...state, step: action.step };
    case "SET_CODE":
      return { ...state, guestCode: action.value };
    case "SET_DESIGNATION":
      return { ...state, designation: action.value };
    case "SET_CAPTURED_IMAGE":
      return { ...state, capturedImageBase64: action.base64 };
    case "SET_ID_CARD_URL":
      return { ...state, generatedIdCardUrl: action.url };
    case "SET_BACKGROUND":
      return { ...state, selectedBackground: action.background, wantsPoster: true };
    case "SET_POSTER_URL":
      return { ...state, generatedPosterUrl: action.url };
    case "SET_EMAIL":
      return { ...state, email: action.value };
    case "SET_WANTS_POSTER":
      return { ...state, wantsPoster: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
