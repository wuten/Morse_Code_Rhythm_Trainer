import React, { useRef } from 'react';

interface TelegraphKeyProps {
  isKeyDown: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  disabled?: boolean;
  keyBindingLabel?: string;
  onOpenKeySettings?: () => void;
}

export const TelegraphKey: React.FC<TelegraphKeyProps> = ({
  isKeyDown,
  onPressStart,
  onPressEnd,
  disabled = false,
  keyBindingLabel = '空格键 (Space)',
  onOpenKeySettings,
}) => {
  const isPointerDownRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    isPointerDownRef.current = true;
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

  return (
    <div
      id="telegraph-key-container"
      className="flex flex-col items-center justify-center p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl select-none"
    >
      <div className="text-center mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          物理电键输入区 (STRAIGHT TELEGRAPH KEY)
        </h4>
        <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] text-neutral-400 mt-1">
          <span>电脑端按住</span>
          <button
            type="button"
            onClick={onOpenKeySettings}
            className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-300 font-mono text-[11px] font-bold transition-all hover:border-amber-400 active:scale-95 flex items-center gap-1"
            title="点击更改按键设置"
          >
            <span>{keyBindingLabel}</span>
            <span className="text-[10px] text-neutral-400">⚙️改键</span>
          </button>
          <span>或按住下方旋钮</span>
        </div>
      </div>

      {/* Tactile Straight Key Visual Control */}
      <button
        type="button"
        id="telegraph-key-button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        disabled={disabled}
        className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-4 transition-all duration-75 flex flex-col items-center justify-center touch-none outline-none focus:ring-4 focus:ring-amber-500/30 ${
          isKeyDown
            ? 'scale-95 bg-neutral-900 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6)] translate-y-1.5'
            : 'bg-neutral-800/90 border-neutral-700 shadow-2xl hover:border-amber-500/60 hover:shadow-amber-500/10 active:scale-95'
        }`}
      >
        {/* Outer Brass Key Rim */}
        <div className="absolute inset-2 rounded-full border border-neutral-700/80 bg-gradient-to-b from-neutral-800 to-neutral-900 pointer-events-none" />

        {/* Center Knob / Bakelite Cap */}
        <div
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-75 border ${
            isKeyDown
              ? 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-300 text-amber-100 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]'
              : 'bg-gradient-to-b from-neutral-700 to-neutral-900 border-neutral-600 text-neutral-200 shadow-[0_8px_16px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* Audio Wave / Contact Indicator */}
          <div
            className={`w-3.5 h-3.5 rounded-full mb-1 transition-all duration-75 ${
              isKeyDown
                ? 'bg-amber-200 shadow-[0_0_12px_#fbbf24] scale-125'
                : 'bg-neutral-600'
            }`}
          />

          <span className="font-bold text-sm sm:text-base tracking-wider uppercase">
            {isKeyDown ? '发报中...' : '拍 发'}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">
            {isKeyDown ? 'TRANSMITTING' : 'KEY DOWN'}
          </span>
        </div>

        {/* Gold Solder Ring Spark Feedback */}
        {isKeyDown && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/80 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Quick Rhythm Timing Hint */}
      <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>短触 = 点 (· 滴)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded-sm bg-cyan-400" />
          <span>长按 = 划 (- 答)</span>
        </div>
      </div>
    </div>
  );
};
