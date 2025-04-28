export function generateId() {
  return Math.random().toString(36).substring(2, 12).padStart(10, "0");
}
