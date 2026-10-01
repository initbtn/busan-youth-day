"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SPOWON_CENTER,
  SPOWON_MAP_POINTS,
  FOUNTAIN_ZONE_BLOCKS,
  MapPoint,
  FountainZoneBlock,
} from "@/data/boothLocations";
import { OFFICIAL_ZONES } from "@/data/officialBooths";
import { BoothListModal } from "@/components/BoothListModal";
import {
  Sparkles,
  Crosshair,
  ExternalLink,
  AlertCircle,
  X,
  Navigation,
  Layers,
  ListFilter,
} from "lucide-react";

interface KakaoOverlayItem {
  setMap: (map: unknown) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao?: any;
  }
}

interface KakaoMapViewProps {
  initialSelectedId?: string;
  onSelectPoint?: (point: MapPoint) => void;
}

export function KakaoMapView({ initialSelectedId, onSelectPoint }: KakaoMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<KakaoOverlayItem[]>([]);
  const polygonsRef = useRef<KakaoOverlayItem[]>([]);
  const userLocationOverlayRef = useRef<KakaoOverlayItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<FountainZoneBlock | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "sacrament" | "zone" | "facility">("all");
  const [showZonePolygons, setShowZonePolygons] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const [boothModalInitialZone, setBoothModalInitialZone] = useState<"faith" | "hope" | "love" | "sharing" | "all">("all");

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  const handleSelectPoint = useCallback(
    (point: MapPoint) => {
      setSelectedBlock(null);
      setSelectedPoint(point);
      if (onSelectPoint) onSelectPoint(point);

      if (mapInstanceRef.current && window.kakao?.maps) {
        const moveLatLon = new window.kakao.maps.LatLng(point.lat, point.lng);
        mapInstanceRef.current.panTo(moveLatLon);
      }
    },
    [onSelectPoint]
  );

  const handleSelectBlock = useCallback((block: FountainZoneBlock) => {
    setSelectedPoint(null);
    setSelectedBlock(block);

    if (mapInstanceRef.current && window.kakao?.maps) {
      const moveLatLon = new window.kakao.maps.LatLng(block.centerLat, block.centerLng);
      mapInstanceRef.current.panTo(moveLatLon);
    }
  }, []);

  // 1. 4대 테마존 폴리곤 및 구역 명칭 오버레이 렌더링
  const renderZoneBlocks = useCallback(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    polygonsRef.current.forEach((item) => {
      if (item.setMap) item.setMap(null);
    });
    polygonsRef.current = [];

    if (!showZonePolygons) return;

    const map = mapInstanceRef.current;

    FOUNTAIN_ZONE_BLOCKS.forEach((block) => {
      // 1-1. 카카오 지도 폴리곤 생성
      const path = block.coordinates.map(
        (c) => new window.kakao.maps.LatLng(c.lat, c.lng)
      );

      const polygon = new window.kakao.maps.Polygon({
        path,
        strokeWeight: 2,
        strokeColor: block.strokeColor,
        strokeOpacity: 0.8,
        fillColor: block.fillColor,
        fillOpacity: 0.22,
      });

      polygon.setMap(map);
      polygonsRef.current.push(polygon);

      // 폴리곤 클릭 시 구역 상세 바텀시트 오픈
      window.kakao.maps.event.addListener(polygon, "click", () => {
        handleSelectBlock(block);
      });

      // 1-2. 구역 중심 텍스트 뱃지 오버레이
      const position = new window.kakao.maps.LatLng(block.centerLat, block.centerLng);
      const content = document.createElement("div");
      content.className =
        "cursor-pointer group flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105 active:scale-95";
      content.innerHTML = `
        <div class="px-2.5 py-1 rounded-xl shadow-md text-[11px] font-black flex items-center space-x-1 border border-white/80 text-white" style="background-color: ${block.color};">
          <span>${block.koreanName}</span>
          <span class="text-[9px] font-normal opacity-90">(${block.boothCount}개)</span>
        </div>
      `;

      content.addEventListener("click", () => {
        handleSelectBlock(block);
      });

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content,
        zIndex: 2,
      });

      overlay.setMap(map);
      polygonsRef.current.push(overlay);
    });
  }, [showZonePolygons, handleSelectBlock]);

  // 2. 부스 핀 마커 렌더링 함수
  const renderMarkers = useCallback(
    (filter: "all" | "sacrament" | "zone" | "facility") => {
      if (!mapInstanceRef.current || !window.kakao?.maps) return;

      // 기존 마커/오버레이 제거
      markersRef.current.forEach((item) => {
        if (item.setMap) item.setMap(null);
      });
      markersRef.current = [];

      const map = mapInstanceRef.current;

      const filteredPoints = SPOWON_MAP_POINTS.filter((p) => {
        if (filter === "all") return true;
        if (filter === "sacrament") return p.category === "sacrament";
        if (filter === "zone") return p.category === "zone";
        if (filter === "facility") return p.category === "facility" || p.category === "stage";
        return true;
      });

      filteredPoints.forEach((point) => {
        const position = new window.kakao.maps.LatLng(point.lat, point.lng);

        // 커스텀 HTML 오버레이 컨텐츠 생성
        let badgeColor = "bg-slate-700 text-white border-slate-600";
        let icon = "📍";

        if (point.category === "sacrament") {
          badgeColor = "bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400";
          icon = "✝️";
        } else if (point.category === "stage") {
          badgeColor = "bg-purple-600 text-white border-purple-400";
          icon = "🏛️";
        } else if (point.category === "facility") {
          badgeColor = "bg-blue-600 text-white border-blue-400";
          icon = "🚩";
        } else if (point.zoneId === "faith") {
          badgeColor = "bg-blue-500 text-white border-blue-300";
          icon = "🔵";
        } else if (point.zoneId === "hope") {
          badgeColor = "bg-amber-600 text-white border-amber-300";
          icon = "🟠";
        } else if (point.zoneId === "love") {
          badgeColor = "bg-rose-500 text-white border-rose-300";
          icon = "🔴";
        } else if (point.zoneId === "sharing") {
          badgeColor = "bg-emerald-600 text-white border-emerald-300";
          icon = "🟢";
        }

        const content = document.createElement("div");
        content.className =
          "cursor-pointer group flex flex-col items-center transform -translate-x-1/2 -translate-y-full transition-transform active:scale-95";
        content.innerHTML = `
          <div class="px-2 py-1 rounded-full shadow-lg text-[10px] font-bold flex items-center space-x-1 border ${badgeColor}">
            <span>${icon}</span>
            <span class="max-w-[100px] truncate">${point.tag || point.name.split(" ")[0]}</span>
          </div>
          <div class="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-0.5 shadow-sm"></div>
        `;

        content.addEventListener("click", () => {
          handleSelectPoint(point);
        });

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 1,
          zIndex: point.isSacrament ? 5 : 3,
        });

        customOverlay.setMap(map);
        markersRef.current.push(customOverlay);
      });
    },
    [handleSelectPoint]
  );

  // 3. 사용자 위치 오버레이 렌더링
  const renderUserLocation = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    if (userLocationOverlayRef.current) {
      userLocationOverlayRef.current.setMap(null);
      userLocationOverlayRef.current = null;
    }

    const position = new window.kakao.maps.LatLng(lat, lng);
    const content = document.createElement("div");
    content.className = "flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2";
    content.innerHTML = `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
        <div class="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md text-[9px] text-white">
        </div>
      </div>
    `;

    const userOverlay = new window.kakao.maps.CustomOverlay({
      position,
      content,
      zIndex: 10,
    });

    userOverlay.setMap(mapInstanceRef.current);
    userLocationOverlayRef.current = userOverlay;
  }, []);

  // 4. 카카오 지도 SDK 초기 1회 로드 및 지도 인스턴스 마운트
  useEffect(() => {
    if (!apiKey) {
      setLoadError("카카오맵 API 키가 설정되지 않았습니다. 현장 기본 배치도를 표시합니다.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initializeMap = () => {
      if (!window.kakao?.maps) {
        if (isMounted) {
          setLoadError("카카오맵 라이브러리를 불러오지 못했습니다.");
          setIsLoading(false);
        }
        return;
      }

      window.kakao.maps.load(() => {
        if (!mapContainerRef.current || !isMounted) return;

        // 이미 생성된 맵 인스턴스가 없을 때만 생성
        if (!mapInstanceRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(SPOWON_CENTER.lat, SPOWON_CENTER.lng),
            level: 3, // 스포원파크 야외광장 기본 레벨
          };

          const map = new window.kakao.maps.Map(mapContainerRef.current, options);
          mapInstanceRef.current = map;

          const zoomControl = new window.kakao.maps.ZoomControl();
          map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
        }

        setIsLoading(false);

        if (initialSelectedId) {
          const pt = SPOWON_MAP_POINTS.find((p) => p.id === initialSelectedId);
          if (pt) {
            handleSelectPoint(pt);
          }
        }
      });
    };

    const handleScriptError = () => {
      if (isMounted) {
        setLoadError("카카오 지도 SDK를 불러오지 못했습니다. 카카오 개발자 콘솔의 지도 활성화 및 사이트 도메인 등록 상태를 확인해 주세요.");
        setIsLoading(false);
      }
    };

    const existingScript = document.getElementById("kakao-map-sdk");
    if (existingScript) {
      if (window.kakao?.maps) {
        initializeMap();
      } else {
        existingScript.addEventListener("load", initializeMap);
        existingScript.addEventListener("error", handleScriptError);
      }
    } else {
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = `//dapi.kakao.com/v2/maps/appkey=${apiKey}&autoload=false`;
      script.async = true;
      script.onload = initializeMap;
      script.onerror = handleScriptError;
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (existingScript) {
        existingScript.removeEventListener("load", initializeMap);
        existingScript.removeEventListener("error", handleScriptError);
      }
    };
  }, [apiKey, initialSelectedId, handleSelectPoint]);

  // 5. 필터 변경 시 마커 업데이트
  useEffect(() => {
    if (!isLoading && !loadError && mapInstanceRef.current) {
      renderMarkers(activeFilter);
      renderZoneBlocks();
    }
  }, [activeFilter, showZonePolygons, isLoading, loadError, renderMarkers, renderZoneBlocks]);

  // 6. 사용자 위치 오버레이 갱신
  useEffect(() => {
    if (userLocation) {
      renderUserLocation(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, renderUserLocation]);

  // 중앙 광장으로 이동
  const handleResetCenter = () => {
    if (mapInstanceRef.current && window.kakao?.maps) {
      const center = new window.kakao.maps.LatLng(SPOWON_CENTER.lat, SPOWON_CENTER.lng);
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setLevel(3);
    }
  };

  // 현재 사용자 위치(Geolocation) 추적 및 지도 이동
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("현재 브라우저에서 위치 정보를 지원하지 않습니다.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && window.kakao?.maps) {
          const loc = new window.kakao.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.panTo(loc);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err.message);
        alert("현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 카카오맵 외부 길찾기 링크 열기
  const handleOpenKakaoNavi = (point: MapPoint) => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(point.name)},${point.lat},${point.lng}`;
    window.open(url, "_blank");
  };

  // 선택된 구역 블록의 상세 부스 데이터 조회
  const selectedZoneData = selectedBlock
    ? OFFICIAL_ZONES.find((z) => z.id === selectedBlock.zoneId)
    : null;

  return (
    <div className="relative w-full h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex flex-col">
      {/* 1. 상단 필터 & 오버레이 토글 바 */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-1 pointer-events-none">
        <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/80 pointer-events-auto overflow-x-auto text-[11px] font-bold">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-xl transition-colors ${
              activeFilter === "all" ? "bg-orange-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveFilter("sacrament")}
            className={`px-2.5 py-1 rounded-xl transition-colors flex items-center space-x-1 ${
              activeFilter === "sacrament" ? "bg-amber-500 text-white shadow-xs" : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>7성사 필수</span>
          </button>
          <button
            onClick={() => setActiveFilter("zone")}
            className={`px-2.5 py-1 rounded-xl transition-colors ${
              activeFilter === "zone" ? "bg-blue-600 text-white shadow-xs" : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            4대 테마존
          </button>
          <button
            onClick={() => setActiveFilter("facility")}
            className={`px-2.5 py-1 rounded-xl transition-colors ${
              activeFilter === "facility" ? "bg-indigo-600 text-white shadow-xs" : "text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            주요 시설/무대
          </button>
        </div>

        {/* 컨트롤 그룹 (전체 부스 목록 모달, 구역 블록 토글, 내 위치, 중심 리셋) */}
        <div className="flex items-center space-x-1 pointer-events-auto">
          <button
            onClick={() => {
              setBoothModalInitialZone("all");
              setIsBoothModalOpen(true);
            }}
            className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-colors"
            title="81개 전체 부스 목록 열기"
          >
            <ListFilter className="w-4 h-4 text-orange-600" />
          </button>
          <button
            onClick={() => setShowZonePolygons((prev) => !prev)}
            className={`p-2.5 rounded-2xl shadow-md border border-slate-200/80 transition-colors ${
              showZonePolygons
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white/95 text-slate-700 hover:bg-slate-50"
            }`}
            title="4대 테마존 구역 배치도 켜기/끄기"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 transition-colors ${
              isLocating ? "text-blue-500 animate-spin" : userLocation ? "text-blue-600 bg-blue-50" : "text-slate-700 hover:bg-slate-50"
            }`}
            title="현재 내 위치 찾기"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCenter}
            className="p-2.5 bg-white/95 backdrop-blur-md text-slate-700 rounded-2xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors"
            title="중심 광장으로 이동"
          >
            <Crosshair className="w-4 h-4 text-orange-600" />
          </button>
        </div>
      </div>

      {/* 2. 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full flex-1 relative z-0">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-xs space-y-2.5">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-600">스포원파크 행사장 지도를 불러오는 중...</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-20 flex flex-col p-4 bg-slate-50 overflow-y-auto">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 text-left mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <h4 className="text-xs font-bold">카카오 지도 로드 실패 (현장 배치도 대체)</h4>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">{loadError}</p>
            </div>

            {/* 스포원파크 4대 방위 테마존 정적 배치도 폴백 */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex-1 flex flex-col justify-between">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  스포원파크 야외 분수광장 현장 배치도
                </span>
                <p className="text-xs font-black text-slate-800 mt-1">중앙 분수대를 중심으로 4대 테마존 배치</p>
              </div>

              {/* 4방위 테마존 미니 맵 블록 */}
              <div className="grid grid-cols-2 gap-2 my-3">
                {FOUNTAIN_ZONE_BLOCKS.map((block) => (
                  <div
                    key={block.direction}
                    className="p-2.5 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between"
                    style={{ backgroundColor: `${block.color}15` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{block.koreanName}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white text-slate-600">
                        {block.direction === "north" && "북측 (재난대피소 앞)"}
                        {block.direction === "south" && "남측 (실내체육관 방면)"}
                        {block.direction === "east" && "동측 (가족공원 입구)"}
                        {block.direction === "west" && "서측 (경륜장 방면)"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">{block.description}</p>
                    <span className="text-[10px] font-semibold text-orange-600 mt-1.5 block">
                      부스: {block.boothRange} ({block.boothCount}개)
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                <p className="text-[11px] text-slate-600">
                  상단의 <strong className="text-orange-600 font-bold">&apos;4대 테마존 부스 (81개)&apos;</strong> 탭을 클릭하시면 전체 부스 목록을 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3-A. 구역 블록(테마존 구역 카드) 선택 시 바텀시트 */}
      {selectedBlock && selectedZoneData && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/98 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-orange-200 animate-in slide-in-from-bottom-3 duration-200 max-h-56 overflow-y-auto">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
            <div>
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedBlock.color }}
                />
                <span className="text-xs font-bold text-slate-800">
                  {selectedBlock.koreanName} ({selectedBlock.name})
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {selectedBlock.boothRange}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">{selectedBlock.description}</p>
            </div>

            <button
              onClick={() => setSelectedBlock(null)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 주요 부스 및 7성사 부스 요약 */}
          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">
                주요 거점 및 7성사 부스 (총 {selectedZoneData.booths.length}개):
              </span>
              <button
                onClick={() => {
                  setBoothModalInitialZone(selectedBlock.zoneId);
                  setIsBoothModalOpen(true);
                }}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 underline flex items-center space-x-0.5"
              >
                <span>전체 부스 목록 보기 ({selectedZoneData.booths.length}개)</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {selectedZoneData.booths
                .filter((b) => b.isSacrament || b.number <= 3)
                .map((b) => (
                  <span
                    key={b.number}
                    className={`px-2 py-0.5 rounded-lg font-medium border ${
                      b.isSacrament
                        ? "bg-amber-50 text-amber-900 border-amber-300 font-bold"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {b.number}번 {b.name} {b.isSacrament && "✝️"}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 3-B. 단일 부스/시설 핀 선택 시 팝업 시트 */}
      {selectedPoint && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/98 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-orange-200 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 pr-2">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                {selectedPoint.isSacrament && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>7성사 필수 ({selectedPoint.sacramentType})</span>
                  </span>
                )}
                {selectedPoint.zoneName && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {selectedPoint.zoneName}
                  </span>
                )}
                {selectedPoint.boothNumber && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    부스 {selectedPoint.boothNumber}번
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {selectedPoint.name}
              </h4>
              <p className="text-xs text-slate-600 leading-snug">
                {selectedPoint.description}
              </p>
            </div>

            <button
              onClick={() => setSelectedPoint(null)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              📍 스포원파크 분수광장 거점
            </span>
            <button
              onClick={() => handleOpenKakaoNavi(selectedPoint)}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>카카오맵 길안내</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. 81개 전체 부스 목록 모달 */}
      <BoothListModal
        isOpen={isBoothModalOpen}
        onClose={() => setIsBoothModalOpen(false)}
        initialZoneId={boothModalInitialZone}
        onSelectBooth={(booth) => {
          // 1. 7성사 부스인 경우 전용 정밀 좌표(SPOWON_MAP_POINTS의 sacrament) 매핑
          const sacramentPoint = booth.isSacrament
            ? SPOWON_MAP_POINTS.find(
                (p) =>
                  p.category === "sacrament" &&
                  p.zoneId === booth.zoneId &&
                  p.boothNumber === booth.boothNumber
              )
            : null;

          // 2. 일반 부스인 경우 해당 구역(zone) 대표 좌표 매핑
          const zonePoint = SPOWON_MAP_POINTS.find(
            (p) => p.category === "zone" && p.zoneId === booth.zoneId
          );

          const targetLat = sacramentPoint?.lat ?? zonePoint?.lat ?? SPOWON_CENTER.lat;
          const targetLng = sacramentPoint?.lng ?? zonePoint?.lng ?? SPOWON_CENTER.lng;

          const point: MapPoint = {
            id: sacramentPoint ? sacramentPoint.id : `booth-${booth.zoneId}-${booth.boothNumber}`,
            name: booth.name || "부스",
            category: booth.isSacrament ? "sacrament" : "zone",
            zoneId: booth.zoneId,
            zoneName: booth.zoneName,
            lat: targetLat,
            lng: targetLng,
            description: `${booth.zoneName} ${booth.boothNumber}번 부스`,
            boothNumber: booth.boothNumber,
            isSacrament: booth.isSacrament,
            sacramentType: booth.sacramentType,
          };
          handleSelectPoint(point);
        }}
      />
    </div>
  );
}
