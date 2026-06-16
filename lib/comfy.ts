const COMFY_URL = process.env.COMFY_URL ?? "http://localhost:8188";

export async function submitPrompt(workflow: object): Promise<string> {
  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
  });
  const data = await res.json();
  return data.prompt_id as string;
}

export async function pollHistory(promptId: string): Promise<string | null> {
  const res = await fetch(`${COMFY_URL}/history/${promptId}`);
  const data = await res.json();
  const entry = data[promptId];
  if (!entry?.status?.completed) return null;
  const outputs = entry.outputs;
  const firstNode = Object.values(outputs)[0] as { images?: { filename: string }[] };
  const filename = firstNode?.images?.[0]?.filename;
  return filename ? `${COMFY_URL}/view?filename=${filename}` : null;
}
