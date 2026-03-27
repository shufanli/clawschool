"use client";
import { useEffect, useRef } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  closable?: boolean;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, closable = true, children }: BottomSheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={closable ? onClose : undefined}
      />
      <div
        ref={ref}
        className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "40px 40px 0 0",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        <div className="flex justify-center pt-[12px] pb-[8px]">
          <div className="w-[48px] h-[5px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="px-[20px] pb-[24px]">
          {children}
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
