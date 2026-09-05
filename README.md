# Morse Code Rhythm Trainer (莫尔斯电码节奏与二叉树卡片练习器)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-morse.ykx--uas.com-amber?style=for-the-badge&logo=google-chrome&logoColor=white)](https://morse.ykx-uas.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

> 📻 一个专为业余无线电（HAM）爱好者、通信技术学习者及摩斯密码初学者打造的**全功能、交互式莫尔斯电码节奏训练器**。结合沉浸式 **PCB 沉金二叉树卡片**、**Web Audio 高保真电报侧音**与**毫秒级节奏偏差实时诊断**。

---

## 🌐 在线体验与预览地址 (Live Preview)

* **官方预览域名**：👉 **[https://morse.ykx-uas.com/](https://morse.ykx-uas.com/)**
* **无需安装**：支持桌面浏览器、手机触屏、平板手势及离线 PWA 运行。

---

## ✨ 核心特性

### 1. 🖨️ 沉浸式 PCB 二叉树记忆卡片 (Dichotomous Tree Card)
* **动态路径指示灯**：还原经典二叉树解码逻辑。短按（点 `·`）向左流转，长按（划 `-`）向右推进。
* **沉金 PCB 视觉风格**：深色工业覆铜质感结合高对比发光走线，输入过程中实时点亮路径节点与对应字符。
* **双向交互**：不仅支持键盘/鼠标拍发时动态点亮，点击卡片任意字符亦可自动回放标准莫尔斯音频与点划节奏。

### 2. 🎛️ 触觉与机械反馈电键 (Telegraph Key)
* **高仿真物理电键**：支持点划触底位移、弹簧回弹与动态按压计时。
* **全平台适配**：
  * **PC 桌面端**：默认空格键（Space），支持在设置中一键自定义为任意键盘按键（如 `J` / `K` / `F` / `Enter` 等）。
  * **移动与平板端**：内置**全屏悬浮电键（Floating Key）**，支持自由调节位置（居左/居右）与尺寸，支持单手拇指盲拍且绝不遮挡二叉树视线。

### 3. ⏱️ 实时节奏示波器与毫秒级误差检测 (Rhythm Precision Engine)
* **标准 PARIS 节奏标准**：基于国际通用的 $WPM$ 速率模型（1 Dit = $1200 / WPM$ ms，1 Dah = $3 \times$ Dit）。
* **四大偏差智能诊断**：
  * ⚠️ `DIT_TOO_LONG`（点按长了）：短音接近或进入划的范围
  * ⚠️ `DIT_TOO_SHORT`（点按太短）：持续时间不足标准点的一半
  * ⚠️ `DAH_TOO_SHORT`（划按短了）：长音未达标准划的最小阈值
  * ⚠️ `DAH_TOO_LONG`（划拖长了）：长按超时导致节奏拖沓
* **划点比实时计算**：实时监测拍发划点时长比例（理想标准为 $3.0:1$），直观评估手法稳定性。

### 4. 🎵 Web Audio 高纯度纯音引擎
* 纯正无延迟正弦波振荡器，告别音频爆音与卡顿。
* 侧音频段自由调节（$400\,\text{Hz} \sim 1000\,\text{Hz}$），默认业余无线电经典 $650\,\text{Hz}$ 侧音。
* 支持音频开关、音量调节与移动端振动触觉反馈（Haptic Vibration）。

### 5. 📚 多维度训练模式
* **自由练习 (Free Mode)**：随心拍发，即时解码并打印到打字机风格纸带上，支持自动字符间隔与单词空格断句。
* **节奏精修训练 (Rhythm Drill)**：专项打磨标准“点”与“划”的时间肌肉记忆，示波器提供柱状偏差百分比。
* **字母进阶闯关 (Letter Challenge)**：从单音节字母（E, T）到复杂组合字母、数字与标点符号逐步升级。

---

## ⌨️ 快捷操作指南

| 操作 | 功能说明 | 适用平台 |
| :--- | :--- | :--- |
| **空格键 (Space)** | 默认电报拍发键（长按为划，短敲为点） | PC 桌面端 |
| **自定义电键** | 顶部导航栏点击“电键”或进入“设定”，按下任意键盘按键即可绑定 | PC 桌面端 |
| **屏幕实体电键** | 鼠标左键按住/松开 | 桌面端 |
| **屏幕悬浮电键** | 右下角/左下角触控按钮，拇指拍发 | 手机 / 平板端 |
| **点击卡片字母** | 试听该字符标准发音并观察二叉树路径演练 | 全平台 |

---

## 🛠️ 本地开发与构建指南

### 前置要求
* Node.js $\ge 18.0.0$
* npm 或 pnpm / yarn

### 1. 克隆代码仓库
```bash
git clone https://github.com/your-username/morse-code-trainer.git
cd morse-code-trainer
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动本地开发服务
```bash
npm run dev
```
打开浏览器访问 `http://localhost:3000` 即可开始调试。

### 4. 生产环境打包
```bash
npm run build
```
打包产物将输出在 `dist/` 目录中。

---

## 🚀 部署到 Cloudflare Pages

本项目为纯静态现代单页应用（SPA），已预置 `/public/_redirects` 路由重写规则，与 Cloudflare Pages 具备 100% 原生兼容性。

### 部署步骤：
1. 将项目代码推送到 GitHub。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** -> **Create application** -> **Pages**。
3. 选择 **Connect to Git** 并关联你的 GitHub 仓库。
4. 构建配置如下：
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
5. 点击 **Save and Deploy**，1分钟内即可完成全球多节点 CDN 部署。
6. 在 Cloudflare Pages 的 **Custom domains** 页面中绑定您的域名（如 `morse.ykx-uas.com`）即可直接上线。

---

## 📱 发布到移动端（Google Play）

由于本项目具备完善的移动端全屏响应式布局与音频/触觉支持，可轻松通过 Google 推荐的 **TWA (Trusted Web Activity)** 流程发布至 Google Play：

1. **线上地址准备**：使用已部署的线上生产地址 [https://morse.ykx-uas.com/](https://morse.ykx-uas.com/)。
2. **打包生成 Android 应用**：
   * 访问微软官方开源的 [PWABuilder](https://www.pwabuilder.com/) 或使用 Google 官方的 `bubblewrap` CLI。
   * 输入 `https://morse.ykx-uas.com/`，系统将一键生成符合 Google Play 规范的 Android 工程源码及打包好的 `.aab` (Android App Bundle)。
3. **上架提交**：
   * 登录 [Google Play Console](https://play.google.com/console/)。
   * 上传生成的 `.aab` 文件并配置应用截图、图标与隐私政策即可提交审核发布。

---

## 📂 项目结构说明

```
├── index.html                     # 应用 HTML 入口与 SEO 设定
├── public/
│   └── _redirects                 # Cloudflare Pages 单页应用 200 重定向规则
├── src/
│   ├── App.tsx                    # 主应用与控制中枢
│   ├── components/
│   │   ├── TelegraphPcbCard.tsx   # 沉浸式 PCB 二叉树交互卡片
│   │   ├── TelegraphKey.tsx       # 机械电键与即时状态指示
│   │   ├── FloatingTelegraphKey.tsx # 移动端悬浮电键（支持左右手切换与尺寸调整）
│   │   ├── RhythmVisualizer.tsx   # 实时示波器与点划偏差仪表盘
│   │   ├── PracticePanel.tsx      # 报文纸带打印机与模式切换器
│   │   ├── RhythmAnalyticsModal.tsx # 节拍统计与错误日志弹窗
│   │   └── SettingsModal.tsx      # 参数设定弹窗（WPM、侧音频度、键位映射等）
│   ├── utils/
│   │   ├── morseTreeData.ts       # 二叉树节点关系、莫尔斯映射表与关卡数据
│   │   ├── morseAudio.ts          # Web Audio API 高精度侧音发生器
│   │   ├── rhythmCalculator.ts    # PARIS 标尺计算与四大偏差分类诊断算法
│   │   └── keyBindingUtils.ts     # 物理键盘按键捕获与绑定格式化工具
│   ├── types.ts                   # 完整 TypeScript 类型定义
│   ├── main.tsx                   # React 根挂载点
│   └── index.css                  # Tailwind CSS 全局样式
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源发布。欢迎自由学习、改进与衍生开发。
如有功能建议或发现问题，欢迎提交 Issue 或 Pull Request！
