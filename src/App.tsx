import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ErrorClassification,
  LetterChallenge,
  PracticeMode,
  PulseRecord,
  RhythmSessionStats,
  TrainerSettings,
} from './types';
import {
  CODE_TO_CHAR,
  MORSE_MAP,
  CHALLENGE_LEVELS,
} from './utils/morseTreeData';
import { morseAudio } from './utils/morseAudio';
import {
  calculateTimingStandards,
  computeSessionStats,
  evaluatePulse,
} from './utils/rhythmCalculator';
import { TelegraphPcbCard } from './components/TelegraphPcbCard';
import { RhythmVisualizer } from './components/RhythmVisualizer';
import { TelegraphKey } from './components/TelegraphKey';
import { FloatingTelegraphKey } from './components/FloatingTelegraphKey';
import { PracticePanel } from './components/PracticePanel';
import { RhythmAnalyticsModal } from './components/RhythmAnalyticsModal';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { DEFAULT_KEY_BINDING, isEventMatchingKey } from './utils/keyBindingUtils';
import {
  Settings,
  BarChart2,
  HelpCircle,
  Radio,
  RotateCcw,
  Sparkles,
  Volume2,
  Keyboard,
  ExternalLink,
  Share2,
} from 'lucide-react';

const DEFAULT_SETTINGS: TrainerSettings = {
  wpm: 12,
  frequencyHz: 650,
  volume: 0.7,
  tolerancePercent: 25,
  autoSpace: true,
  soundEnabled: true,
  hapticEnabled: true,
  keyMode: 'straight',
  theme: 'pcb_dark',
  keyBinding: DEFAULT_KEY_BINDING,
  floatingKey: {
    enabled: true,
    position: 'right',
    size: 'normal',
  },
};

export default function App() {
  // Settings & Configuration
  const [settings, setSettings] = useState<TrainerSettings>(() => {
    try {
      const saved = localStorage.getItem('morse_trainer_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Practice Modes: 'free' | 'rhythm_drill' | 'letter_challenge'
  const [mode, setMode] = useState<PracticeMode>('free');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeCharStep, setChallengeCharStep] = useState(0);
  const [targetChar, setTargetChar] = useState('E');

  // Input & Key State
  const [isKeyDown, setIsKeyDown] = useState(false);
  const [currentPressDuration, setCurrentPressDuration] = useState(0);
  const [currentCode, setCurrentCode] = useState('');
  const [tentativeChar, setTentativeChar] = useState('');
  const [lastCommittedChar, setLastCommittedChar] = useState<string | null>(null);
  const [decodedText, setDecodedText] = useState('');

  // Rhythm & Pulses History
  const [pulses, setPulses] = useState<PulseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('morse_pulses_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastPulse, setLastPulse] = useState<PulseRecord | null>(null);

  // Modals
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // References for live timing
  const pressStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const charTimeoutRef = useRef<number | null>(null);
  const wordTimeoutRef = useRef<number | null>(null);

  // Synchronize audio engine settings
  useEffect(() => {
    morseAudio.setConfig(settings.frequencyHz, settings.volume);
    localStorage.setItem('morse_trainer_settings', JSON.stringify(settings));
  }, [settings]);

  // Persist pulses history (limit to last 200 items for performance)
  useEffect(() => {
    try {
      localStorage.setItem('morse_pulses_history', JSON.stringify(pulses.slice(-200)));
    } catch {
      // ignore
    }
  }, [pulses]);

  // Derived stats
  const stats: RhythmSessionStats = computeSessionStats(pulses);

  // Update target character when challenge changes
  useEffect(() => {
    if (mode === 'letter_challenge') {
      const challenge = CHALLENGE_LEVELS[challengeIndex] || CHALLENGE_LEVELS[0];
      const nextChar = challenge.chars[challengeCharStep] || challenge.chars[0];
      setTargetChar(nextChar);
    }
  }, [mode, challengeIndex, challengeCharStep]);

  // Commit current Morse code buffer to character
  const finalizeCharacter = useCallback(
    (codeToFinalize: string) => {
      if (!codeToFinalize) return;

      const matchedChar = CODE_TO_CHAR[codeToFinalize] || '?';
      setLastCommittedChar(matchedChar);
      setDecodedText((prev) => prev + matchedChar);

      // Check letter challenge
      if (mode === 'letter_challenge') {
        const currentChallenge = CHALLENGE_LEVELS[challengeIndex];
        const expected = currentChallenge.chars[challengeCharStep];

        if (matchedChar === expected) {
          // Success! Advance to next character in challenge
          if (challengeCharStep + 1 < currentChallenge.chars.length) {
            setChallengeCharStep((prev) => prev + 1);
          } else {
            // Completed current level! Advance level if available
            if (challengeIndex + 1 < CHALLENGE_LEVELS.length) {
              setChallengeIndex((prev) => prev + 1);
              setChallengeCharStep(0);
            } else {
              setChallengeCharStep(0);
            }
          }
        }
      }

      // Reset buffer
      setCurrentCode('');
      setTentativeChar('');

      // Auto space timeout (7 units of silence)
      if (settings.autoSpace) {
        if (wordTimeoutRef.current) {
          window.clearTimeout(wordTimeoutRef.current);
        }
        const { wordGapMs } = calculateTimingStandards(settings.wpm);
        wordTimeoutRef.current = window.setTimeout(() => {
          setDecodedText((prev) => (prev.endsWith(' ') ? prev : prev + ' '));
        }, wordGapMs);
      }
    },
    [mode, challengeIndex, challengeCharStep, settings.autoSpace, settings.wpm]
  );

  // Handle press start (Space down or mouse down on key)
  const handlePressStart = useCallback(() => {
    if (isKeyDown) return;

    // Clear pending character / word timeouts
    if (charTimeoutRef.current) {
      window.clearTimeout(charTimeoutRef.current);
      charTimeoutRef.current = null;
    }
    if (wordTimeoutRef.current) {
      window.clearTimeout(wordTimeoutRef.current);
      wordTimeoutRef.current = null;
    }

    const now = performance.now();
    pressStartTimeRef.current = now;
    setIsKeyDown(true);
    setCurrentPressDuration(0);

    // Audio start
    if (settings.soundEnabled) {
      morseAudio.startTone();
    }

    // Live millisecond progress updater
    const updateProgress = () => {
      if (pressStartTimeRef.current !== null) {
        const elapsed = Math.round(performance.now() - pressStartTimeRef.current);
        setCurrentPressDuration(elapsed);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [isKeyDown, settings.soundEnabled]);

  // Handle press release (Space up or mouse up on key)
  const handlePressEnd = useCallback(() => {
    if (!isKeyDown || pressStartTimeRef.current === null) return;

    const duration = Math.max(15, Math.round(performance.now() - pressStartTimeRef.current));
    pressStartTimeRef.current = null;
    setIsKeyDown(false);

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Audio stop
    morseAudio.stopTone();

    // Evaluate pulse rhythm
    const evaluated = evaluatePulse(duration, settings, targetChar);
    setLastPulse(evaluated);
    setPulses((prev) => [...prev, evaluated]);

    // Append to current Morse code sequence (e.g. '.' or '-')
    const nextCode = currentCode + evaluated.symbol;
    setCurrentCode(nextCode);

    const tentative = CODE_TO_CHAR[nextCode] || '';
    setTentativeChar(tentative);

    // Start silence timeout for character completion (3 units = charGapMs)
    const { charGapMs } = calculateTimingStandards(settings.wpm);
    if (charTimeoutRef.current) {
      window.clearTimeout(charTimeoutRef.current);
    }
    charTimeoutRef.current = window.setTimeout(() => {
      finalizeCharacter(nextCode);
    }, charGapMs);
  }, [isKeyDown, settings, targetChar, currentCode, finalizeCharacter]);

  // Keyboard event listener (customizable key binding)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently focused on an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (isEventMatchingKey(e, settings.keyBinding)) {
        if (e.repeat) return; // Prevent OS key-repeat
        e.preventDefault();
        handlePressStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (isEventMatchingKey(e, settings.keyBinding)) {
        e.preventDefault();
        handlePressEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePressStart, handlePressEnd, settings.keyBinding]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (charTimeoutRef.current) window.clearTimeout(charTimeoutRef.current);
      if (wordTimeoutRef.current) window.clearTimeout(wordTimeoutRef.current);
      morseAudio.stopTone();
    };
  }, []);

  const handleClearHistory = () => {
    setPulses([]);
    setLastPulse(null);
    localStorage.removeItem('morse_pulses_history');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/80 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-white font-mono uppercase">
                  Morse Code Rhythm Trainer
                </h1>
                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PCB 二叉树卡片版
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                交互式电码节奏练习器 · 动态路径指示灯 · 实时节奏偏差检测
              </p>
            </div>
          </div>

          {/* Real-time Status Badges & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* PC Key Binding Quick Display / Customizer */}
            <button
              type="button"
              id="quick-key-binding-button"
              onClick={() => setIsSettingsOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-xs font-mono transition-all text-neutral-300 active:scale-95"
              title="点击自定义 PC 键盘电键按键"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-400">电键:</span>
              <span className="font-bold text-amber-300">
                {settings.keyBinding?.displayLabel || '空格键 (Space)'}
              </span>
            </button>

            {/* Accuracy Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400">节奏合格率:</span>
              <span
                className={`font-black ${
                  stats.accuracyRate >= 85
                    ? 'text-emerald-400'
                    : stats.accuracyRate >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {stats.accuracyRate}%
              </span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">划点比:</span>
              <span className="font-bold text-amber-300">{stats.dahDitRatio}:1</span>
            </div>

            {/* Analytics Modal Button */}
            <button
              type="button"
              id="open-analytics-button"
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-all active:scale-95"
              title="打开节奏统计与错误日志"
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">偏差日志</span>
              {stats.totalPulses - stats.perfectPulses > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-bold">
                  {stats.totalPulses - stats.perfectPulses}
                </span>
              )}
            </button>

            {/* Share Modal Button */}
            <button
              type="button"
              id="open-share-button"
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all active:scale-95 shadow-sm"
              title="分享到微信、X、小红书等社交媒体"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">分享</span>
            </button>

            {/* Settings Modal Button */}
            <button
              type="button"
              id="open-settings-button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
              title="参数设定"
            >
              <Settings className="w-4 h-4 text-neutral-300" />
              <span className="hidden sm:inline">设定</span>
            </button>

            {/* Help Button */}
            <button
              type="button"
              id="open-help-button"
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all"
              title="使用指南与说明"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Help Banner if toggled */}
      {isHelpOpen && (
        <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 py-3 text-xs font-mono text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>操作说明与二叉树卡片使用秘诀:</span>
              </div>
              <p className="text-amber-300/90 leading-relaxed">
                1. <strong>按键操作</strong>：电脑端默认长按/轻敲键盘<strong>空格键（Space）</strong>，可随时在右上角或电键卡片自定义为 <strong>J / K / F / 回车</strong> 等任意键；手机与平板端配备<strong>屏幕悬浮电键</strong>，支持拇指随时盲拍且不挡二叉树视线。<br />
                2. <strong>二叉树指示灯</strong>：电键短按一下（点 ·），E 对应的灯亮起；紧接着长按一下（划 -），路径转到 A，A 灯亮起；再长按一下（划 -），转到 W，W 灯亮起！<br />
                3. <strong>停顿与解码</strong>：输入完一个字符后稍作停顿，系统自动识别并上屏到下方报文纸带。<br />
                4. <strong>节奏纠错</strong>：实时检测“点按长了、划按短了、划拖长了、点按太短”，并在示波器与日志中给出毫秒级偏差。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="px-3 py-1 rounded bg-amber-900/60 hover:bg-amber-900 text-amber-100 font-bold border border-amber-700"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (With bottom padding clearance for mobile/tablet floating key) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 pb-32 sm:pb-36 lg:pb-8">
        {/* Top Split: PCB Tree Card (Left 65%) + Physical Telegraph Key & Rhythm Meter (Right 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: The Amazon-style PCB Telegraph Binary Tree Card */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <TelegraphPcbCard
              currentCode={currentCode}
              lastCommittedChar={lastCommittedChar}
              targetChar={mode === 'letter_challenge' ? targetChar : undefined}
              wpm={settings.wpm}
              theme={settings.theme}
            />
          </div>

          {/* Right: Telegraph Straight Key & Quick Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <TelegraphKey
              isKeyDown={isKeyDown}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
              keyBindingLabel={settings.keyBinding?.displayLabel}
              onOpenKeySettings={() => setIsSettingsOpen(true)}
            />

            {/* Mini Quick Practice Hint */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 text-xs font-mono flex flex-col gap-2">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  当前拍发状态
                </span>
                <span className="text-[11px] text-neutral-400">
                  {isKeyDown ? '触点闭合 (ON)' : '等待键入 (READY)'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
                <span className="text-neutral-400">待提交代码:</span>
                <span className="text-amber-300 font-bold text-sm tracking-widest">
                  {currentCode ? currentCode : '（无）'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
                <span className="text-neutral-400">对应指示字母:</span>
                <span className="text-emerald-400 font-bold text-base">
                  {tentativeChar ? tentativeChar : lastCommittedChar ? `上一个: ${lastCommittedChar}` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Rhythm Oscilloscope / Feedback Meter */}
        <RhythmVisualizer
          isKeyDown={isKeyDown}
          currentPressDuration={currentPressDuration}
          lastPulse={lastPulse}
          recentPulses={pulses}
          settings={settings}
        />

        {/* Practice Modes & Decoded Text Tape */}
        <PracticePanel
          mode={mode}
          onSelectMode={setMode}
          targetChar={targetChar}
          onNextTargetChar={() => {
            const currentChallenge = CHALLENGE_LEVELS[challengeIndex];
            setChallengeCharStep((prev) => (prev + 1) % currentChallenge.chars.length);
          }}
          onSetTargetChar={setTargetChar}
          decodedText={decodedText}
          currentCode={currentCode}
          tentativeChar={tentativeChar}
          onClearText={() => setDecodedText('')}
          settings={settings}
          challengeIndex={challengeIndex}
          onSelectChallenge={(idx) => {
            setChallengeIndex(idx);
            setChallengeCharStep(0);
          }}
          charChallengeStep={challengeCharStep}
          onOpenShare={() => setIsShareOpen(true)}
        />
      </main>

      {/* Floating Telegraph Key for Mobile and Tablet (Always accessible without scrolling) */}
      <FloatingTelegraphKey
        isKeyDown={isKeyDown}
        onPressStart={handlePressStart}
        onPressEnd={handlePressEnd}
        currentPressDuration={currentPressDuration}
        currentCode={currentCode}
        tentativeChar={tentativeChar}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
      />

      {/* Analytics Modal */}
      <RhythmAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        stats={stats}
        pulses={pulses}
        settings={settings}
        onClearHistory={handleClearHistory}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        stats={stats}
        settings={settings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 py-3.5 px-4 text-center text-xs text-neutral-500 font-mono flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>Morse Code Rhythm Trainer · 交互式莫尔斯电码节奏与二叉树卡片练习器</span>
        <span className="hidden sm:inline text-neutral-700">|</span>
        <a
          href="https://morse.ykx-uas.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-500 hover:text-amber-400 hover:underline transition-colors flex items-center gap-1 font-semibold"
          title="访问在线预览地址"
        >
          <span>在线预览: morse.ykx-uas.com</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <span className="hidden sm:inline text-neutral-700">|</span>
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          className="text-neutral-400 hover:text-amber-300 hover:underline transition-colors flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-400" />
          <span>分享到微信 / X / 小红书</span>
        </button>
      </footer>
    </div>
  );
}
