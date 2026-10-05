export function zoneIndexFromScroll(scrollLeft: number, slideWidth: number, count: number): number {
  if (!(slideWidth > 0) || count <= 0) return 0;
  const raw = Math.round(scrollLeft / slideWidth);
  return Math.min(Math.max(raw, 0), count - 1);
}
