import type { MapPoint } from "@/data/boothLocations";

export type MapPinFilter = "all" | "sacrament" | "zone" | "facility";

export const SACRAMENT_CLUSTER_ID = "sacrament-cluster";

export type MapPin =
  | { kind: "point"; point: MapPoint; label: string }
  | { kind: "sacrament-cluster"; point: MapPoint; label: string; count: number; members: MapPoint[] };

function matchesFilter(p: MapPoint, filter: MapPinFilter): boolean {
  if (filter === "all") {
    // 핀 과밀 해소: 전체 보기에서는 7성사 필수 부스와 주요 거점 시설/무대만 우선 노출
    return p.isSacrament === true || p.category === "stage" || p.category === "facility";
  }
  if (filter === "sacrament") return p.category === "sacrament";
  if (filter === "zone") return p.category === "zone";
  return p.category === "facility" || p.category === "stage";
}

export function sacramentBadgeLabel(point: Pick<MapPoint, "sacramentType">): string {
  const type = point.sacramentType?.trim();
  return type ? `7성사 필수 (${type})` : "7성사 필수";
}

export function buildMapPins(
  points: MapPoint[],
  filter: MapPinFilter,
  options: { showZonePolygons: boolean }
): MapPin[] {
  const visible = points
    .filter((p) => matchesFilter(p, filter))
    // 존 폴리곤 라벨이 같은 문구를 이미 그리므로 zone 핀은 폴리곤이 꺼졌을 때만 그린다
    .filter((p) => !(options.showZonePolygons && p.category === "zone"));

  const sacraments = visible.filter((p) => p.category === "sacrament");
  const others = visible.filter((p) => p.category !== "sacrament");

  const pins: MapPin[] = others.map((point) => ({
    kind: "point",
    point,
    label: point.tag || point.name.split(" ")[0],
  }));

  if (sacraments.length > 0) {
    const lat = sacraments.reduce((sum, p) => sum + p.lat, 0) / sacraments.length;
    const lng = sacraments.reduce((sum, p) => sum + p.lng, 0) / sacraments.length;
    const label = `7성사 ×${sacraments.length}`;
    pins.push({
      kind: "sacrament-cluster",
      label,
      count: sacraments.length,
      members: sacraments,
      point: {
        id: SACRAMENT_CLUSTER_ID,
        name: `7성사 체험 부스 ${sacraments.length}곳`,
        category: "sacrament",
        lat,
        lng,
        description: sacraments
          .map((p) => `${p.sacramentType ?? "7성사"}(${p.zoneName ?? ""} ${p.boothNumber ?? ""}번)`)
          .join(" · "),
        isSacrament: true,
        tag: label,
      },
    });
  }

  return pins;
}
