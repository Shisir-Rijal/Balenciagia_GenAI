export function workflowBuilder(
  template: object,
  params: Record<string, unknown>
): object {
  const json = JSON.stringify(template);
  const injected = json.replace(/"\{\{(\w+)\}\}"/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? JSON.stringify(val) : `"{{${key}}}"`;
  });
  return JSON.parse(injected);
}
