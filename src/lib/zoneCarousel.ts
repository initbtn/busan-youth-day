/** 가로 스냅 슬라이드의 스크롤 위치에서 가장 가까운 슬라이드 인덱스를 구한다. */
export function zoneIndexFromScroll(scrollLeft: number, slideWidth: number, count: number): number {
  if (!(slideWidth > 0) || count <= 0) return 0;
  const raw = Math.round(scrollLeft / slideWidth);
  return Math.min(Math.max(raw, 0), count - 1);
}
