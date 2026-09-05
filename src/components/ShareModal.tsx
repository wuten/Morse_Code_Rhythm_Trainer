import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { RhythmSessionStats, TrainerSettings } from '../types';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  MessageCircle,
  Twitter,
  BookOpen,
  Globe,
  Send,
  Smartphone,
  Sparkles,
  Award,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: RhythmSessionStats;
  settings: TrainerSettings;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  stats,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'wechat' | 'x' | 'xiaohongshu'>('all');
  const [includeStats, setIncludeStats] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const shareUrl = 'https://morse.ykx-uas.com/';

  // Construct text based on whether stats are included
  const shareContent = useMemo(() => {
    const baseTitle = '📻 莫尔斯电码节奏与二叉树卡片练习器 (Morse Code Rhythm Trainer)';
    const baseDesc = '交互式 PCB 沉金二叉树卡片，高精度侧音与毫秒级节奏偏差实时诊断，支持 PC 键盘自定义电键与移动端悬浮电键！';

    let statsText = '';
    if (includeStats && stats.totalPulses > 0) {
      statsText = `\n🎯 我的练习战绩：\n· 节奏合格率：${stats.accuracyRate}%\n· 划点时长比：${stats.dahDitRatio}:1 (标准3:1)\n· 练习总脉冲：${stats.totalPulses} 次 (${settings.wpm} WPM)`;
    }

    const fullShareText = `${baseTitle}\n${baseDesc}${statsText}\n👉 在线体验：${shareUrl}`;

    // Specific text for Xiaohongshu with high-traffic tags
    const xhsTitle = '【硬核极客】超酷的莫尔斯电码 PCB 二叉树练习器！在线直接玩 📻';
    const xhsContent = `${xhsTitle}\n\n发现一个超棒的莫尔斯电码在线练习神器！\n\n✨ 核心亮点：\n1. 覆铜 PCB 风格沉金二叉树卡片，点划走线路径动态点亮\n2. 纯音 Web Audio 侧音振荡器，声音纯正不刺耳\n3. 毫秒级 PARIS 节奏示波器，实时检测点划过长/过短误差\n4. 手机端还贴心设计了右下角悬浮电键，单手盲拍超级顺手！\n${statsText ? `\n${statsText}\n` : ''}\n🔗 体验地址：${shareUrl}\n\n#莫尔斯电码 #摩斯密码 #业余无线电 #极客玩具 #学习打卡 #前端开发 #编程日常`;

    // Specific text for X (Twitter)
    const xText = `📻 Morse Code Rhythm Trainer - 交互式莫尔斯电码二叉树练习器\nPCB dichotomous tree card, real-time rhythm precision analytics & Web Audio sidetone.\n${includeStats && stats.totalPulses > 0 ? `My accuracy: ${stats.accuracyRate}% (Ratio ${stats.dahDitRatio}:1)\n` : ''}Try it free:`;

    return {
      title: baseTitle,
      desc: baseDesc,
      fullShareText,
      xhsContent,
      xText,
    };
  }, [includeStats, stats, settings.wpm, shareUrl]);

  // Generate high-resolution QR code
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Open X / Twitter share intent
  const handleShareToX = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareContent.xText
    )}&url=${encodeURIComponent(shareUrl)}&hashtags=MorseCode,HamRadio,WebDev`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Open Weibo share intent
  const handleShareToWeibo = () => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(
      shareUrl
    )}&title=${encodeURIComponent(shareContent.fullShareText)}`;
    window.open(weiboUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Open Telegram share intent
  const handleShareToTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareContent.fullShareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // System Native Share if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Morse Code Rhythm Trainer',
          text: shareContent.fullShareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono"
    >
      <div
        id="share-modal-content"
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">分享莫尔斯练习器 (SHARE)</h3>
              <p className="text-[11px] text-neutral-400">
                分享至微信、X、小红书、微博等社交媒体
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-share-modal-button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Target URL Card with Quick Copy */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-neutral-400 block mb-0.5">
                公共预览与体验网址 (Public Live URL)
              </span>
              <div className="font-bold text-amber-400 text-sm tracking-wide truncate">
                {shareUrl}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-colors active:scale-95 shadow-sm"
                  title="调用手机系统分享面板"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>系统分享</span>
                </button>
              )}
              <button
                type="button"
                id="copy-share-url-btn"
                onClick={() => handleCopy(shareUrl, 'url')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold transition-colors active:scale-95"
              >
                {copiedKey === 'url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">已复制!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制链接</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Include current stats toggle */}
          {stats.totalPulses > 0 && (
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-200">
                    分享文案中附带我的实时战绩
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    合格率 {stats.accuracyRate}% · 划点比 {stats.dahDitRatio}:1 · {stats.totalPulses} 次脉冲
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
            </div>
          )}

          {/* Social Platforms Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-center transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-amber-300 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              全部渠道
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wechat')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'wechat'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>微信分享</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('x')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'x'
                  ? 'bg-sky-950 text-sky-300 border border-sky-700/50 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              <span>X (Twitter)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('xiaohongshu')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'xiaohongshu'
                  ? 'bg-rose-950 text-rose-300 border border-rose-700/50 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>小红书</span>
            </button>
          </div>

          {/* Tab 1: All Channels Grid */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* WeChat Trigger */}
                <button
                  type="button"
                  id="share-channel-wechat"
                  onClick={() => setActiveTab('wechat')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-950 hover:bg-emerald-950/30 border border-neutral-800 hover:border-emerald-500/50 transition-all text-neutral-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-neutral-200">微信</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5">扫码 / 朋友圈</span>
                </button>

                {/* X (Twitter) Trigger */}
                <button
                  type="button"
                  id="share-channel-x"
                  onClick={handleShareToX}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-950 hover:bg-sky-950/30 border border-neutral-800 hover:border-sky-500/50 transition-all text-neutral-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 mb-2 group-hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs text-neutral-200">
                    <span>X (Twitter)</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5">一键推文</span>
                </button>

                {/* Xiaohongshu Trigger */}
                <button
                  type="button"
                  id="share-channel-xhs"
                  onClick={() => setActiveTab('xiaohongshu')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-950 hover:bg-rose-950/30 border border-neutral-800 hover:border-rose-500/50 transition-all text-neutral-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-neutral-200">小红书</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5">图文笔记排版</span>
                </button>

                {/* Weibo Trigger */}
                <button
                  type="button"
                  id="share-channel-weibo"
                  onClick={handleShareToWeibo}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-950 hover:bg-amber-950/30 border border-neutral-800 hover:border-amber-500/50 transition-all text-neutral-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs text-neutral-200">
                    <span>新浪微博</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5">同步发博</span>
                </button>
              </div>

              {/* Secondary Row: Telegram & Copy text */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-200">Telegram / 其它社群</div>
                    <div className="text-[10px] text-neutral-400">
                      支持一键直达 Telegram 频道或复制完整推荐文案
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShareToTelegram}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-blue-950 hover:border-blue-500/40 border border-neutral-700 text-neutral-200 text-xs transition-colors"
                  >
                    <Send className="w-3 h-3 text-blue-400" />
                    <span>Telegram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(shareContent.fullShareText, 'fullText')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors"
                  >
                    {copiedKey === 'fullText' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>已复制全篇文案</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>复制完整推荐文案</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: WeChat QR Code & Guide */}
          {activeTab === 'wechat' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* QR Code Container */}
                <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="WeChat QR Code"
                      className="w-40 h-40 object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <QrCode className="w-8 h-8 animate-pulse" />
                    </div>
                  )}
                  <span className="text-[10px] text-neutral-600 font-bold mt-1.5">
                    微信扫一扫即可体验
                  </span>
                </div>

                {/* Instructions */}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-400 font-bold text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>微信分享方式</span>
                  </div>
                  <ul className="text-neutral-300 space-y-1 text-xs list-disc list-inside leading-relaxed text-left">
                    <li>使用微信「扫一扫」扫描左侧二维码，即可在微信内置浏览器直接打开。</li>
                    <li>在微信中点击右上角「···」菜单，即可一键发送给朋友或分享到朋友圈。</li>
                    <li>支持移动端全屏触控与悬浮电键，随时随地练习电码拍发。</li>
                  </ul>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => handleCopy(shareContent.fullShareText, 'wechat-text')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === 'wechat-text' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>已复制微信分享词</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制微信分享词与链接</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: X (Twitter) */}
          {activeTab === 'x' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Twitter className="w-4 h-4" />
                  <span>X (Twitter) 分享预设</span>
                </div>
                <button
                  type="button"
                  onClick={handleShareToX}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold flex items-center gap-1.5 transition-colors active:scale-95 shadow"
                >
                  <span>立即发布到 X</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tweet Preview */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 font-mono text-xs whitespace-pre-line leading-relaxed">
                {shareContent.xText}
                <span className="text-sky-400 font-bold block mt-1">
                  {shareUrl} #MorseCode #HamRadio
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${shareContent.xText} ${shareUrl} #MorseCode #HamRadio`,
                      'x-copy'
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                >
                  {copiedKey === 'x-copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已复制推文文本</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制推文文本</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Xiaohongshu Note Template */}
          {activeTab === 'xiaohongshu' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>小红书图文笔记分享模板</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://creator.xiaohongshu.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>小红书创作者中心</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(shareContent.xhsContent, 'xhs-copy')}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 text-xs transition-colors active:scale-95 shadow"
                  >
                    {copiedKey === 'xhs-copy' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>已复制小红书文案!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>一键复制排版文案</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Note Content Box */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 text-xs whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto">
                {shareContent.xhsContent}
              </div>

              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  提示：小红书发帖建议搭配网页截图（PCB 二叉树亮灯效果与示波器波形图吸睛率极高！）。
                </span>
              </div>
            </div>
          )}

          {/* Full Share Text Preview Box */}
          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>完整分享文本预览：</span>
              <button
                type="button"
                onClick={() => handleCopy(shareContent.fullShareText, 'preview-copy')}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'preview-copy' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制文本</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-neutral-400 whitespace-pre-line text-[11px] font-mono leading-relaxed bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
              {shareContent.fullShareText}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-neutral-500 font-mono truncate">
            https://morse.ykx-uas.com/ · 扫码 / 复制即用
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
