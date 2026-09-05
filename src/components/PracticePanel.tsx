import React, { useState } from 'react';
import {
  PracticeMode,
  LetterChallenge,
  PulseRecord,
  TrainerSettings,
} from '../types';
import { CHALLENGE_LEVELS, MORSE_MAP } from '../utils/morseTreeData';
import { morseAudio } from '../utils/morseAudio';
import { Volume2, Play, CheckCircle2, RotateCcw, Copy, Trash2, ArrowRight } from 'lucide-react';

interface PracticePanelProps {
  mode: PracticeMode;
  onSelectMode: (mode: PracticeMode) => void;
  targetChar: string;
  onNextTargetChar?: () => void;
  onSetTargetChar: (char: string) => void;
  decodedText: string;
  currentCode: string;
  tentativeChar: string;
  onClearText: () => void;
  settings: TrainerSettings;
  challengeIndex: number;
  onSelectChallenge: (index: number) => void;
  charChallengeStep: number;
}

export const PracticePanel: React.FC<PracticePanelProps> = ({
  mode,
  onSelectMode,
  targetChar,
  onNextTargetChar,
  onSetTargetChar,
  decodedText,
  currentCode,
  tentativeChar,
  onClearText,
  settings,
  challengeIndex,
  onSelectChallenge,
  charChallengeStep,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const currentChallenge = CHALLENGE_LEVELS[challengeIndex] || CHALLENGE_LEVELS[0];

  const handleCopyText = async () => {
    if (!decodedText) return;
    try {
      await navigator.clipboard.writeText(decodedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback
    }
  };

  const playTargetReference = () => {
    if (!targetChar) return;
    const code = MORSE_MAP[targetChar];
    if (code) {
      morseAudio.playReferenceCode(code, settings.wpm);
    }
  };

  return (
    <div
      id="practice-panel"
      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 font-mono"
    >
      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase">模式选择:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <button
              type="button"
              id="mode-tab-free"
              onClick={() => onSelectMode('free')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                mode === 'free'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              自由拍发 (Free)
            </button>
            <button
              type="button"
              id="mode-tab-rhythm"
              onClick={() => onSelectMode('rhythm_drill')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                mode === 'rhythm_drill'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              节奏节拍律动 (Rhythm)
            </button>
            <button
              type="button"
              id="mode-tab-challenge"
              onClick={() => onSelectMode('letter_challenge')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                mode === 'letter_challenge'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              闯关挑战 (Challenge)
            </button>
          </div>
        </div>

        {/* WPM badge */}
        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <span>当前定速:</span>
          <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold border border-neutral-700">
            {settings.wpm} WPM
          </span>
        </div>
      </div>

      {/* Mode Specific Controller */}
      {mode === 'letter_challenge' && (
        <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs text-amber-400 font-bold">
                {currentChallenge.title}
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {currentChallenge.description}
              </p>
            </div>

            {/* Level Selector */}
            <select
              id="challenge-level-select"
              value={challengeIndex}
              onChange={(e) => onSelectChallenge(Number(e.target.value))}
              className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded px-2 py-1 outline-none"
            >
              {CHALLENGE_LEVELS.map((lvl, idx) => (
                <option key={lvl.id} value={idx}>
                  第 {idx + 1} 课: {lvl.title.split('：')[1] || lvl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Current Target Letter Display & Audio Prompt */}
          <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-sky-950/60 border-2 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <span className="text-2xl font-black">{targetChar || '?'}</span>
              </div>

              <div>
                <div className="text-xs text-neutral-400">
                  目标电码:{' '}
                  <strong className="text-sky-300 text-base font-bold font-mono tracking-wider ml-1">
                    {MORSE_MAP[targetChar] || ''}
                  </strong>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  进度: {charChallengeStep + 1} / {currentChallenge.chars.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playTargetReference}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-semibold transition-all active:scale-95"
                title="播放标准示范发音"
              >
                <Volume2 className="w-4 h-4" />
                <span>示范听音</span>
              </button>

              {onNextTargetChar && (
                <button
                  type="button"
                  onClick={onNextTargetChar}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-all"
                  title="跳过/下一题"
                >
                  <span>跳过</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'rhythm_drill' && (
        <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-3 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold">节奏与肌肉记忆律动练习:</span>
            <span className="text-neutral-400 text-[11px]">按节拍器练习匀速点划</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSetTargetChar('E')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                targetChar === 'E'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <span className="font-bold text-sm text-neutral-200">连续点练习 (· · · ·)</span>
              <span className="text-[10px] text-neutral-400 mt-1">
                目标时长: {Math.round(1200 / settings.wpm)}ms / 点
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSetTargetChar('T')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                targetChar === 'T'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <span className="font-bold text-sm text-neutral-200">连续划练习 (- - - -)</span>
              <span className="text-[10px] text-neutral-400 mt-1">
                目标时长: {Math.round(1200 / settings.wpm) * 3}ms / 划
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSetTargetChar('A')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                targetChar === 'A'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <span className="font-bold text-sm text-neutral-200">交替点划练习 (· - · -)</span>
              <span className="text-[10px] text-neutral-400 mt-1">
                标准比例: 1 : 3.0
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Live Decoded Message Ticker & Buffer */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">报文解码纸带 (MESSAGE DECODER):</span>
            {currentCode && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-bold">
                当前键入: {currentCode} {tentativeChar ? `→ ${tentativeChar}` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyText}
              disabled={!decodedText}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition-colors"
              title="复制报文文本"
            >
              {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onClearText}
              disabled={!decodedText}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 disabled:opacity-30 transition-colors"
              title="清空记录"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Paper Tape Screen */}
        <div className="w-full min-h-[60px] max-h-[110px] overflow-y-auto bg-neutral-950 rounded-xl border border-neutral-800 p-3 flex flex-wrap items-center gap-1 font-mono text-base tracking-wider text-amber-100">
          {decodedText ? (
            decodedText.split('').map((ch, idx) => (
              <span
                key={idx}
                className={
                  ch === ' '
                    ? 'inline-block w-3 border-b border-neutral-700 mx-0.5'
                    : 'px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-300 font-bold'
                }
              >
                {ch === ' ' ? '' : ch}
              </span>
            ))
          ) : (
            <span className="text-neutral-600 text-xs italic">
              拍发空格键输入，停顿即自动确认字母并追加上屏...
            </span>
          )}

          {/* Pending character preview */}
          {tentativeChar && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-amber-400 animate-pulse font-bold">
              {tentativeChar}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
