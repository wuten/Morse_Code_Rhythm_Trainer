import React, { useState, useEffect } from 'react';
import { TrainerSettings } from '../types';
import { morseAudio } from '../utils/morseAudio';
import { COMMON_KEY_PRESETS, formatKeyLabel } from '../utils/keyBindingUtils';
import {
  X,
  Settings,
  Volume2,
  Sliders,
  Palette,
  Zap,
  Keyboard,
  Smartphone,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TrainerSettings;
  onUpdateSettings: (newSettings: Partial<TrainerSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [isListeningKey, setIsListeningKey] = useState(false);

  // Key recording listener
  useEffect(() => {
    if (!isListeningKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind Escape key if user pressed Escape to cancel
      if (e.code === 'Escape') {
        setIsListeningKey(false);
        return;
      }

      const label = formatKeyLabel(e.code, e.key);
      onUpdateSettings({
        keyBinding: {
          code: e.code,
          key: e.key,
          displayLabel: label,
        },
      });
      setIsListeningKey(false);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isListeningKey, onUpdateSettings]);

  if (!isOpen) return null;

  const testBeep = () => {
    morseAudio.setConfig(settings.frequencyHz, settings.volume);
    morseAudio.startTone();
    setTimeout(() => {
      morseAudio.stopTone();
    }, 120);
  };

  const currentBindingLabel = settings.keyBinding?.displayLabel || '空格键 (Space)';
  const floatingEnabled = settings.floatingKey?.enabled !== false;
  const floatingPos = settings.floatingKey?.position || 'right';
  const floatingSize = settings.floatingKey?.size || 'normal';

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono"
    >
      <div
        id="settings-modal-content"
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">电键与节奏参数设定 (SETTINGS)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-5 space-y-6 text-xs overflow-y-auto flex-1">
          {/* PC Keyboard Key Binding Section */}
          <div className="space-y-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
                <Keyboard className="w-4 h-4 text-amber-400" />
                PC 键盘电键按键绑定 (KEY BINDING)
              </label>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {currentBindingLabel}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              可自由设置 PC 端拍发莫尔斯电码的键盘按键（支持空格、英文字母 J/K/F、回车、Ctrl 等）。
            </p>

            {/* Listening / Record Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="record-key-button"
                onClick={() => setIsListeningKey(true)}
                className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-all text-xs flex items-center justify-center gap-2 ${
                  isListeningKey
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 animate-pulse ring-2 ring-amber-400/50'
                    : 'bg-neutral-850 hover:bg-neutral-800 text-amber-300 border-amber-500/50 hover:border-amber-400 active:scale-95'
                }`}
              >
                {isListeningKey ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-neutral-950 animate-ping" />
                    <span>请在键盘上按下你想绑定的任意按键 (按 Esc 取消)...</span>
                  </>
                ) : (
                  <>
                    <Keyboard className="w-4 h-4" />
                    <span>点击按下任意键重新绑定 (Record Any Key)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[10px] text-neutral-400 mb-1.5 font-bold">常用推荐按键预设:</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {COMMON_KEY_PRESETS.map((preset) => {
                  const isCurrent =
                    settings.keyBinding?.code === preset.code ||
                    (!settings.keyBinding && preset.code === 'Space');
                  return (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          keyBinding: preset,
                        })
                      }
                      className={`p-1.5 rounded-lg border text-center transition-all text-[11px] flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      {isCurrent && <Check className="w-3 h-3 text-amber-400" />}
                      <span>{preset.displayLabel.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Floating Key Section */}
          <div className="space-y-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                手机和平板端悬浮电键 (FLOATING KEY)
              </label>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    floatingKey: {
                      ...settings.floatingKey,
                      enabled: !floatingEnabled,
                    },
                  })
                }
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                  floatingEnabled
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}
              >
                {floatingEnabled ? '已启用 (ON)' : '已停用 (OFF)'}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              在手机与平板设备上，悬浮电键常驻屏幕底部，方便单手或双手拇指直接拍发，无需反复上下滚动页面。
            </p>

            {floatingEnabled && (
              <div className="space-y-2 pt-1 border-t border-neutral-850">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">悬浮停靠位置:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['left', 'center', 'right'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            floatingKey: {
                              ...settings.floatingKey,
                              position: pos,
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                          floatingPos === pos
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {pos === 'left' ? '靠左 (左手)' : pos === 'center' ? '居中' : '靠右 (右手)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">按键旋钮尺寸:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['compact', 'normal', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            floatingKey: {
                              ...settings.floatingKey,
                              size: sz,
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                          floatingSize === sz
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {sz === 'compact' ? '紧凑' : sz === 'normal' ? '标准' : '放大'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WPM Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                报务速率 (WPM - Words Per Minute):
              </label>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold">
                {settings.wpm} WPM (点: {Math.round(1200 / settings.wpm)}ms / 划: {Math.round(1200 / settings.wpm) * 3}ms)
              </span>
            </div>

            <input
              type="range"
              min="8"
              max="25"
              step="1"
              value={settings.wpm}
              onChange={(e) => onUpdateSettings({ wpm: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>8 WPM (慢速初学 150ms)</span>
              <span>12 WPM (标准入门 100ms)</span>
              <span>18 WPM (进阶 66ms)</span>
              <span>25 WPM (专业 48ms)</span>
            </div>
          </div>

          {/* Sidetone Pitch (Frequency) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-sky-400" />
                侧音音调频率 (Sidetone Pitch):
              </label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-sky-300 font-bold">
                  {settings.frequencyHz} Hz
                </span>
                <button
                  type="button"
                  onClick={testBeep}
                  className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-600 text-sky-300 hover:bg-sky-900/80 font-bold transition-colors"
                >
                  试听
                </button>
              </div>
            </div>

            <input
              type="range"
              min="450"
              max="850"
              step="25"
              value={settings.frequencyHz}
              onChange={(e) => {
                const freq = Number(e.target.value);
                onUpdateSettings({ frequencyHz: freq });
                morseAudio.setConfig(freq, settings.volume);
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>450 Hz (低沉军用报房)</span>
              <span>650 Hz (业余无线电标准)</span>
              <span>850 Hz (清脆高音)</span>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                发报音量 (Volume):
              </label>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-emerald-300 font-bold">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                onUpdateSettings({ volume: vol });
                morseAudio.setConfig(settings.frequencyHz, vol);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Tolerance Window */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300 block">
              节奏严格度与容差窗口 (Tolerance Window):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ tolerancePercent: 15 })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.tolerancePercent === 15
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div>严格 (±15%)</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">职业级精准手感</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ tolerancePercent: 25 })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.tolerancePercent === 25
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div>标准 (±25%)</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">推荐日常练习</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ tolerancePercent: 35 })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.tolerancePercent === 35
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div>宽松 (±35%)</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">初学建立信心</div>
              </button>
            </div>
          </div>

          {/* PCB Theme */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-400" />
              电路卡板面主题 (PCB Card Solder Mask):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'pcb_dark' })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.theme === 'pcb_dark'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                哑光黑金 (ENIG Black)
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'pcb_green' })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.theme === 'pcb_green'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                经典绿油 (Classic Green)
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'pcb_blue' })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.theme === 'pcb_blue'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                深海蓝板 (Cobalt Blue)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/90 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
          >
            保存并返回练习
          </button>
        </div>
      </div>
    </div>
  );
};
