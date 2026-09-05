import React from 'react';
import { PulseRecord, TrainerSettings } from '../types';
import { calculateTimingStandards } from '../utils/rhythmCalculator';

interface RhythmVisualizerProps {
  isKeyDown: boolean;
  currentPressDuration: number;
  lastPulse: PulseRecord | null;
  recentPulses: PulseRecord[];
  settings: TrainerSettings;
}

export const RhythmVisualizer: React.FC<RhythmVisualizerProps> = ({
  isKeyDown,
  currentPressDuration,
  lastPulse,
  recentPulses,
  settings,
}) => {
  const { ditMs, dahMs, splitBoundaryMs } = calculateTimingStandards(settings.wpm);
  const maxMeterMs = Math.max(dahMs * 1.5, 500);

  // Meter percentage
  const currentMeterPercent = Math.min(100, (currentPressDuration / maxMeterMs) * 100);
  const ditTargetPercent = (ditMs / maxMeterMs) * 100;
  const dahTargetPercent = (dahMs / maxMeterMs) * 100;
  const boundaryPercent = (splitBoundaryMs / maxMeterMs) * 100;

  // Determine current active zone while key is held down
  let liveZoneLabel = '等待按键...';
  let liveBarColor = 'bg-amber-500';

  if (isKeyDown) {
    if (currentPressDuration < ditMs * 0.7) {
      liveZoneLabel = '按键蓄力中 (点 Dit)';
      liveBarColor = 'bg-amber-400';
    } else if (currentPressDuration <= ditMs * 1.3) {
      liveZoneLabel = '★ 黄金点位 (标准点 滴)';
      liveBarColor = 'bg-emerald-400 shadow-[0_0_12px_#34d399]';
    } else if (currentPressDuration < splitBoundaryMs) {
      liveZoneLabel = '▲ 点过长，即将变成划';
      liveBarColor = 'bg-amber-500';
    } else if (currentPressDuration < dahMs * 0.85) {
      liveZoneLabel = '进入划位，尚未饱满';
      liveBarColor = 'bg-sky-400';
    } else if (currentPressDuration <= dahMs * 1.25) {
      liveZoneLabel = '★ 黄金划位 (标准划 答)';
      liveBarColor = 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]';
    } else {
      liveZoneLabel = '▼ 划拖音过长';
      liveBarColor = 'bg-rose-500 shadow-[0_0_12px_#f43f5e]';
    }
  }

  // Get styling for pulse classification badge
  const getClassificationBadge = (pulse: PulseRecord) => {
    switch (pulse.classification) {
      case 'perfect':
        return {
          bg: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
          dotBg: 'bg-emerald-400',
          title: '完美节奏',
        };
      case 'dit_too_short':
        return {
          bg: 'bg-rose-500/20 border-rose-400 text-rose-300',
          dotBg: 'bg-rose-400',
          title: '点按太短',
        };
      case 'dit_too_long':
        return {
          bg: 'bg-amber-500/20 border-amber-400 text-amber-300',
          dotBg: 'bg-amber-400',
          title: '点按长了',
        };
      case 'dah_too_short':
        return {
          bg: 'bg-amber-500/20 border-amber-400 text-amber-300',
          dotBg: 'bg-amber-400',
          title: '划按短了',
        };
      case 'dah_too_long':
        return {
          bg: 'bg-rose-500/20 border-rose-400 text-rose-300',
          dotBg: 'bg-rose-400',
          title: '划拖长了',
        };
      default:
        return {
          bg: 'bg-neutral-800 border-neutral-700 text-neutral-300',
          dotBg: 'bg-neutral-400',
          title: '未定义',
        };
    }
  };

  return (
    <div
      id="rhythm-visualizer"
      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono"
    >
      {/* Header & Live Press Duration Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-bold tracking-wider text-neutral-200 uppercase">
            实时节奏示波器 (REAL-TIME RHYTHM METER)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>
            目标点 (Dit): <strong className="text-amber-300">{ditMs}ms</strong>
          </span>
          <span className="text-neutral-600">|</span>
          <span>
            目标划 (Dah): <strong className="text-cyan-300">{dahMs}ms</strong>
          </span>
        </div>
      </div>

      {/* Real-time Oscilloscope Progress Bar */}
      <div className="relative w-full h-8 bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden">
        {/* Target Zone: Dit */}
        <div
          style={{
            left: `${ditTargetPercent * 0.8}%`,
            width: `${ditTargetPercent * 0.4}%`,
          }}
          className="absolute top-0 bottom-0 bg-amber-500/15 border-x border-amber-500/40 pointer-events-none z-10 flex items-center justify-center"
        >
          <span className="text-[9px] text-amber-300/80 font-bold hidden sm:inline">点区</span>
        </div>

        {/* Boundary Line (Split between Dit and Dah) */}
        <div
          style={{ left: `${boundaryPercent}%` }}
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-neutral-600/80 pointer-events-none z-10"
          title="点划判决边界"
        />

        {/* Target Zone: Dah */}
        <div
          style={{
            left: `${dahTargetPercent * 0.85}%`,
            width: `${dahTargetPercent * 0.3}%`,
          }}
          className="absolute top-0 bottom-0 bg-cyan-500/15 border-x border-cyan-500/40 pointer-events-none z-10 flex items-center justify-center"
        >
          <span className="text-[9px] text-cyan-300/80 font-bold hidden sm:inline">划区</span>
        </div>

        {/* Active Press Progress Fill */}
        <div
          style={{ width: `${currentMeterPercent}%` }}
          className={`h-full transition-all duration-75 ${liveBarColor}`}
        />

        {/* Current Duration text overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs pointer-events-none z-20">
          <span className="text-neutral-300 font-semibold drop-shadow">
            {isKeyDown ? `${currentPressDuration} ms` : '按住空格键或敲击电键开始'}
          </span>
          <span className="text-xs font-medium text-neutral-400">
            {isKeyDown ? liveZoneLabel : ''}
          </span>
        </div>
      </div>

      {/* Real-time Diagnosis Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">最新敲击分析:</span>
          {lastPulse ? (
            (() => {
              const badge = getClassificationBadge(lastPulse);
              return (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${badge.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badge.dotBg}`} />
                  <span>
                    {lastPulse.symbol === '.' ? '【点 ·】' : '【划 —】'} {badge.title} ({lastPulse.durationMs}ms)
                  </span>
                  <span className="text-[11px] opacity-80">
                    {lastPulse.deviationMs >= 0 ? `+${lastPulse.deviationMs}ms` : `${lastPulse.deviationMs}ms`}
                  </span>
                </div>
              );
            })()
          ) : (
            <span className="text-xs text-neutral-500 italic">尚无按键数据，轻按一下空格键试发</span>
          )}
        </div>

        {lastPulse && (
          <div className="text-xs text-neutral-400">
            标准偏差: <span className={Math.abs(lastPulse.deviationRatio) > 0.25 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {(lastPulse.deviationRatio * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Historical Pulse Ribbon (Last 12 pulses) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs text-neutral-400">
          <span>最近按键波形记录:</span>
          <span className="text-[11px] text-neutral-500">点：短圆点 / 划：长矩形</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 min-h-[36px]">
          {recentPulses.length === 0 ? (
            <span className="text-xs text-neutral-600 py-1">暂无记录</span>
          ) : (
            recentPulses.slice(-14).map((p) => {
              const badge = getClassificationBadge(p);
              const isDot = p.symbol === '.';

              return (
                <div
                  key={p.id}
                  title={`${p.symbol === '.' ? '点' : '划'} | ${p.durationMs}ms (${p.deviationMs >= 0 ? '+' : ''}${p.deviationMs}ms) | ${p.messageText}`}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded border text-[10px] shrink-0 transition-all ${badge.bg} ${
                    isDot ? 'w-10' : 'w-16'
                  }`}
                >
                  <span className="font-bold font-mono">
                    {isDot ? '·' : '—'}
                  </span>
                  <span className="text-[9px] opacity-75">{p.durationMs}ms</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
