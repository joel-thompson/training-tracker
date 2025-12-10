export function envIsUndefined(value: string | undefined) {
  return !value || value === "undefined" || value === "null" || value === "";
}
