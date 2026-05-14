export function getHeatColor(heatLevel: string): string {
  switch (heatLevel) {
    case "critical":
      return "text-red-400";
    case "hot":
      return "text-orange-400";
    case "warm":
      return "text-amber-400";
    case "cold":
    default:
      return "text-olive-400";
  }
}
