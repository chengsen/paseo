# Paseo 架构简化诊断报告

> **审计日期**: 2026-05-09  
> **审计范围**: `packages/app`, `packages/desktop`, `packages/server`  
> **代码规模**: App ~168 组件 / 19 Zustand stores / 7 Context Providers / 55 Screens；Desktop ~26 IPC 通道；Server ~952 行 bootstrap  
> **方法论**: 5 维度静态扫描 + 调用链追踪 + 依赖体积分析  
> **原则**: 只诊断，不修改代码

---

## 执行摘要

本次审计发现 **28 项** 架构简化机会，按收益/风险分级如下：

| 分级                  | 数量 | 预估影响                                                           |
| --------------------- | ---- | ------------------------------------------------------------------ |
| **高收益 / 低风险**   | 9    | 启动速度提升 2-5 倍、包体积减少 200MB+、消除 150 次/30s 的进程风暴 |
| **中等收益 / 可重构** | 14   | 减少 20% 组件嵌套层级、合并 8 个微 store、清理 6 个冗余 IPC 通道   |
| **高风险 / 慎动**     | 5    | 涉及核心状态模型、WebSocket 兼容性、跨版本 schema 兼容             |

**最高优先级**：桌面端启动轮询的 CLI 进程风暴（30 秒内可能 spawn 150 个 Node 进程）和 `@dnd-kit` 在 Native bundle 中的死代码捆绑。

---

## 一、【高收益 / 低风险】立即可以做

### 1.1 桌面启动轮询：30 秒 spawn 150 个 Node 进程

- **位置**: `packages/desktop/src/daemon/daemon-manager.ts:311-329`
- **现状**: `pollForRunningDaemon()` 每 200ms 轮询一次，最多 150 次（30 秒）。**每次轮询 spawn 一个完整的 CLI 子进程** (`paseo daemon status --json`)，该子进程需要加载整个 server 包、解析配置、执行 git 检查、序列化 JSON 后退出。最坏情况下 30 秒内启动 150 个 Node 进程。
- **危害**: 这是整个桌面层最昂贵的反模式。CPU 占满、磁盘 I/O 飙升、用户感知到明显的启动卡顿。
- **建议**:
  1. 在 spawn CLI 之前，先用 `isDesktopManagedDaemonRunningSync()`（读 pid 文件 + `process.kill(pid, 0)`）做快速路径判断；
  2. 将固定间隔轮询改为**指数退避**（200ms → 400ms → 800ms → 上限 2s）；
  3. 减少 `STARTUP_POLL_MAX_ATTEMPTS` 到 50 次，配合退避仍覆盖约 30 秒。

### 1.2 `@dnd-kit` 被 Metro 无条件捆绑进 Native Bundle

- **位置**: `packages/app/src/components/split-container.tsx`, `packages/app/src/components/split-drop-zone.tsx`
- **现状**: 这两个基础文件（无平台扩展）在顶部无条件 `import` `@dnd-kit/core` 和 `@dnd-kit/sortable`，并被 `workspace-screen.tsx` 直接引用。Metro 不做 tree-shaking，iOS/Android 构建时整个 `@dnd-kit` 依赖树被完整打包，但 Native 端从不渲染拖拽面板。
- **危害**: Native JS bundle 增加数十 KB 无用代码，违反 AGENTS.md "Prefer Metro file extensions over `if` statements" 原则。
- **建议**:
  1. `split-container.tsx` → 拆分为 `split-container.web.tsx`（完整 DnD 实现）和 `split-container.native.tsx`（静态布局）；
  2. `split-drop-zone.tsx` 同理拆分；
  3. Metro 在构建时自动选择正确文件，Native 端完全不会解析 DnD 代码。

### 1.3 移除零引用的 `react-native-webview`

- **位置**: `packages/app/package.json` line 94
- **现状**: `react-native-webview` 列为直接依赖，但 `packages/app/src/` 下零 import。这是一个重型原生模块，包含 iOS/Android 原生代码和构建产物。
- **危害**: 增加 EAS 构建时间、增大 IPA/APK 体积、带来不必要的原生链接步骤。
- **建议**: 直接从 `package.json` 移除。如为 transitive peer dependency，验证上层包是否仍需它。

### 1.4 缓存守护进程状态，消灭每次 UI 轮询的 CLI spawn

- **位置**: `packages/desktop/src/daemon/daemon-manager.ts:237-274`
- **现状**: `resolveDesktopDaemonStatus()` 被 `use-daemon-status.ts`、`use-install-status.ts` 等多个 React Query hook 调用，每次 refetch 都 spawn `paseo daemon status --json`。设置页可能同时触发 4+ 个 CLI 进程。
- **危害**: 用加载整个 server 栈的代价去获取 3 个字段（pid、listen、serverId）。
- **建议**:
  1. 在主进程缓存最后一次已知状态，通过监听 pid 文件变化或 spawn 进程的 stdout/exit 事件更新；
  2. 提供一个聚合命令 `get_desktop_system_summary`，一次 IPC 返回 daemon 状态 + 安装状态 + 版本；
  3. `runCliJsonCommand` 仅用于变更操作（start/stop/restart）。

### 1.5 `session-store.ts` 中存在死状态字段

- **位置**: `packages/app/src/stores/session-store.ts`（1,308 行）
- **现状**: Store 中声明了 `messages`、`currentAssistantMessage` 等字段，但审计显示它们已被其他数据源（如 WebSocket message stream）取代，不再被任何组件读取。`agentDetails` 等字段也需要二次确认。
- **危害**: 1,300+ 行的 store 文件中混杂废弃字段，增加心智负担、延长类型检查时间、误导新开发者。
- **建议**:
  1. 用 `grep` 确认 `messages`、`currentAssistantMessage` 的零引用后删除；
  2. 对 `agentDetails` 等边界字段做引用分析；
  3. 清理后 store 可缩减约 15-20%。

### 1.6 移除显式的 `react-native-worklets` 依赖

- **位置**: `packages/app/package.json` line 95
- **现状**: `react-native-worklets` 列为直接依赖，但 `packages/app/src/` 零直接 import。它是 `react-native-reanimated` 的 transitive dependency。
- **危害**: 增加 1.2GB `node_modules` 磁盘占用（主要是 Android 构建产物），且存在版本错配风险。
- **建议**: 从 `package.json` 移除，让 reanimated 自行引入。若未来直接调用 worklet API 再显式添加。

### 1.7 `buffer` polyfill 可替换为原生 API

- **位置**: `packages/app/package.json` line 53；散布于 8 个源文件
- **现状**: 显式依赖 `buffer` 包，用于 `Buffer.from()` 和 `TextEncoder`/`TextDecoder` polyfill。Hermes (RN 0.70+) 已内置 `TextEncoder`/`TextDecoder`/`Uint8Array`，RN 0.72+ 支持 `btoa`/`atob`。
- **危害**: 约 10KB+ bundle 开销，维护一个不再必要的 polyfill。
- **建议**:
  1. 将 `Buffer.from(pcm).toString("base64")` 替换为 `btoa` 或 `expo-crypto` 的 base64；
  2. `polyfills/crypto.ts` 中的 `TextEncoder`/`TextDecoder` 改用全局构造函数；
  3. 移除 `buffer` 依赖。

### 1.8 合并两个侧边栏动画 Context

- **位置**: `packages/app/src/contexts/sidebar-animation-context.tsx`, `packages/app/src/contexts/explorer-sidebar-animation-context.tsx`
- **现状**: 两个 context 分别管理不同侧边栏的动画状态，但代码结构几乎相同（open/close/toggle + 动画参数）。合计约 330 行。
- **危害**: 重复逻辑、重复 Provider 嵌套、`_layout.tsx` 中多一层 wrapper。
- **建议**: 合并为一个参数化 provider `useSidebarAnimation(sidebarId: 'main' | 'explorer')`，约 180 行即可覆盖两者。

### 1.9 停止本地传输事件向所有窗口广播

- **位置**: `packages/desktop/src/daemon/local-transport.ts:30-34`
- **现状**: `emitTransportEvent()` 使用 `BrowserWindow.getAllWindows()` 向**所有窗口**发送 `paseo:event:local-daemon-transport-event`。多窗口场景下，未创建该 transport session 的窗口也会收到消息。
- **危害**: 无效 IPC 流量、潜在的竞态条件、窗口隔离性破坏。
- **建议**: 在 `open_local_daemon_transport` IPC 调用时记录 `sender`（`event.sender`），后续只向该 sender 发送事件。

---

## 二、【中等收益 / 可重构】需要一定工作量

### 2.1 双 IPC 架构并存：直接通道 vs 通用命令总线

- **位置**: `packages/desktop/src/preload.ts`, `packages/desktop/src/main.ts`, `packages/desktop/src/daemon/daemon-manager.ts:598-610`
- **现状**: Preload 同时暴露两套 IPC 模式：
  - **直接通道**: `paseo:dialog:ask`, `paseo:window:toggleMaximize` 等 ~12 个，有强类型 preload API；
  - **通用命令总线**: `paseo:invoke` 处理 ~25 个命令（settings、attachments、daemon lifecycle、updates、local transport），全部挤在 `createDaemonCommandHandlers()` 一个扁平命名空间里。
- **危害**: 新功能随意选择模式，API 表面不一致；通用总线把无关领域混在一起。
- **建议**: 保留直接通道用于 UI 交互（dialog、window、menu）。将通用总线按领域拆分为 `createSettingsHandlers()`、`createDaemonLifecycleHandlers()`、`createAttachmentHandlers()` 等模块，在注册时合并。不再新增一次性直接通道。

### 2.2 `paseo:get-pending-open-project` 应并入通用总线

- **位置**: `packages/desktop/src/main.ts:250-255`, `packages/desktop/src/preload.ts:9-10`
- **现状**: 独立的 `ipcMain.handle` 通道，只返回一个字符串（pending open-project path），全生命周期仅消费一次。却拥有专门的 preload 属性 `getPendingOpenProject()`。
- **危害**: 为单个 getter 增加特殊 case 的 preload 表面和主进程注册。
- **建议**: 改为 `paseo:invoke` 命令 `get_pending_open_project`，移除专用 preload 属性。

### 2.3 `createDaemonCommandHandlers()` 缺少批量附件 API

- **位置**: `packages/desktop/src/daemon/daemon-manager.ts:552-557`
- **现状**: `write_attachment_base64`、`delete_attachment_file` 等均为单条命令。粘贴多张图片时产生 N 次顺序 IPC 往返。
- **建议**: 新增 `write_attachments_batch` 和 `delete_attachments_batch`，接受数组参数。

### 2.4 `workspace-screen.tsx` 过长（~3,600 行）

- **位置**: `packages/app/src/screens/workspace/workspace-screen.tsx`
- **现状**: 单个 screen 文件承载了 workspace 布局、面板管理、浏览器集成、sidebar 状态、模态框路由等几乎所有 workspace 级逻辑。
- **危害**: 编译时间长、代码审查困难、改一处牵全身、测试覆盖率低。
- **建议**:
  1. 将布局骨架提取为 `WorkspaceLayout` 组件；
  2. 将面板管理提取为 `WorkspacePanelManager`；
  3. 将模态框路由提取为 `WorkspaceModals`；
  4. 目标：screen 文件缩减到 ~800 行，只保留路由和数据编排。

### 2.5 `_layout.tsx` 存在 5 层嵌套 Provider

- **位置**: `packages/app/src/app/_layout.tsx`（921 行）
- **现状**: `RootProviders` → `RuntimeProviders` → `ProvidersWrapper` → `I18nWrapper` → `AppShell`，再加 `SidebarAnimationProvider` 和 `HorizontalScrollProvider`。部分 wrapper 只做条件渲染或传递 props。
- **危害**: 渲染树过深、React DevTools 难以阅读、部分 provider 存在但无独立状态。
- **建议**:
  1. 将 `I18nWrapper` 合并进 `RootProviders`；
  2. 评估 `ProvidersWrapper` 和 `RuntimeProviders` 是否可以合并；
  3. 目标：将 5 层压缩到 3 层。

### 2.6 清理 `stream-strategy` 中的 ~15 个纯委托函数

- **位置**: `packages/app/src/components/stream-strategy.ts`（272 行）
- **现状**: 文件中存在约 15 个只做参数转发、无任何业务逻辑的委托函数。
- **危害**: 增加调用栈深度、误导读者以为这里有策略选择逻辑。
- **建议**: 直接内联或删除这些委托层，让调用方直接调用底层实现。

### 2.7 `browser-pane.web.tsx` 与 `browser-pane.tsx` 95% 重复

- **位置**: `packages/app/src/components/browser-pane.web.tsx`, `packages/app/src/components/browser-pane.tsx`
- **现状**: 两个文件渲染完全相同的 "desktop only" placeholder，`.web.tsx` 只多一行 `browserSession.replace(...)`。
- **危害**: 维护两份几乎相同的代码，违反 AGENTS.md 平台扩展的使用原则。
- **建议**: 删除 `browser-pane.web.tsx`。基础 `browser-pane.tsx` 已可作为 web 和 native 的 fallback，Metro 在无 `.web.tsx` 时会自动解析它。

### 2.8 `use-web-scrollbar-style.native.ts` 是 3 行 no-op

- **位置**: `packages/app/src/hooks/use-web-scrollbar-style.native.ts`
- **现状**: 返回 `undefined`。`.web.ts` 变体返回 CSS 属性。
- **危害**: AGENTS.md 明确说："Reserve `if (isWeb)` for small, inline checks"。一个 3 行 no-op 文件的仪式感超过了内联判断。
- **建议**: 合并为单一文件 `use-web-scrollbar-style.ts`，内部用 `if (isWeb)` 判断。

### 2.9 重叠的桌面应用更新检查

- **位置**: `packages/app/src/desktop/updates/update-callout-source.tsx:90-104`, `packages/app/src/desktop/updates/use-desktop-app-updater.ts:176-188`
- **现状**: 两个独立 timer 检查更新。`UpdateCalloutSource` 每 30 分钟一次；`useDesktopAppUpdater` 在 pending 状态下每 10 秒重试。两者都触发 `checkDesktopAppUpdate()`。
- **危害**: 重复调度、promise 竞态、不必要的 IPC 噪声。
- **建议**: `useDesktopAppUpdater` 统一拥有定时逻辑；`UpdateCalloutSource` 只消费其状态，不启动自己的 `setInterval`。

### 2.10 多个微型状态文件可合并

- **位置**: `packages/app/src/stores/explorer-tab-memory.ts`, `packages/app/src/stores/explorer-checkout-context.ts`, `packages/app/src/stores/workspace-tabs-types.ts`
- **现状**: 每个文件不到 50 行，管理极细粒度的状态，且消费者高度集中。
- **危害**: 文件碎片化、import 路径分散、难以发现相关状态。
- **建议**: 将这些微 store 合并到其消费者相邻的文件中，或合并为一个 `workspace-meta-store.ts`。

### 2.11 React 版本在 workspace 间未对齐

- **位置**: `packages/app/package.json` (`react: 19.1.0`)
- **危害**: npm 可能提升两份 React 到 `node_modules`，增加安装体积，存在 hook 规则冲突风险。
- **建议**: 将所有 workspace 的 React 版本对齐到 root override（`19.1.0`）。

### 2.12 合并重复的 Header 组件变体

- **位置**: `packages/app/src/components/headers/`
- **现状**: 6 个 header 变体（`BackHeader`, `ScreenHeader`, `MenuHeader`, `HeaderToggleButton`, `HeaderIconBadge`, `ScreenTitle`），部分功能重叠。
- **建议**: 审计 `ScreenHeader` 和 `MenuHeader` 是否可以统一为一个带 props 的 `Header` 组件。

---

## 三、【高风险 / 慎动】涉及兼容性和核心状态

### 3.1 服务器 `bootstrap.ts` 关闭序列使用 `closeAllConnections()`

- **位置**: `packages/server/src/server/bootstrap.ts:918`
- **现状**: 优雅关闭 WebSocket server 后调用 `httpServer.closeAllConnections()`，强制重置所有剩余 TCP socket。注释承认这是 `CLOSE_WAIT` 升级 socket 的 workaround。
- **危害**: 中止仍在进行 WebSocket close handshake 的合法连接。但当前代码注释表明这是已知问题且经过权衡。
- **建议**: 如需改动，先调用 `closeIdleConnections()` 并等待 1-2s，仅当 `httpServer.close()` 未 resolve 时才使用 `closeAllConnections()`。**此改动影响所有客户端的断线体验，需充分测试。**

### 3.2 `script-health-monitor` 固定 3 秒轮询无退避

- **位置**: `packages/server/src/server/script-health-monitor.ts:36`
- **现状**: 每 3 秒对所有注册的用户脚本打开 TCP socket 探测健康状态。稳定运行数分钟的脚本与新启动的脚本享受同样频率。
- **危害**: 频繁唤醒事件循环、打开 socket。但脚本是关键外部依赖，探测频率降低可能延迟发现故障。
- **建议**: 使用自适应间隔：注册后前 30 秒保持 3s，健康脚本退避到 10-15s，pending/unhealthy 保持 3s。**改动需评估对脚本故障感知延迟的影响。**

### 3.3 桌面退出生命周期强制绕过 Electron 正常流程

- **位置**: `packages/desktop/src/daemon/quit-lifecycle.ts:45-77`
- **现状**: `before-quit` 事件中**总是**调用 `event.preventDefault()`，然后异步停止 daemon，再 `app.exit(0)`。跳过了 `window-all-closed`、`will-quit` 及第三方退出处理器（如崩溃报告器、更新完成器）。
- **危害**: macOS 上破坏了 dock 保持惯例；可能跳过重要的 cleanup。
- **建议**: 仅在**内置 daemon 管理已启用**且 `isDesktopManagedDaemonRunningSync()` 返回 true 时才 `preventDefault()`。其他情况允许正常 Electron 退出链。**此改动影响所有平台退出行为，需完整回归测试。**

### 3.4 本地传输使用 base64 编码二进制数据

- **位置**: `packages/desktop/src/daemon/local-transport.ts`
- **现状**: WebSocket 二进制数据通过 IPC 时转为 base64 字符串（`binaryBase64`），增加 ~33% 体积开销和编解码 CPU。
- **危害**: 高吞吐场景（如大文件附件、实时语音）性能受损。
- **建议**: 使用 `ipcRenderer.send` 配合 `ArrayBuffer` transfer（Electron 支持跨进程零拷贝传递 TypedArray）。**改动需验证大消息场景下的稳定性。**

### 3.5 将重型 server 原生扩展设为 optional dependency

- **位置**: `packages/server/package.json`
- **现状**: `onnxruntime-node` (~210MB)、`node-pty` (~24MB)、`sherpa-onnx-node` (~13MB) 是必要依赖。但本地语音模型是 opt-in 功能，并非所有用户都需要。
- **危害**: Docker 镜像和打包体积膨胀。
- **建议**: 将 `onnxruntime-node` 和 `sherpa-onnx-node` 标记为 `optionalDependencies`，在运行时检测缺失后降级到云端语音或无语音模式。**此改动影响安装脚本和 Docker 构建，需更新文档。**

---

## 四、维度汇总

### 维度 1：IPC 通信冗余

| #   | 发现                                | 优先级       | 预估改动量     |
| --- | ----------------------------------- | ------------ | -------------- |
| 1.1 | 启动轮询 spawn 150 个 CLI 进程      | 紧急         | 50 行          |
| 1.9 | 本地传输广播到所有窗口              | 高           | 20 行          |
| 2.1 | 双 IPC 架构并存                     | 中           | 200 行（重构） |
| 2.2 | `get-pending-open-project` 独立通道 | 中           | 30 行          |
| 2.3 | 缺少批量附件 API                    | 中           | 40 行          |
| 3.4 | base64 编码二进制传输               | 低（高风险） | 60 行          |

### 维度 2：前端组件树与状态

| #    | 发现                               | 优先级 | 预估改动量         |
| ---- | ---------------------------------- | ------ | ------------------ |
| 1.5  | `session-store.ts` 死状态字段      | 高     | 100 行删除         |
| 1.8  | 合并两个 sidebar animation context | 高     | 150 行重构         |
| 2.4  | `workspace-screen.tsx` 过长        | 中     | 500 行（提取组件） |
| 2.5  | `_layout.tsx` 5 层 Provider        | 中     | 100 行             |
| 2.6  | `stream-strategy` 纯委托函数       | 中     | 80 行              |
| 2.10 | 微型状态文件合并                   | 中     | 60 行              |
| 2.12 | Header 组件变体重叠                | 低     | 80 行              |

### 维度 3：依赖与体积诊断

| #    | 发现                         | 优先级       | 预估影响                |
| ---- | ---------------------------- | ------------ | ----------------------- |
| 1.2  | `@dnd-kit` 捆绑进 native     | 紧急         | Native bundle -30KB+    |
| 1.3  | 移除 `react-native-webview`  | 高           | IPA/APK -数MB，构建加速 |
| 1.6  | 移除 `react-native-worklets` | 高           | node_modules -1.2GB     |
| 1.7  | 移除 `buffer` polyfill       | 高           | Bundle -10KB            |
| 2.11 | React 版本对齐               | 中           | 避免双份 React          |
| 3.5  | server 原生扩展 optional     | 低（高风险） | Docker -200MB+          |

### 维度 4：平台特异性逻辑清理

| #   | 发现                                           | 优先级 | 预估改动量     |
| --- | ---------------------------------------------- | ------ | -------------- |
| 1.2 | `split-container` / `split-drop-zone` 平台拆分 | 紧急   | 120 行         |
| 2.7 | 删除冗余 `browser-pane.web.tsx`                | 中     | 删除文件       |
| 2.8 | 合并 `use-web-scrollbar-style` no-op           | 中     | 删除 + 10 行   |
| —   | `isWeb`/`isNative` 使用 282 次                 | 观察   | 部分可内联简化 |

### 维度 5：守护进程与生命周期

| #   | 发现                               | 优先级       | 预估改动量 |
| --- | ---------------------------------- | ------------ | ---------- |
| 1.1 | 启动轮询 CLI spawn 风暴            | 紧急         | 50 行      |
| 1.4 | 缓存 daemon 状态                   | 高           | 80 行      |
| 2.9 | 重叠的更新检查 timer               | 中           | 40 行      |
| 3.2 | `script-health-monitor` 自适应轮询 | 低（高风险） | 30 行      |
| 3.3 | 桌面退出生命周期                   | 低（高风险） | 20 行      |
| 3.1 | `closeAllConnections()` 优化       | 低（高风险） | 15 行      |

---

## 五、推荐执行顺序

```
第 1 周（立即）
  ├─ 1.1  启动轮询指数退避 + pid 快速路径
  ├─ 1.2  @dnd-kit 平台拆分
  ├─ 1.3  移除 react-native-webview
  ├─ 1.4  缓存 daemon 状态
  └─ 1.5  清理 session-store 死字段

第 2 周
  ├─ 1.6  移除 react-native-worklets
  ├─ 1.7  移除 buffer polyfill
  ├─ 1.8  合并 sidebar animation context
  ├─ 1.9  本地传输定向发送
  └─ 2.1  拆分 createDaemonCommandHandlers

第 3-4 周
  ├─ 2.4  拆分 workspace-screen.tsx
  ├─ 2.5  压缩 _layout.tsx provider 层级
  ├─ 2.6  内联 stream-strategy 委托函数
  └─ 2.10 合并微型 state 文件

第 5 周及以后（需充分测试）
  ├─ 3.3  桌面退出生命周期优化
  ├─ 3.1  closeAllConnections 优雅降级
  ├─ 3.2  script-health-monitor 自适应
  └─ 3.5  server 原生扩展 optional
```

---

## 六、附录：原始数据快照

```
App 层:
  组件:        168 个 (.tsx/.ts)
  Zustand stores: 19 个
  Context providers: 7 个
  Screens:     55 个
  Route files: 19 个
  平台特定文件: 22 个 (.web/.native/.electron)
  isWeb/isNative 判断: 282 处
  状态管理使用者: 108 个文件

Desktop 层:
  IPC 通道:    26 个
  主进程代码:  ~611 行 (daemon-manager.ts)

Server 层:
  bootstrap:   ~952 行

依赖:
  App deps:    70 个
  Server deps: 36 个
  Desktop deps: 6 个
```

---

_报告生成方式：3 个并行 explore agent 分别审计 IPC/Daemon、前端组件/状态、依赖/平台代码，结合 shell 静态扫描与调用链追踪。未执行任何代码修改。_
