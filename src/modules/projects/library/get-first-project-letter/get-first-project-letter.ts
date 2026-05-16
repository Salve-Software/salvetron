export function getFirstProjectLetter(name: string): string {
  return (name.charAt(0) || "?").toUpperCase();
}
