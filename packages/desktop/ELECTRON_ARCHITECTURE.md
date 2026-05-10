# Electron 架构特征提取报告

> 用于 Tauri v2 迁移参考。以下均为客观代码事实，不含迁移建议。

---

## 1. 前端栈与构建工具

| 维度             | 事实                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **前端框架**     | React 19.1.0 + React Native 0.81.5（跨平台统一代码库）                                                                                        |
| **路由**         | Expo Router ~6.0.13（文件系统路由）                                                                                                           |
| **Web 渲染层**   | `react-native-web` ~0.21.0 将 RN 组件渲染为 DOM                                                                                               |
| **构建工具**     | **Metro**（Expo 自带），非 Vite/Webpack                                                                                                       |
| **Web 构建命令** | `expo export --platform web`，输出 `packages/app/dist`                                                                                        |
| **桌面加载方式** | Dev 环境加载 Expo dev server (`localhost:8081`)；生产环境通过自定义 `paseo://` 协议加载静态资源                                               |
| **平台隔离机制** | Metro 文件后缀：`.electron.tsx` > `.web.tsx` > `.native.tsx`。Electron 桌面通过 `PASEO_WEB_PLATFORM=electron` 环境变量解析 `.electron.*` 文件 |

---

## 2. Node.js 模块使用清单

**桌面主进程 (`packages/desktop/src`) 使用的内置模块：**

| 模块                           | 用途                                             |
| ------------------------------ | ------------------------------------------------ |
| `node:fs` / `node:fs/promises` | 文件读写（附件、设置、日志、扩展安装、菜单图标） |
| `node:path`                    | 路径拼接（资源定位、preload 路径、userData）     |
| `node:os`                      | 平台判断、登录 Shell 环境继承                    |
| `node:child_process`           | 启动/停止 Paseo daemon 子进程、`spawn`/`exec`    |
| `node:crypto`                  | 设置文件校验、自动更新哈希验证                   |
| `node:url`                     | 协议 URL 解析、自定义 scheme 处理                |
| `node:module`                  | 运行时模块路径解析                               |

**后台服务 (`packages/server/src`) 使用的额外内置模块（运行于独立 Node 子进程）：**

`net`, `http`, `stream` / `stream/promises` / `stream/web`, `buffer`, `util`, `events`, `readline`, `timers/promises`, `perf_hooks`

---

## 3. 原生与特殊依赖

| 依赖                                             | 类型                 | 说明                                                                    |
| ------------------------------------------------ | -------------------- | ----------------------------------------------------------------------- |
| **`node-pty`** (1.2.0-beta.11)                   | C++ 原生扩展 (.node) | 终端模拟，跨平台预构建二进制；Nix 构建时需 Python3 + libuv 重新编译     |
| **`onnxruntime-node`** (^1.23.0)                 | C++ 原生扩展 (.node) | ONNX 推理引擎，语音 TTS 使用；打包时需按平台裁剪                        |
| **`sherpa-onnx` / `sherpa-onnx-node`** (1.12.28) | 平台特定原生包       | 本地语音识别/合成；Nix 中故意不构建，懒加载并优雅降级                   |
| **`sharp`** (transitive)                         | C++ 原生扩展 (.node) | 来自 `@anthropic-ai/claude-agent-sdk` 的 optionalDependencies，图像处理 |
| **`koffi`** (^2.9.0, transitive)                 | FFI 绑定 (.node)     | 来自 `@mariozechner/pi-tui` 的依赖链，原生 FFI                          |
| **`@anthropic-ai/claude-agent-sdk`**             | 预置原生二进制       | 内置 `vendor/ripgrep/` 多平台 `rg` 可执行文件；打包时裁剪为当前平台     |
| **SQLite**                                       | ❌ 未使用            | 项目中无 `better-sqlite3`/`sqlite3`；`paseo.sqlite` 仅为 CLI 文件名参数 |

---

## 4. IPC 通道清单

### 4.1 直接 `ipcMain.handle` 通道

| 通道名                                       | 作用概括                                                 |
| -------------------------------------------- | -------------------------------------------------------- |
| `paseo:invoke`                               | **中央命令总线**，代理约 25 个桌面/守护进程/设置子命令   |
| `paseo:get-pending-open-project`             | 获取（并清除）通过 `--open-project` 传入的待打开项目路径 |
| `paseo:browser:set-workspace-active-browser` | 标记当前工作区中哪个内嵌浏览器 webview 处于活跃状态      |
| `paseo:browser:open-devtools`                | 为指定浏览器 webview 打开独立 DevTools 窗口              |
| `paseo:browser:clear-partition`              | 清除指定浏览器分区的 `session` 存储数据                  |
| `paseo:window:toggleMaximize`                | 切换发送者窗口的最大化/还原状态                          |
| `paseo:window:isFullscreen`                  | 返回窗口是否处于全屏模式                                 |
| `paseo:window:setBadgeCount`                 | 设置 macOS/Linux dock/应用徽标计数                       |
| `paseo:window:updateWindowControls`          | 动态更新 Windows 标题栏覆盖层颜色与高度                  |
| `paseo:dialog:ask`                           | 弹出原生消息框（OK/Cancel 确认）                         |
| `paseo:dialog:askWithCheckbox`               | 弹出带复选框的原生消息框                                 |
| `paseo:dialog:open`                          | 弹出文件/文件夹选择对话框（支持多选、过滤）              |
| `paseo:notification:isSupported`             | 查询系统是否支持原生通知                                 |
| `paseo:notification:send`                    | 发送原生系统通知，点击时聚焦窗口                         |
| `paseo:opener:openUrl`                       | 调用系统默认浏览器打开外部 URL                           |
| `paseo:menu:showContextMenu`                 | 在终端区域显示自定义上下文菜单                           |

### 4.2 `paseo:invoke` 内部子命令

| 子命令                                                                                | 作用                                                             |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `desktop_get_runtime_info`                                                            | 返回应用版本、ARM64 转译状态                                     |
| `desktop_daemon_status`                                                               | 查询守护进程运行状态                                             |
| `start_desktop_daemon`                                                                | 启动守护进程（独立 Node 子进程）                                 |
| `stop_desktop_daemon`                                                                 | 优雅终止守护进程（SIGTERM → SIGKILL）                            |
| `restart_desktop_daemon`                                                              | 重启守护进程                                                     |
| `desktop_daemon_logs`                                                                 | 尾部读取 `daemon.log`                                            |
| `desktop_daemon_pairing`                                                              | 生成配对 QR 码/URL                                               |
| `desktop_get_system_idle_time`                                                        | 获取系统空闲时间（`powerMonitor`）                               |
| `cli_daemon_status`                                                                   | 文本格式守护进程状态                                             |
| `write_attachment_base64` / `write_attachment_bytes`                                  | Base64/Buffer 写入附件到托管存储                                 |
| `copy_attachment_file`                                                                | 复制外部文件到托管附件目录                                       |
| `read_file_base64`                                                                    | 从托管存储读取文件为 Base64                                      |
| `delete_attachment_file`                                                              | 删除附件                                                         |
| `garbage_collect_attachment_files`                                                    | 清理无引用附件                                                   |
| `open_local_daemon_transport`                                                         | 打开到本地守护进程的 WebSocket（Unix Socket/Windows Named Pipe） |
| `send_local_daemon_transport_message`                                                 | 通过本地传输发送消息                                             |
| `close_local_daemon_transport`                                                        | 关闭本地传输连接                                                 |
| `check_app_update` / `install_app_update`                                             | 检查/安装自动更新                                                |
| `get_local_daemon_version`                                                            | 获取守护进程版本                                                 |
| `install_cli` / `get_cli_install_status`                                              | 安装/查询 CLI shim 状态                                          |
| `install_skills` / `get_skills_install_status`                                        | 同步/查询 bundled skills 安装状态                                |
| `get_desktop_settings` / `patch_desktop_settings` / `migrate_legacy_desktop_settings` | 桌面设置 CRUD 与迁移                                             |

### 4.3 事件通道（主进程 → 渲染进程，`webContents.send`）

| 事件名                                     | 作用                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| `paseo:event:local-daemon-transport-event` | 转发本地守护进程 WebSocket 的 open/message/error/close 事件 |
| `paseo:event:notification-click`           | 用户点击系统通知时触发                                      |
| `paseo:window:resized`                     | 窗口尺寸变化时推送给渲染进程                                |

---

## 5. 系统与窗口特性

| 特性                   | 使用状态             | 详细事实                                                                                                                                                              |
| ---------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **系统托盘 (Tray)**    | ❌ 未使用            | 无 `Tray` 实例                                                                                                                                                        |
| **全局快捷键**         | ❌ 未使用            | 无 `globalShortcut` 注册                                                                                                                                              |
| **剪贴板**             | ❌ 未直接调用        | 仅通过原生 Menu `role: "copy"` / `"paste"` 实现                                                                                                                       |
| **原生菜单 (Menu)**    | ✅ 完整应用菜单      | Edit、View（缩放/刷新/DevTools/全屏）、Window；macOS 含 App 菜单                                                                                                      |
| **上下文菜单**         | ✅ 三处              | ① webview 内（copy/paste/selectAll/Inspect）；② 主窗口默认（copy/paste/selectAll）；③ 终端区域（通过 IPC 动态构建）                                                   |
| **BrowserWindow 配置** | ✅ 自定义标题栏      | macOS: `titleBarStyle: "hidden"`, `trafficLightPosition: {x: 16, y: 14}`；Win/Linux: `frame: false`, `titleBarOverlay`（高 29px，自定义颜色）；`show: false` 延迟显示 |
| **`<webview>` 标签**   | ✅ 启用              | `webviewTag: true`；`will-attach-webview` 时强制 `sandbox: true`, `contextIsolation: true`, 删除 preload                                                              |
| **Dock / Badge**       | ✅ macOS 专属        | `app.dock.setIcon()` / `app.dock.setBadge()`；开发工作树名称显示为 badge                                                                                              |
| **单实例锁**           | ✅ 启用              | `app.requestSingleInstanceLock()`，第二实例参数透传给第一实例                                                                                                         |
| **自定义协议**         | ✅ `paseo://`        | 注册为 privileged scheme，生产环境用于加载本地 SPA 静态资源                                                                                                           |
| **通知**               | ✅ 原生 Notification | 含 macOS 静默探针通知（确保应用出现在系统通知设置中）                                                                                                                 |
| **自动更新**           | ✅ electron-updater  | 带发布通道（stable/beta）和分阶段推出控制                                                                                                                             |
| **Shell 环境继承**     | ✅ VS Code 方案      | 启动时模拟登录 Shell 以继承 PATH                                                                                                                                      |

---

## 6. 逻辑分布评估

**重后端（主进程）**。主进程不仅承担传统的窗口生命周期管理，还深度参与了核心业务：守护进程的启动/监控/停止、本地 WebSocket 桥接、文件附件托管、自动更新、设置持久化、CLI shim 安装、skills 同步等。渲染进程（React Native Web）主要扮演 UI 展示层角色，几乎所有需要系统能力或文件/网络的操作都通过 `window.paseoDesktop` 桥接委托给主进程执行。
