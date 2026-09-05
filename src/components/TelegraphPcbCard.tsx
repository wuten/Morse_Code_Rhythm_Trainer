import React, { useMemo } from 'react';
import { TreeNode } from '../types';
import {
  MORSE_TREE_NODES,
  TREE_NODE_BY_ID,
  getActivePathNodeIds,
  DIGITS_AND_PUNCT,
  MORSE_MAP,
} from '../utils/morseTreeData';
import { morseAudio } from '../utils/morseAudio';

interface TelegraphPcbCardProps {
  currentCode: string;
  lastCommittedChar: string | null;
  targetChar?: string;
  wpm: number;
  theme: 'pcb_dark' | 'pcb_green' | 'pcb_blue';
  onPlayCharAudio?: (char: string) => void;
}

export const TelegraphPcbCard: React.FC<TelegraphPcbCardProps> = ({
  currentCode,
  lastCommittedChar,
  targetChar,
  wpm,
  theme,
  onPlayCharAudio,
}) => {
  // Compute active path based on current typed code
  const activePathIds = useMemo(() => {
    return getActivePathNodeIds(currentCode);
  }, [currentCode]);

  const activeLeafId = activePathIds[activePathIds.length - 1];

  // Target path if in challenge/learning mode
  const targetCode = targetChar ? MORSE_MAP[targetChar] : null;
  const targetPathIds = useMemo(() => {
    return targetCode ? getActivePathNodeIds(targetCode) : [];
  }, [targetCode]);

  // Handle clicking a node to hear tone and preview
  const handleNodeClick = (node: TreeNode) => {
    if (node.char && node.char !== 'START' && node.char !== 'Ü' && node.char !== 'Ä' && node.char !== 'Ö' && node.char !== 'CH') {
      if (onPlayCharAudio) {
        onPlayCharAudio(node.char);
      } else {
        morseAudio.playReferenceCode(node.code, wpm);
      }
    }
  };

  // Theme styling definitions
  const themeClasses = {
    pcb_dark: {
      boardBg: 'bg-[#0b1016] border-[#223040]',
      gridDots: '#192636',
      traceInactive: '#1e2f42',
      traceActive: '#f59e0b',
      goldText: 'text-[#d4af37]',
      silkscreen: 'text-neutral-400',
    },
    pcb_green: {
      boardBg: 'bg-[#08180e] border-[#1a3824]',
      gridDots: '#122c1b',
      traceInactive: '#163820',
      traceActive: '#10b981',
      goldText: 'text-[#d4af37]',
      silkscreen: 'text-emerald-300/60',
    },
    pcb_blue: {
      boardBg: 'bg-[#071322] border-[#152e4e]',
      gridDots: '#0e233d',
      traceInactive: '#17365d',
      traceActive: '#38bdf8',
      goldText: 'text-[#d4af37]',
      silkscreen: 'text-sky-300/60',
    },
  }[theme];

  return (
    <div
      id="morse-pcb-card"
      className={`relative w-full rounded-2xl border-2 ${themeClasses.boardBg} shadow-2xl overflow-hidden select-none transition-colors duration-300 p-3 sm:p-5 font-mono`}
    >
      {/* PCB Silkscreen Background Texture & Mounting Holes */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pcb-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.75" fill={themeClasses.gridDots} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcb-grid)" />
        </svg>
      </div>

      {/* PCB Corner Gold Mounting Rings */}
      <div className="absolute top-3 left-3 w-4 h-4 rounded-full border-2 border-amber-500/60 bg-neutral-900 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
      </div>
      <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-amber-500/60 bg-neutral-900 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
      </div>
      <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full border-2 border-amber-500/60 bg-neutral-900 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
      </div>
      <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full border-2 border-amber-500/60 bg-neutral-900 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
      </div>

      {/* Card Header Silkscreen */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 border-b border-neutral-800/80 mb-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/90 shadow-[0_0_8px_#f59e0b]" />
          <span className="font-bold tracking-wider text-amber-300 uppercase">
            TELEGRAPH BINARY TREE CARD · REV 2.4
          </span>
          <span className="hidden sm:inline text-neutral-500">|</span>
          <span className="hidden sm:inline text-neutral-400">ENIG GOLD FINISH</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">● 左分支 (· 点)</span>
            <span className="text-neutral-500">/</span>
            <span className="text-sky-400 font-bold">■ 右分支 (- 划)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-amber-200/90 border border-neutral-700 font-semibold">
            {wpm} WPM
          </span>
        </div>
      </div>

      {/* Main Binary Tree Interactive Canvas */}
      <div className="relative w-full aspect-[16/10] min-h-[360px] sm:min-h-[420px] max-h-[580px]">
        {/* SVG Circuit Traces */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          {MORSE_TREE_NODES.map((node) => {
            const elements: React.ReactNode[] = [];

            // Draw left branch (Dot)
            if (node.dotChildId) {
              const child = TREE_NODE_BY_ID.get(node.dotChildId);
              if (child) {
                const isActive =
                  activePathIds.includes(node.id) &&
                  activePathIds.includes(child.id);
                const isTarget =
                  targetPathIds.includes(node.id) &&
                  targetPathIds.includes(child.id);

                elements.push(
                  <g key={`${node.id}-dot-${child.id}`}>
                    <path
                      d={`M ${node.xPercent} ${node.yPercent + 2.5} Q ${(node.xPercent + child.xPercent) / 2} ${(node.yPercent + child.yPercent) / 2} ${child.xPercent} ${child.yPercent - 2.5}`}
                      stroke={isActive ? '#fbbf24' : isTarget ? '#38bdf8' : themeClasses.traceInactive}
                      strokeWidth={isActive ? '0.9' : '0.45'}
                      strokeDasharray="1.2 0.8"
                      fill="none"
                      className="transition-colors duration-150"
                    />
                    {isActive && (
                      <path
                        d={`M ${node.xPercent} ${node.yPercent + 2.5} Q ${(node.xPercent + child.xPercent) / 2} ${(node.yPercent + child.yPercent) / 2} ${child.xPercent} ${child.yPercent - 2.5}`}
                        stroke="#fbbf24"
                        strokeWidth="1.8"
                        strokeOpacity="0.4"
                        fill="none"
                        filter="blur(1px)"
                      />
                    )}
                  </g>
                );
              }
            }

            // Draw right branch (Dash)
            if (node.dashChildId) {
              const child = TREE_NODE_BY_ID.get(node.dashChildId);
              if (child) {
                const isActive =
                  activePathIds.includes(node.id) &&
                  activePathIds.includes(child.id);
                const isTarget =
                  targetPathIds.includes(node.id) &&
                  targetPathIds.includes(child.id);

                elements.push(
                  <g key={`${node.id}-dash-${child.id}`}>
                    <path
                      d={`M ${node.xPercent} ${node.yPercent + 2.5} Q ${(node.xPercent + child.xPercent) / 2} ${(node.yPercent + child.yPercent) / 2} ${child.xPercent} ${child.yPercent - 2.5}`}
                      stroke={isActive ? '#fbbf24' : isTarget ? '#38bdf8' : themeClasses.traceInactive}
                      strokeWidth={isActive ? '1.1' : '0.55'}
                      fill="none"
                      className="transition-colors duration-150"
                    />
                    {isActive && (
                      <path
                        d={`M ${node.xPercent} ${node.yPercent + 2.5} Q ${(node.xPercent + child.xPercent) / 2} ${(node.yPercent + child.yPercent) / 2} ${child.xPercent} ${child.yPercent - 2.5}`}
                        stroke="#fbbf24"
                        strokeWidth="2.2"
                        strokeOpacity="0.4"
                        fill="none"
                        filter="blur(1px)"
                      />
                    )}
                  </g>
                );
              }
            }

            return elements;
          })}
        </svg>

        {/* Tree Nodes (Gold solder pads with SMD LEDs) */}
        {MORSE_TREE_NODES.map((node) => {
          const isStart = node.id === 'START';
          const isCurrentActive = activeLeafId === node.id;
          const isInPath = activePathIds.includes(node.id);
          const isCommitted = lastCommittedChar && (node.char === lastCommittedChar);
          const isTarget = targetChar && node.char === targetChar;

          // LED glow state
          const ledGlow = isCurrentActive
            ? 'bg-amber-400 shadow-[0_0_14px_4px_rgba(245,158,11,0.95)] border-amber-200'
            : isInPath
            ? 'bg-amber-500/80 shadow-[0_0_8px_2px_rgba(245,158,11,0.6)] border-amber-300/70'
            : isCommitted
            ? 'bg-emerald-400 shadow-[0_0_16px_5px_rgba(16,185,129,0.9)] border-emerald-200 animate-pulse'
            : isTarget
            ? 'bg-sky-400 shadow-[0_0_10px_3px_rgba(56,189,248,0.7)] border-sky-200 animate-pulse'
            : 'bg-neutral-800/80 border-neutral-700/60 shadow-none';

          // Pad frame color
          const padBorder = isCurrentActive
            ? 'border-amber-400 bg-amber-950/70 text-amber-200 ring-2 ring-amber-400/40'
            : isInPath
            ? 'border-amber-500/70 bg-amber-950/40 text-amber-200'
            : isCommitted
            ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200'
            : isTarget
            ? 'border-sky-400 bg-sky-950/60 text-sky-200 ring-1 ring-sky-400/50'
            : 'border-neutral-700/70 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500 hover:text-white';

          // Node size based on hierarchy level
          const sizeClasses = isStart
            ? 'w-16 h-8 text-xs'
            : node.level === 1
            ? 'w-11 h-11 text-base'
            : node.level === 2
            ? 'w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base'
            : node.level === 3
            ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'
            : 'w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs';

          return (
            <div
              key={node.id}
              id={`node-${node.id}`}
              onClick={() => handleNodeClick(node)}
              style={{
                left: `${node.xPercent}%`,
                top: `${node.yPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={`${node.char} (${node.code || '起始'}) - 点击试听`}
              className={`absolute z-10 flex flex-col items-center justify-center rounded-lg border cursor-pointer transition-all duration-150 ${sizeClasses} ${padBorder}`}
            >
              {/* LED Indicator Dot */}
              <div
                className={`absolute -top-1 w-2 h-2 rounded-full border transition-all duration-150 ${ledGlow}`}
              />

              {/* Character Text */}
              <span className="font-bold leading-none tracking-tight">
                {node.char}
              </span>

              {/* Sub-label for Morse code on higher levels */}
              {node.level <= 2 && !isStart && (
                <span className="text-[9px] text-neutral-400 font-mono tracking-tighter mt-0.5">
                  {node.code}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Digits & Common Punctuation Bar (PCB Aux Table) */}
      <div className="relative z-10 mt-2 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            数字与标点辅助指示灯 (DIGITS & PUNCTUATION)
          </span>
          <span className="text-neutral-500 text-[10px]">支持完整电码自动识别</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1 text-center">
          {DIGITS_AND_PUNCT.map((item) => {
            const isMatch = currentCode === item.code;
            const isCommitted = lastCommittedChar === item.char;
            const isTarget = targetChar === item.char;

            const bgStyle = isMatch
              ? 'bg-amber-500/20 border-amber-400 text-amber-200'
              : isCommitted
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
              : isTarget
              ? 'bg-sky-500/20 border-sky-400 text-sky-200'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700';

            return (
              <button
                key={item.char}
                type="button"
                onClick={() => morseAudio.playReferenceCode(item.code, wpm)}
                className={`p-1 rounded border transition-all duration-150 flex flex-col items-center justify-center ${bgStyle}`}
                title={`${item.char}: ${item.code} (点击试听)`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isMatch || isCommitted
                        ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                        : isTarget
                        ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
                        : 'bg-neutral-700'
                    }`}
                  />
                  <span className="font-bold text-xs">{item.char}</span>
                </div>
                <span className="text-[9px] font-mono tracking-tighter text-neutral-500">
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
