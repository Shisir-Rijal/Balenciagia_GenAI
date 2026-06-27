# VETEMENTS S/S24 — Generative Event Identity Tool
## Project Brief for Development

---

## Module Context

**Course:** Generative KI im Design — Hochschule München, MUC:DAI Program  
**Assignment:** Build a generative design tool for a real or fictional event that produces graphics across multiple output formats. The tool must demonstrate the use of generative AI (via ComfyUI), algorithmic/procedural generation, user interaction, and data-driven variation — ideally all combined.

**Core grading criteria:**
- Maximum variety with maximum consistency (every output looks like it belongs to the same event)
- Every output is a never-before-seen winner — no curation by the client, the system must guarantee quality
- Aesthetic design quality
- Large variety of output formats (minimum 3, showcase 5 distinct usage scenarios)
- Well-designed interaction in the generator tool itself
- Interesting, novel concept

**Deliverables due June 30:**
- The generator tool (source code)
- 5 favorite outputs across 5 different usage scenarios
- Report covering: what's possible with the tool, design process, development process, statement on GenAI use
- Live presentation

---

## Event Concept

**Event:** VETEMENTS S/S24 — Generative Souvenir Experience  
**Aesthetic:** Dystopian, Techwear, Cyberpunk, Mecha-Masks, high-end Editorial  
**Tone:** Cold, industrial, precise. Think editorial fashion photography meets post-apocalyptic armor.  
**References:** Demna's deconstructed silhouettes, VETEMENTS oversized streetwear, Ghost in the Shell editorial aesthetics, brutalist architecture as environment.

**Design System Rules (for "No Curation" guarantee):**
- Fixed color palette: near-black, cold white, single accent (deep red or electric blue — to be decided)
- Fixed typeface family across all outputs (monospace or grotesque, bold weight dominant)
- All ComfyUI outputs use the same base model, same style LoRA, same negative prompt
- Only variables: seed, environment/background, user photo input
- Layout grids are fixed per format — generative variation happens inside the grid, not to the grid

---

## Tech Stack

### Frontend
- **Next.js** (App Router) — routing, pages, SSR where needed
- **React** — component architecture, state, layout rendering
- **Tailwind CSS** — styling, layout, typography
- **p5.js** (via `react-p5` or standalone sketch) — camera capture pipeline, canvas overlays, optional procedural animation for Asset 3

### Middle Layer
- **Next.js API Routes** — proxy between browser and ComfyUI, workflow JSON injection, status polling, keeps ComfyUI URL server-side only

### Generative Backend
- **ComfyUI** — image generation service, runs locally during development, on RunPod/Vast.ai for presentation if needed
- **Model:** Flux 1.1 (preferred for photorealism, complex outfit detail, mask fidelity) — requires 12GB+ VRAM
- **Fallback:** SDXL if VRAM is insufficient

### Export
- **`html-to-image`** — client-side PNG export of React layouts
- Optional: `window.print()` for print-quality PDF output

### Hosting
- **Vercel** — Next.js frontend, free tier sufficient
- **ComfyUI** — local during dev, RunPod/Vast.ai for live demo (on-demand GPU, ~0.20–0.50€/hr, start 2hrs before presentation)
- `.env` with `COMFY_URL` variable — switch from `localhost:8188` to remote URL without code changes

---

## Architecture & Data Flow

### General Pattern (all assets)
```
Browser → Next.js API Route → ComfyUI → poll status → return image URL → React renders layout → Export PNG
```

### ComfyUI Communication
- `POST {COMFY_URL}/prompt` with workflow JSON → returns `{ prompt_id }`
- Poll `GET {COMFY_URL}/history/{prompt_id}` every 2 seconds until `status.completed === true`
- Fetch image from `GET {COMFY_URL}/view?filename={filename}`
- All calls happen server-side inside Next.js API Routes — no CORS issues, no exposed URLs

### Shared Utilities (write once, use across all assets)
- `useComfyPoller(promptId)` — React hook that polls status and returns image URL when ready
- `workflowBuilder(template, params)` — injects variable params into a base workflow JSON template
- `<ExportButton layoutRef={ref} />` — triggers `html-to-image` on any layout component
- Loading state component with p5 animation overlay (used across all assets during generation wait)

---

## Asset 1 — ID Card (Personalized, Camera-Based)

**Usage scenario:** VETEMENTS S/S24 event entrance ticket / personal collector card  
**Format:** Portrait, approx. credit card proportions or A6

### User Flow
1. User arrives on ID Card page
2. p5 sketch opens camera via `createCapture(VIDEO)` — live feed on canvas
3. p5 overlays a scan-grid / targeting reticle animation on the live feed (dystopian aesthetic, fills wait time)
4. Countdown (3–2–1) with p5 animation, then frame freeze
5. User can retake or confirm
6. On confirm: p5 exports frozen frame as Base64 PNG
7. Base64 image + user name → `POST /api/generate/idcard`
8. API Route builds ComfyUI workflow: img2img or ControlNet (pose/face preservation) with Flux, style LoRA applied, neutral/dark background enforced in prompt
9. Poll until done, return generated image URL
10. React renders final ID Card layout: generated image + name + barcode (via `bwip-js`) + event typography + grid lines
11. Export as PNG via `html-to-image`

### ComfyUI Workflow Notes
- Input: user photo as Base64
- ControlNet mode: OpenPose or IP-Adapter for face/identity preservation
- Prompt enforces: techwear outfit, Ikeuchi-style mask, neutral dark background (important for Asset 2 compositing)
- Output: figure on clean background — this is intentional, Asset 2 reuses this output

### Key Technical Note
Asset 1 output (figure on neutral background) is stored in React state and passed to Asset 2. Do not discard after generation.

---

## Asset 2 — Poster (Environment Compositing)

**Usage scenario:** VETEMENTS S/S24 event poster, printable, also exported as social media square  
**Formats:** A2 portrait (poster) + 1:1 square crop (social media) — same layout component, different aspect ratio

### User Flow
1. User arrives on Poster page (Asset 1 must be completed first, or demo uses a pre-generated figure)
2. User sees their generated figure from Asset 1 on the left
3. User selects a background environment from 3–4 options (presented as thumbnails):
   - Dystopian forest (overgrown brutalist ruins)
   - Concrete bunker interior
   - Neon-lit tunnel / underpass
   - Flooded industrial hall
4. User confirms → `POST /api/generate/poster`
5. API Route builds ComfyUI workflow: figure image + chosen background image → compositing workflow (background inpainting / outpainting, relighting the figure to match environment)
6. Poll, return composited image
7. React renders poster layout: full-bleed composited image, event title typography overlay, date/location text, grid system
8. Two export buttons: Portrait PNG (poster) and Square PNG (social media crop)

### ComfyUI Workflow Notes

**Compositing pipeline — decided 1:4 ratio (1 generative step, 4 deterministic):**

1. **Background removal** — `rembg` node in ComfyUI. Deterministic algorithm, no AI.
2. **Background compositing** — layer the extracted figure over the chosen background. Standard image processing.
3. **Color grading / tone matching** — LUT or curves adjustment to match color temperature between figure and background. Deterministic.
4. **Layout rendering** — React poster template. Deterministic.
5. **Relighting (the 1 generative step) — IC-Light.** A dedicated diffusion model that takes the extracted figure + background image and generates a relit version of the figure matching the environment's light direction and color temperature. Runs as a ComfyUI node. This is the only step where generative AI is used in the compositing pipeline — everything else is deterministic.

**Why IC-Light:** It is trained specifically for portrait relighting, produces consistent results across inputs, and makes no semantic decisions — it only adjusts lighting. This keeps the "No Curation Guarantee" intact since relighting is reproducible given fixed input + background.

**Background images:** Keep all 4 backgrounds lit with diffuse, neutral light (no hard side-lighting, no colored gels). This reduces the delta IC-Light needs to bridge and improves consistency.

### Background Images
- 4 pre-selected, curated background images stored in `/public/backgrounds/`
- These are fixed, not generated — quality control is manual here, which is acceptable
- Alternatively: backgrounds themselves are ComfyUI-generated from text prompts (more consistent with aesthetic, but more prep work)

---

## Asset 3 — Promo Animation (Autonomous / Generative)

**Usage scenario:** In-event screen loop, social media story/reel, digital signage  
**Format:** 16:9 landscape or 9:16 portrait loop, ~10–30 seconds

### Concept Decision (choose one before building)

**Option A — Pre-generated Image Sequence (recommended for reliability)**
- Generate 20–30 ComfyUI outputs in advance: varying Cyber-accessory close-ups, mask details, material textures, all with same style LoRA + varied seeds
- p5 or React plays them back as image sequence with crossfade transitions
- Glitch effects, scan lines, or grain overlay added via p5 or CSS filter animation
- No live ComfyUI calls during presentation — zero failure risk
- Can add p5 interactive layer: mouse movement shifts glitch intensity (makes it an "interactive" too)

**Option B — Live Generative Loop**
- Continuously requests new ComfyUI outputs with random seeds
- Displays them in sequence as they arrive
- Riskier for live demo due to latency, but genuinely generative
- Recommend only if presentation setup guarantees fast GPU access

**Option C — Fully Procedural p5 (no ComfyUI)**
- Kinetic typography mutation, generative pattern, particle system
- Fast, reliable, zero latency
- Weaker conceptually since it doesn't use GenAI — counts against the ComfyUI requirement

**Recommendation:** Option A with interactive p5 overlay. Best balance of reliability, aesthetics, and showing both GenAI + procedural generation.

---

## Project File Structure

```
/
├── app/
│   ├── page.tsx                  # Landing / home page
│   ├── idcard/
│   │   └── page.tsx              # Asset 1 flow
│   ├── poster/
│   │   └── page.tsx              # Asset 2 flow
│   ├── animation/
│   │   └── page.tsx              # Asset 3 loop/interactive
│   └── api/
│       ├── generate/
│       │   ├── idcard/route.ts   # ComfyUI proxy for Asset 1
│       │   └── poster/route.ts   # ComfyUI proxy for Asset 2
│       └── status/
│           └── [promptId]/route.ts  # Polling endpoint
├── components/
│   ├── CameraCapture.tsx         # p5 camera sketch wrapper
│   ├── IDCardLayout.tsx          # Asset 1 final layout
│   ├── PosterLayout.tsx          # Asset 2 final layout (portrait + square)
│   ├── AnimationLoop.tsx         # Asset 3 player
│   ├── ExportButton.tsx          # html-to-image export
│   └── LoadingOverlay.tsx        # Generation waiting state
├── lib/
│   ├── comfy.ts                  # ComfyUI API calls (fetch prompt, poll history, get image)
│   └── workflowBuilder.ts        # Injects params into workflow JSON templates
├── workflows/
│   ├── idcard.json               # ComfyUI workflow template for Asset 1
│   └── poster.json               # ComfyUI workflow template for Asset 2
├── public/
│   ├── backgrounds/              # Pre-selected environment images for Asset 2
│   └── animation-frames/         # Pre-generated frames for Asset 3 Option A
└── .env.local
    └── COMFY_URL=http://localhost:8188
```

---

## ComfyUI Workflow Development Checklist

Before frontend work begins, lock these in ComfyUI:

- [ ] Base model selected (Flux 1.1 or SDXL)
- [ ] Style LoRA selected and tested — must cover techwear, mecha-masks, editorial lighting
- [ ] Negative prompt finalized — no deformed hands, no logo bleed, no oversaturation
- [ ] Asset 1 workflow: img2img/ControlNet with user photo → figure on neutral background
- [ ] Asset 1 tested with ~20 different face inputs — failure rate target <10%
- [ ] Asset 2 workflow: figure + background → composited scene with relighting
- [ ] Asset 2 tested with all 4 background options
- [ ] Asset 3 batch: 25 frames generated with varied seeds, consistent style
- [ ] All outputs verified: same color temperature, same contrast range, same aesthetic register

---

## The "No Curation" Guarantee — How It Works

This is a system design problem, not a prompt engineering problem. The guarantee comes from:

1. **Fixed style lock:** same model + same LoRA + same negative prompt across all generations. The aesthetic corridor is defined once, not per-run.
2. **Constrained variation:** only seed, user photo, and background choice are variable. Everything else is fixed.
3. **Pre-tested workflows:** run 50 seeds in advance, identify failure modes, add them to the negative prompt or ControlNet constraints. Ship only when failure rate is acceptable.
4. **Fixed layout grids:** the React layout templates never change. Generated images slot into predefined zones — bad compositions are structurally impossible.
5. **Background curation is manual and one-time:** the 4 background options are hand-picked. This is acceptable — the system curates environments once, not outputs.

---

## Development Priorities & Risk

**Highest risk → tackle first:**
- ComfyUI workflow for Asset 1 (ControlNet face preservation quality)
- Asset 2 compositing workflow (background integration / relighting)
- These are the technical unknowns — everything else is standard web dev

**Medium risk:**
- p5 camera capture + Base64 export pipeline
- Polling logic and loading state UX

**Low risk (standard work):**
- React layouts and Tailwind styling
- Export via html-to-image
- Routing and page structure
- Asset 3 if using pre-generated frames (Option A)

**Timeline suggestion:**
- Week 1: ComfyUI workflows locked, p5 camera prototype working
- Week 2: API routes + polling, Asset 1 end-to-end
- Week 3: Asset 2 end-to-end, Asset 3 built
- Final days: Polish UI, generate the 5 showcase outputs, write report

---

## Environment Variables

```env
COMFY_URL=http://localhost:8188
# Switch to RunPod/Vast.ai URL for presentation:
# COMFY_URL=https://your-runpod-instance.runpod.net:8188
```

---

## Notes for Claude Code

- All ComfyUI API calls must go through Next.js API Routes — never call ComfyUI directly from the browser
- Workflow JSON templates live in `/workflows/` as static files, imported server-side and mutated before sending
- The p5 CameraCapture component should be lazy-loaded (no SSR) — use `dynamic(() => import(...), { ssr: false })` in Next.js
- `html-to-image` also requires browser environment — same dynamic import pattern
- Store the Asset 1 generated image URL in React context or Zustand so Asset 2 can access it without re-generation
- Tailwind only — no additional CSS frameworks
- TypeScript throughout
