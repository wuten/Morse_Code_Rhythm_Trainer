import React, { useState, useMemo } from 'react';
import { PulseRecord, RhythmSessionStats, TrainerSettings } from '../types';
import { calculateTimingStandards } from '../utils/rhythmCalculator';
import { morseAudio } from '../utils/morseAudio';
import {
  X,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Clock,
  Gauge,
  TrendingUp,
} from 'lucide-react';

interface RhythmAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: RhythmSessionStats;
  pulses: PulseRecord[];
  settings: TrainerSettings;
  onClearHistory: () => void;
}

export const RhythmAnalyticsModal: React.FC<RhythmAnalyticsModalProps> = ({
  isOpen,
  onClose,
  stats,
  pulses,
  settings,
  onClearHistory,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'dits' | 'dahs'>('all');
  const { ditMs, dahMs } = calculateTimingStandards(settings.wpm);

  const filteredPulses = useMemo(() => {
    switch (filterType) {
      case 'errors':
        return pulses.filter((p) => p.classification !== 'perfect');
      case 'dits':
        return pulses.filter((p) => p.symbol === '.');
      case 'dahs':
        return pulses.filter((p) => p.symbol === '-');
      default:
        return pulses;
    }
  }, [pulses, filterType]);

  if (!isOpen) return null;

  // Export CSV
  const handleExportCSV = () => {
    if (pulses.length === 0) return;
    const headers = ['序号', '时间', '符号', '字符上下文', '实测时长(ms)', '标准时长(ms)', '偏差(ms)', '偏差比例(%)', '诊断结论'];
    const rows = pulses.map((p, idx) => [
      idx + 1,
      new Date(p.timestamp).toLocaleTimeString(),
      p.symbol === '.' ? '点(.)' : '划(-)',
      p.charContext || '-',
      p.durationMs,
      p.targetDurationMs,
      p.deviationMs,
      (p.deviationRatio * 100).toFixed(1),
      `"${p.messageText}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `morse_rhythm_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Replay single pulse tone
  const playPulseSound = (pulse: PulseRecord) => {
    morseAudio.startTone();
    setTimeout(() => {
      morseAudio.stopTone();
    }, pulse.durationMs);
  };

  return (
    <div
      id="analytics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        id="analytics-modal-content"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-neutral-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                详细节奏偏差分析与错误日志 (RHYTHM ANALYTICS)
              </h3>
              <p className="text-xs text-neutral-400">
                当前测速设定: {settings.wpm} WPM · 标准点: {ditMs}ms · 标准划: {dahMs}ms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Accuracy Rate */}
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                节奏合格率
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1">
                {stats.accuracyRate}%
              </span>
              <span className="text-[11px] text-neutral-500 mt-0.5">
                完美拍发: {stats.perfectPulses} / {stats.totalPulses}
              </span>
            </div>

            {/* Dah / Dit Ratio */}
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                划点比例 (理想 3.0)
              </span>
              <span className="text-2xl font-black text-amber-400 mt-1">
                {stats.dahDitRatio} : 1
              </span>
              <span className="text-[11px] text-neutral-500 mt-0.5">
                {stats.dahDitRatio >= 2.8 && stats.dahDitRatio <= 3.2
                  ? '比例极佳'
                  : stats.dahDitRatio < 2.8
                  ? '划偏短或点偏长'
                  : '划拖长'}
              </span>
            </div>

            {/* Dit Average */}
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                平均点时长 (标称 {ditMs}ms)
              </span>
              <span className="text-2xl font-black text-sky-400 mt-1">
                {stats.avgDitDurationMs} <span className="text-xs font-normal">ms</span>
              </span>
              <span className="text-[11px] text-neutral-500 mt-0.5">
                偏差: {stats.avgDitDurationMs ? (stats.avgDitDurationMs - ditMs >= 0 ? `+${stats.avgDitDurationMs - ditMs}` : `${stats.avgDitDurationMs - ditMs}`) : 0}ms
              </span>
            </div>

            {/* Dah Average */}
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                平均划时长 (标称 {dahMs}ms)
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1">
                {stats.avgDahDurationMs} <span className="text-xs font-normal">ms</span>
              </span>
              <span className="text-[11px] text-neutral-500 mt-0.5">
                偏差: {stats.avgDahDurationMs ? (stats.avgDahDurationMs - dahMs >= 0 ? `+${stats.avgDahDurationMs - dahMs}` : `${stats.avgDahDurationMs - dahMs}`) : 0}ms
              </span>
            </div>
          </div>

          {/* Error Diagnostics Breakdown */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              节奏错误类型统计 (ERROR BREAKDOWN)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                <span className="text-rose-400">点按太短:</span>
                <span className="font-bold text-neutral-200">{stats.errorCounts.dit_too_short} 次</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                <span className="text-amber-400">点按长了:</span>
                <span className="font-bold text-neutral-200">{stats.errorCounts.dit_too_long} 次</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                <span className="text-amber-400">划按短了:</span>
                <span className="font-bold text-neutral-200">{stats.errorCounts.dah_too_short} 次</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                <span className="text-rose-400">划按长了:</span>
                <span className="font-bold text-neutral-200">{stats.errorCounts.dah_too_long} 次</span>
              </div>
            </div>
          </div>

          {/* Detailed Error Log Table */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-400" />
                <span className="text-xs font-bold text-neutral-300">日志过滤:</span>
                <div className="flex items-center p-0.5 rounded bg-neutral-950 border border-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-0.5 rounded ${filterType === 'all' ? 'bg-neutral-800 text-amber-300 font-bold' : 'text-neutral-400'}`}
                  >
                    全部 ({pulses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('errors')}
                    className={`px-2.5 py-0.5 rounded ${filterType === 'errors' ? 'bg-neutral-800 text-rose-300 font-bold' : 'text-neutral-400'}`}
                  >
                    仅错误 ({pulses.filter((p) => p.classification !== 'perfect').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('dits')}
                    className={`px-2.5 py-0.5 rounded ${filterType === 'dits' ? 'bg-neutral-800 text-sky-300 font-bold' : 'text-neutral-400'}`}
                  >
                    仅点 (·)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('dahs')}
                    className={`px-2.5 py-0.5 rounded ${filterType === 'dahs' ? 'bg-neutral-800 text-cyan-300 font-bold' : 'text-neutral-400'}`}
                  >
                    仅划 (-)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={pulses.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium disabled:opacity-40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出 CSV</span>
                </button>
                <button
                  type="button"
                  onClick={onClearHistory}
                  disabled={pulses.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-950/40 border border-rose-800 hover:bg-rose-900/60 text-rose-300 text-xs font-medium disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空日志</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="w-full max-h-[300px] overflow-y-auto border border-neutral-800 rounded-xl bg-neutral-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[11px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">符号</th>
                    <th className="p-2.5">字符</th>
                    <th className="p-2.5">实测时长</th>
                    <th className="p-2.5">标称标准</th>
                    <th className="p-2.5">偏差</th>
                    <th className="p-2.5">诊断判定</th>
                    <th className="p-2.5 text-right">回放</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredPulses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-neutral-500 italic">
                        暂无符合条件的敲击日志
                      </td>
                    </tr>
                  ) : (
                    filteredPulses.slice().reverse().map((pulse, idx) => {
                      const isPerfect = pulse.classification === 'perfect';
                      return (
                        <tr key={pulse.id} className="hover:bg-neutral-900/50">
                          <td className="p-2.5 text-neutral-500">{filteredPulses.length - idx}</td>
                          <td className="p-2.5">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                                pulse.symbol === '.' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                              }`}
                            >
                              {pulse.symbol === '.' ? '· 点' : '— 划'}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-neutral-300">{pulse.charContext || '-'}</td>
                          <td className="p-2.5 font-bold text-white">{pulse.durationMs}ms</td>
                          <td className="p-2.5 text-neutral-400">{pulse.targetDurationMs}ms</td>
                          <td className="p-2.5">
                            <span
                              className={`font-semibold ${
                                isPerfect
                                  ? 'text-emerald-400'
                                  : Math.abs(pulse.deviationRatio) > 0.25
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {pulse.deviationMs >= 0 ? `+${pulse.deviationMs}` : pulse.deviationMs}ms (
                              {(pulse.deviationRatio * 100).toFixed(0)}%)
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                isPerfect
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}
                            >
                              {pulse.messageText}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => playPulseSound(pulse)}
                              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-300"
                              title="回放此音长"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950/90 text-xs text-neutral-400">
          <span>提示：标准国际莫尔斯电码中，1个划的长等于3个点的长。</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
