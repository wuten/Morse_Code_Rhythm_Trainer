import React, { useRef, useState } from 'react';
import { TrainerSettings } from '../types';
import { calculateTimingStandards } from '../utils/rhythmCalculator';
import { Radio, MoveHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface FloatingTelegraphKeyProps {
  isKeyDown: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  currentPressDuration: number;
  currentCode: string;
  tentativeChar: string;
  settings: TrainerSettings;
  onUpdateSettings: (newSettings: Partial<TrainerSettings>) => void;
  disabled?: boolean;
}

export const FloatingTelegraphKey: React.FC<FloatingTelegraphKeyProps> = ({
  isKeyDown,
  onPressStart,
  onPressEnd,
  currentPressDuration,
  currentCode,
  tentativeChar,
  settings,
  onUpdateSettings,
  disabled = false,
}) => {
  const isPointerDownRef = useRef(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { ditMs } = calculateTimingStandards(settings.wpm);
  const isDashTiming = currentPressDuration > ditMs * 1.8;

  const position = settings.floatingKey?.position || 'right';
  const size = settings.floatingKey?.size || 'normal';
  const enabled = settings.floatingKey?.enabled !== false;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    isPointerDownRef.current = true;
    if (settings.hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    onPressStart();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    e.preventDefault();
    isPointerDownRef.current = false;
    onPressEnd();
  };

  const handlePointerCancel = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      onPressEnd();
    }
  };

  const cyclePosition = () => {
    const positions: Array<'right' | 'center' | 'left'> = ['right', 'center', 'left'];
    const currentIndex = positions.indexOf(position);
    const nextPosition = positions[(currentIndex + 1) % positions.length];
    onUpdateSettings({
      floatingKey: {
        ...settings.floatingKey,
        position: nextPosition,
      },
    });
  };

  if (!enabled) return null;

  // Size dimensions
  const knobSizeClass =
    size === 'large'
      ? 'w-24 h-24'
      : size === 'compact'
      ? 'w-18 h-18'
      : 'w-20 h-20';

  const innerCapSizeClass =
    size === 'large'
      ? 'w-16 h-16'
      : size === 'compact'
      ? 'w-12 h-12'
      : 'w-14 h-14';

  // Position alignment
  const positionClass =
    position === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : position === 'left'
      ? 'left-4'
      : 'right-4';

  return (
    <div
      id="floating-telegraph-key"
      className={`fixed bottom-4 z-40 lg:hidden flex flex-col items-center pointer-events-auto transition-all duration-300 font-mono select-none ${positionClass}`}
    >
      {/* Live HUD Floating Tag (Realtime duration, code, and tentative character) */}
      {!isMinimized && (
        <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/95 border border-neutral-700/90 shadow-2xl backdrop-blur text-xs">
          {/* Live Audio / Transmit indicator */}
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              isKeyDown
                ? isDashTiming
                  ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8] scale-125'
                  : 'bg-amber-400 shadow-[0_0_8px_#fbbf24] scale-125'
                : 'bg-neutral-600'
            }`}
          />

          {isKeyDown ? (
            <span className="font-bold flex items-center gap-1">
              <span className={isDashTiming ? 'text-cyan-300' : 'text-amber-300'}>
                {currentPressDuration}ms
              </span>
              <span className="text-[10px] text-neutral-400">
                {isDashTiming ? '(- 划)' : '(· 点)'}
              </span>
            </span>
          ) : (
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <span>代码:</span>
              <span className="text-amber-300 font-bold">
                {currentCode || '空闲'}
              </span>
              {tentativeChar && (
                <span className="text-emerald-400 font-bold ml-1">
                  [{tentativeChar}]
                </span>
              )}
            </span>
          )}

          {/* Quick position switch button */}
          <button
            type="button"
            onClick={cyclePosition}
            className="ml-1.5 p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="切换左/中/右位置"
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Minimize / collapse toggle */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="折叠悬浮按键"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* When Minimized: small floating trigger */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-xl backdrop-blur transition-all active:scale-95"
        >
          <Radio className="w-4 h-4" />
          <span>展开悬浮按键</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      ) : (
        /* Floating Telegraph Knob Button */
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            id="mobile-floating-telegraph-button"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
            disabled={disabled}
            className={`relative ${knobSizeClass} rounded-full border-4 transition-all duration-75 flex flex-col items-center justify-center touch-none outline-none shadow-2xl active:scale-95 ${
              isKeyDown
                ? 'scale-90 bg-neutral-900 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.8)] translate-y-1'
                : 'bg-neutral-900 border-neutral-700 hover:border-amber-400/70 shadow-[0_10px_25px_rgba(0,0,0,0.8)]'
            }`}
          >
            {/* Outer Gold PCB Solder Ring */}
            <div className="absolute inset-1.5 rounded-full border border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-950 pointer-events-none" />

            {/* Center Mechanical Knob Cap */}
            <div
              className={`relative z-10 ${innerCapSizeClass} rounded-full flex flex-col items-center justify-center transition-all duration-75 border ${
                isKeyDown
                  ? 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-300 text-amber-100 shadow-[inset_0_3px_10px_rgba(0,0,0,0.7)]'
                  : 'bg-gradient-to-b from-neutral-700 to-neutral-900 border-neutral-600 text-neutral-200 shadow-[0_6px_14px_rgba(0,0,0,0.6)]'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mb-0.5 transition-all ${
                  isKeyDown
                    ? 'bg-amber-200 shadow-[0_0_10px_#fbbf24] scale-125'
                    : 'bg-neutral-500'
                }`}
              />
              <span className="font-black text-xs uppercase tracking-wider">
                {isKeyDown ? '拍发中' : '电键'}
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                {isKeyDown ? 'SEND' : 'TAP'}
              </span>
            </div>

            {/* Pulsing Spark Glow Ring */}
            {isKeyDown && (
              <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping pointer-events-none" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
