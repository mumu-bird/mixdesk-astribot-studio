# MIXDESK 0.7 验证记录

日期：2026-10-20。测试浏览器为本机 Google Chrome，生产构建由 Vite 生成，页面只访问 `127.0.0.1`。

## 采样器

`npm test -- tests/sampler.spec.js --reporter=line`：19 项通过（41.2 秒）。

覆盖内容包括：

- WAV 自定义采样导入、名称/入出点/增益/BPM 编辑、单次/循环/按住模式和全局音量；
- 按住采样的鼠标移出、指针取消、键盘松开、窗口失焦和页面隐藏释放；
- MIX 消息的采样按下/松开、重叠按键和 MIDI 断开清理；
- 来源台固定拍网格上的量化启动、BPM 速度匹配及取消；
- 速度匹配时采样 Key Lock 保持 440 Hz 音高；
- 当前 Deck 普通循环复制到对应采样槽；
- AudioContext `resume()` 尚未完成时释放按键不会迟到启动；
- 每槽四层同时启动、独立增益的实际音频频谱、混合触发模式与多键松开；
- `.mxpack` v3 各层音频/设置往返，兼容 v1/v2，空层删除与无 File 的 AudioBuffer 持久化；
- 损坏包、运行时替换失败及事务在暂存后中止，均保留旧槽对象、旧音源与存储；
- 部分层启动失败会清理已建音源与处理器，并支持重新触发；
- 无效裁剪和 IndexedDB 写入失败保留旧采样；
- 390px 视口下采样器和编辑器无横向溢出。

测试使用合成音频与真实构造的 WAV 文件，证明这些软件状态和浏览器音频路径成立；不代表 DJUCED 原生采样包兼容、原版算法相同、持续同步已实现，也不代表真实 Hercules 设备已连接验证。

## 自动首拍初值与动态拍网格

`npm test -- tests/workstation.spec.js --reporter=line`：9 项通过。导入测试音频会生成 `gridEstimated` 标记；稳定 120 BPM 脉冲的首拍估算落在起始 30ms 内。额外的动态网格测试在 12 秒处从 120 BPM 切换到 150 BPM，生成至少两个网格段，并验证后段 BPM。实现使用 8 秒窗口 / 4 秒步长的本地自相关启发式；变拍边界、下拍判断和 DJUCED 原版算法仍需手动校正与 A/B 验证。

## 会话设置

`npm test -- tests/performance.spec.js --reporter=line`：26 项通过。测试写入并刷新后恢复总音量、交叉推子、通道音量/EQ/滤波、交叉分配和 FX 类型/干湿比/启用状态；保存使用单独的 IndexedDB `session:mixer` 记录，播放进度和输出设备选择不写入。新增检查覆盖两组共享三槽 Rack 的独立分配、同时串联、每台隔离音频通道、Rack 编辑状态迁移和关闭延迟效果后的尾音，四个 Filter FX 预选槽在各通道和设置面板间同步、旁路和刷新恢复，三段 EQ 独立 Kill 的音频静音与恢复，DJUCED 速度范围和 −100% 停止运输，以及默认频段控制的样本级干声透明、反向搓盘音粒、14 位 MIDI 小数精度、普通 Jog 临时弯音、Scratch 模式、后交叉推子 FX 路由、Fader Start 和对应灯光反馈。

## 调性初值

本地调性分析在无有效标签时才运行，结果以 `keyEstimated` 和曲库中的“≈”标记保存；带有效 `TKEY` 标签的文件保持原值。该实现使用首段频率能量与固定大小调/小调轮廓，适合辅助浏览，不代表 DJUCED 的专有模型、置信度或听感一致。

## Hot Cue 名称与颜色

`npm test -- tests/pads.spec.js --reporter=line`：11 项通过。双击已设置的 Hot Cue 可保存名称和颜色，刷新后恢复，清除标记会同时清理元数据；旧的只含时间点的标记自动使用空名称和播放器默认颜色。

## MP3 导出

`npm test -- tests/recording.spec.js --reporter=line`：10 项通过。原生 WAV 可在 Worker 中由本地 `lamejs` 浏览器 bundle 编码为 192 kbps MP3，Chrome 能重新解码并验证时长；最近录音和持久化 WAV 缓存都走同一导出路径。未对照 DJUCED 编码器标签或长录音性能。

## Rekordbox XML

`npm test -- tests/library.spec.js -g "Rekordbox XML" --reporter=line`：3 项通过。导出使用标准 `TRACK/@Location`、`TEMPO`、`POSITION_MARK` 和播放列表引用，携带 BPM、Cue、Hot Cue、颜色与保存循环；导入测试覆盖嵌套播放列表和标准 Location 属性，外部路径不被请求。另有 Serato `.crate` 样本测试，验证有界 UTF‑16BE 路径解析、未匹配提示和零外部请求；未覆盖 Rekordbox 全部扩展标签、智能播放列表语义或 Serato 的全部私有记录。

## Stems 分轨控制

`npm test -- tests/performance.spec.js -g "stems controls" --reporter=line`：1 项通过。播放中的主输出可由四组本地频段通道独立静音/恢复，独奏状态只保留目标通道，增益和独奏状态刷新后恢复。该验证覆盖路由和会话状态，不证明源分离质量；当前实现不是 DJUCED 的 AI Stems 模型。

默认路径还通过样本级透明检查：未改变任何频段控制时，输出与输入的最大样本误差低于 `1e-6`；改动控制后才切换到本地滤波器组。

## 构建与生产冒烟

`npm test -- --reporter=line`：102 项通过（3.8 分钟）。本轮多层采样修改之后 `npm run build` 成功；生产冒烟 `node scripts/smoke-sampler.mjs`、`node scripts/smoke-recording.mjs`、`node scripts/smoke-library.mjs` 均通过，覆盖采样器、24 位 WAV 录音、曲库持久化、窄屏溢出与无外网请求。本轮没有插入 DJControl MIX，因此 USB/MIDI 物理通信仍标记为待验。
