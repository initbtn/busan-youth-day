"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SPOWON_CENTER, SPOWON_MAP_POINTS, MapPoint } from "@/data/mapCoordinates";
import {
  Sparkles,
  Crosshair,
  ExternalLink,
  AlertCircle,
  X,
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

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "sacrament" | "zone" | "facility">("all");

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  const handleSelectPoint = useCallback(
    (point: MapPoint) => {
      setSelectedPoint(point);
      if (onSelectPoint) onSelectPoint(point);

      if (mapInstanceRef.current && window.kakao?.maps) {
        const moveLatLon = new window.kakao.maps.LatLng(point.lat, point.lng);
        mapInstanceRef.current.panTo(moveLatLon);
      }
    },
    [onSelectPoint]
  );

  // 마커 렌더링 함수
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
        });

        customOverlay.setMap(map);
        markersRef.current.push(customOverlay);
      });
    },
    [handleSelectPoint]
  );

  // 카카오 지도 스크립트 비동기 로드
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

        const options = {
          center: new window.kakao.maps.LatLng(SPOWON_CENTER.lat, SPOWON_CENTER.lng),
          level: 3, // 스포원파크 야외광장이 한눈에 들어오는 줌 레벨
        };

        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        mapInstanceRef.current = map;

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        setIsLoading(false);
        renderMarkers(activeFilter);

        if (initialSelectedId) {
          const pt = SPOWON_MAP_POINTS.find((p) => p.id === initialSelectedId);
          if (pt) {
            handleSelectPoint(pt);
          }
        }
      });
    };

    // 스크립트가 이미 있는지 확인
    const existingScript = document.getElementById("kakao-map-sdk");
    if (existingScript) {
      if (window.kakao?.maps) {
        initializeMap();
      } else {
        existingScript.addEventListener("load", initializeMap);
      }
    } else {
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = `//dapi.kakao.com/v2/maps/appkey=${apiKey}&autoload=false`;
      script.async = true;
      script.onload = initializeMap;
      script.onerror = () => {
        if (isMounted) {
          setLoadError("카카오맵 SDK 스크립트 로드 중 네트워크 오류가 발생했습니다.");
          setIsLoading(false);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [apiKey, activeFilter, initialSelectedId, renderMarkers, handleSelectPoint]);

  // 필터 변경 시 재렌더링
  useEffect(() => {
    if (!isLoading && !loadError) {
      renderMarkers(activeFilter);
    }
  }, [activeFilter, isLoading, loadError, renderMarkers]);

  const handleResetCenter = () => {
    if (mapInstanceRef.current && window.kakao?.maps) {
      const center = new window.kakao.maps.LatLng(SPOWON_CENTER.lat, SPOWON_CENTER.lng);
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setLevel(3);
    }
  };

  // 카카오맵 외부 길찾기 링크 열기
  const handleOpenKakaoNavi = (point: MapPoint) => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(point.name)},${point.lat},${point.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex flex-col">
      {/* 1. 상단 필터 바 */}
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

        {/* 내 위치 / 광장 중심 복원 버튼 */}
        <button
          onClick={handleResetCenter}
          className="p-2.5 bg-white/95 backdrop-blur-md text-slate-700 rounded-2xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors pointer-events-auto"
          title="중심 광장으로 이동"
        >
          <Crosshair className="w-4 h-4 text-orange-600" />
        </button>
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
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-50 text-center space-y-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
              <AlertCircle className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-bold">{loadError}</p>
            </div>
            <p className="text-[11px] text-slate-500">
              네트워크 상태를 확인하시거나 아래의 안내 탭에서 텍스트 및 상세 약도를 확인하실 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* 3. 하단 선택된 부스/시설 팝업 시트 */}
      {selectedPoint && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/98 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-orange-200 animate-in slide-in-from-bottom-3 duration-200">
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
    </div>
  );
}
