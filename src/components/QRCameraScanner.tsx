"use client";

import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, AlertCircle } from "lucide-react";

interface QRCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function QRCameraScanner({ isOpen, onClose, onScanSuccess }: QRCameraScannerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const qrScannerId = "byd-qr-reader";
    const html5QrCode = new Html5Qrcode(qrScannerId);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        { facingMode: "environment" }, // 모바일 후면 카메라 우선
        config,
        (decodedText) => {
          // 스캔 성공 시
          html5QrCode
            .stop()
            .then(() => {
              onScanSuccess(decodedText);
              onClose();
            })
            .catch((err) => console.error("Scanner stop error", err));
        },
        () => {
          // 프레임 인식 실패는 조용히 무시 (정상 루프)
        }
      )
      .catch((err) => {
        console.error("Camera access error:", err);
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((e) => console.error(e));
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative flex flex-col items-center p-5 text-white">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
            <Camera className="w-4 h-4" />
            <span>부스 현장 QR 스캔</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 카메라 뷰파인더 영역 */}
        <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative border-2 border-blue-500/50 shadow-inner flex items-center justify-center">
          <div id="byd-qr-reader" className="w-full h-full" />
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/60 m-8 rounded-xl" />
        </div>

        <div className="mt-4 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-200">
            부스에 부착된 QR 코드를 사각형 안에 비춰주세요
          </p>
          <p className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>카메라 접근 허용이 필요합니다.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
