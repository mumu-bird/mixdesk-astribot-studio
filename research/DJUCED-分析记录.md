# DJUCED 本地分析与 MIXDESK 实现说明

> 本文保留首次静态分析和 0.1 版范围，并单列后续 REA 与采样包分析。当前实现及尚未完成项以 [功能对照与验收](DJUCED-功能对照与验收.md) 为准；初版表格不代表现有版本。

分析日期：2026-10-19。对象：`/Applications/DJUCED/DJUCED.app`。

## 已确认的事实

| 项目 | 本地证据 |
| --- | --- |
| 版本 | `6.6.1 build 0ba386762 64bit MAC`，来自 `Contents/Info.plist` |
| 架构 | 原生 Mach-O，包含 arm64、x86_64 两个架构 |
| 主程序大小 | 887,591,904 字节，约 846.5 MiB |
| 界面依赖 | Qt 6.3.2：Widgets、Gui、Qml、Charts、OpenGL、Network、Sql 等 |
| 音频依赖 | BASS、BASSmix、BASSenc、BASS FX、MP3 编码插件；CoreAudio、CoreMIDI 等系统库 |
| 其他依赖 | OpenCV 4.9.0、两个 NNPredictionDispatcher 动态库；链接关系本身不能证明具体模型用途 |
| 可读控制器配置 | 31 个 `.djm` XML 文件，7,152 条 map 元素，149 种 action 名称 |
| 可读符号 | arm64 全局符号输出有 26,215 行，包括导入符号、数据符号和函数符号；不能等同于函数总数 |
| 包内文件 | 280 个普通文件，排除符号链接，保留目录清单 |

主程序 SHA-256：`a8860c525115bc3e510f9f3f167e969bc54d6bbdd8776ca3ffbfed4b1a2a7554`。

## 能追踪的功能线索

以下名称在符号表或控制器映射中直接出现。它们证明存在相应接口，不代表已经还原函数体或验证完整运行行为。

| 功能 | 证据示例 | 当前认识 |
| --- | --- | --- |
| 播放及音频流 | `dj::audio::BassStream`、`BASS_ChannelPlay`、`BASS_ChannelSetPosition` | 音频流和播放控制可以继续沿符号分析 |
| 节拍及主时钟 | `dj::TempoClock::getBeatProgress()`、`setBeatSource()`、`setAbletonLinkBPM()` | 节拍进度、主源选择、Ableton Link 存在接口线索；未恢复算法 |
| BPM 与恒定音高 | `BassStream::setEditBPM()`、`BassStream::setKeylock(bool)` | 原程序存在相关接口；网页版目前只实现变速变调 |
| 波形 | `WaveformReaderThread::computeFft()`、`getStemsFft()`、`setZoomLevel()` | 原程序存在 FFT、分轨波形和缩放功能；网页波形为独立的振幅峰值预览 |
| 分轨 | `StemsManager::setActiveStems()`、`getOutputBuffer()`、`cancelExtraction()` | 存在分轨管理接口；未定位完整模型及推理过程 |
| Cue、循环、混音 | `.djm` 中的 `hot_cue`、`delete_cue`、`loop`、`pitch`、`bass`、`medium`、`high`、`sync` | 可用来理解产品功能及控制器动作语义 |

### REA 采样页证据

后续对安装包 arm64 主程序做了只读 REA/Ghidra 伪代码分析，证据保存在 `research/evidence/rea/`。结果只能用于行为兼容，不能当作 DJUCED 原始源码：

- `BassStream::playSample(int)` 将 1–4 映射到四个 `BassSample3` 实例；`stopAllSamples()` 也只遍历四个实例。
- `getSamplerPageInfo()` 读取页数与当前页，`setCurrentSamplerNumberOfPages(int)` 将页数下限设为 1，并在缩小页数时修正当前页。
- `setNextSamplePage()` 将当前页加一，超过末页时回到 0；`setCurrentSamplerPageNumber(control_value)` 支持绝对页和相对增减，并把结果夹在有效范围内。
- 原版 Inpulse 映射把 `set_next_sampler_page` 绑定到通道 3/4 的采样模式键；`DJControl_Mix.djm` 只声明每台四个采样键，没有该翻页键。

### DJUCED `.djs` 采样包

安装包 `Contents/Resources/Demo/LOOPMASTER_ShotsAndBeats/default.djs` 和 `LOOPMASTER_Trance/default.djs` 是 XML 描述文件。每个 `sampler` 用 `idx` 标出组，每个 `sample` 用 `idx` 标出四个槽位之一，`type="0"` 为循环，已见 `type="1"` 为单次；音频文件名、标题和 BPM 存在单独属性。包级 `quant` 与可选 `quant-enabled` 提供量化设置。

MIXDESK 支持将一个 `.djs` 与对应本地音频同时选择后导入：按 4×4 位置加载、先解码后使用真实时长初始化循环范围，保留名称、触发模式、BPM 和量化设置。导入缺文件、损坏音频或超过 30 秒 / 30 MB 时保留原采样与播放。没有把原版演示音频、封面或其他素材加入交付物，测试使用合成 WAV；没有声称兼容包中所有元数据。

## 分析方法及阶段

首次检查使用 macOS 自带 `file`、`otool`、`nm`、`c++filt` 与 Python 读取应用包、链接依赖、符号表和 XML。当时没有执行 DJUCED，没有写入原应用包，没有读取用户的 DJUCED 曲库、账户或个人配置。

首次检查时没有可直接调用的 REA、Ghidra、Hopper 或 IDA，因此初版只做符号与配置分析。后续已在研究目录准备 REA/Ghidra 并提取采样相关函数伪代码，也进行了原版界面运行时观察，见上述证据及 [界面观察](DJUCED-界面观察.md)。这些结果用于独立实现行为兼容，不能当作恢复出的 DJUCED 原始工程。

复查入口：

- `inspect_djuced.py`：可重复执行的只读检查脚本。
- `evidence/inventory.json`：应用标识、哈希、文件清单、控制器与 action 统计。
- `evidence/dependencies-arm64.txt`：arm64 动态依赖的原始输出。
- `evidence/audio-symbols-arm64.txt`：筛选出的 765 行音频相关符号。
- `evidence/controller-mappings.csv`：控制器文件、控件名称、action 和原始表达式。仅作为研究证据；网页程序不加载这个文件。

## MIXDESK 网页版初版实现范围（历史）

MIXDESK 使用独立编写的 JavaScript、CSS 和 Web Audio API。未移植 DJUCED 的二进制、动态库、图片、字体、演示音乐或函数代码。两首试听音频由程序合成。

音频路径：音源 → 三段均衡器 → 滤波器 → 单台音量 → 交叉推子增益 → 总音量 → 动态压缩 → 扬声器及录音。

| 已实现 | 具体行为 |
| --- | --- |
| 双台播放 | 分别加载、播放、暂停、跳转音频，显示播放时间和剩余时间 |
| 本地音乐库 | 文件选择与拖放导入、搜索、删除、IndexedDB 缓存；文件不上传 |
| 波形 | 可点击定位的振幅峰值预览；不是 DJUCED 原版多频段 FFT 波形 |
| Tempo | ±50% 速度调节；同时改变音高 |
| BPM | 起音包络自相关估算、手动校正并保存；对弱节拍、变拍或复杂音乐可能误判半速/倍速 |
| SYNC | 匹配另一台的速度；不会自动寻找首拍或校准相位 |
| Cue | 主 Cue 与每台 4 个 Hot Cue，Shift 点击清除；当前加载会话内保存 |
| 循环 | 0.25–32 拍，按曲目起点和原始 BPM 计算；未自动定位真实首拍 |
| 混音 | 三段 EQ、低通/高通滤波器、独立音量、等功率交叉推子、总音量、电平显示 |
| 录音 | 捕获混音输出并下载，通常为 WebM/Opus；支持的浏览器可回退为 M4A；最长 30 分钟 |

暂未实现：恒定音高时间拉伸、可靠首拍与拍网格分析、自动相位同步、人声/鼓/贝斯分离、独立耳机预听、MIDI 控制器接入、采样器、专业音频设备路由及插件系统。浏览器版本的延迟和后台播放表现仍取决于浏览器与声卡。

## 验证方法

使用本机 Chrome 和 Playwright 检查实际 AudioContext 时间、输出采样 RMS、循环区间、同步速度、真实 WAV 导入与 BPM 校正、IndexedDB 持久化、录制后音频解码，以及桌面/窄屏页面布局。截图保存在 `screenshots/`。这是自动化验证，不等同于专业声卡的实测延迟或听感评测。

## 2026-10-20：采样器结构纠正与 0.8 实现

此前“全局十六槽、每槽四层同时播放”的结构不符合原版。本次使用已有 REA 会话和新查到的函数体修正，不将旧测试视为原版依据。旧实现与测试已归档到 `archive/sampler-v0.7/`。

- `sampler-load-pack` → `sampler-load-pack-in-slot` → `sample-open-list` → `sample-open`：每个 BassStream 的四个采样实例分别持有四个可选样本。每个 .djs 包包含的是同台四组。
- `sample-get-loop`、`sample-set-loop`、`sample-open-file`、`sample-stop-if-hold`：0/1 重触发、2/3 按住、4/5 开关；偶数循环，奇数单次。`sampler-play` 的组播放/停止是独立操作。
- `performance-set-sampler-page` 视图函数将页数限制为 1–4；两页时每组取两格，四页时每组取一格，三页时按整数除法每组显示前三格中的当前一格。当前实现提供 1/2/3/4 页布局。
- `djs-pack-metadata`：quant-enabled 用整数解析，失败时由 quant > 0 决定。
- 新查询 `0x100eae328 getDJSSampleListFromXML`，证据 `ev_03df5c6e19570baae577d30a020bea09dc76d522643e4cf94f351a62b726214b`，保存为 `evidence/rea/djs-sample-list.json` 和 .pseudo.c。样本 type 使用无 ok 输出的整数解析，失败取 0；该函数未以包级 defaultSampleType 替代每个样本的 type。包级默认类型另存到流状态，后续载入文件时的应用已在下节追踪。
- 原版 DJControl_Mix.djm：SAMPLE1_A…4_A 使用 chann=3001…3004，B 使用 4001…4004。采样输入是 sample_load_play；SAMPLE*_PLAY 只有 output。软件映射已接入 C/D 采样台各组第一个样本，Shift 停止组，灯光由组状态输出。未连接真机，不声称 USB 或灯光实测通过。

0.8 独立实现：每台四组，每组四个可选样本；组音量/台音量、六类型、组内分页。Web Audio 的 Gain 自动化在拍点切换，旧节点在边界之后释放；等待中的按住采样取消后撤销旧声道的静音计划。量化音频用合成 440/880 Hz 信号检查。此实现仍未证明与原版的所有样本相位、缓冲渐变和 Key Lock 时延一致。

持久化改为 `sampler:v4:deck:*`；首次迁移保留全部旧键和 `sampler:v4:legacy-backup`。旧叠加层转为同组可选样本，声音文件不丢弃，旧 loop 开关语义转为 toggle-loop。.mxpack v4 保存四台 64 个样本；导入旧包另外保留其原文件。事务只在提交后替换运行时，失败不改原音源。

### 后续默认类型证据

同一 REA 会话继续读取：

- `0x10012eda0 setDefaultSampleType`：写入流字段 +0x188718，发送属性 0x98；证据 `ev_02f7c3fc4f9da3a35b6581cde9343ff9da31b51110909664f544027886a1a39a`。
- `0x1000998c0 loadSample(int,int,QString)`：载入指定新文件后，调用 changeSampleType，参数来自上述 +0x188718；证据 `ev_edb7b1e6fa4592d7e092af3c8d057fe27177fd553eddccca3f95208cac615e13`。这证明默认类型应用于后来单独载入的文件，不是强制改写包里各格已有类型。
- `0x100087618 BassStream 构造函数`：param_1 为 8 字节指针，字段 `param_1 + 0x310e3` 对应偏移 +0x188718，初始化为 0（循环重触发）；证据 `ev_31350ae35d35c2d8db0122c2c5f41aa65d90808d0f0ad7dd745451f6661f3564`。这是构造默认值，不证明之后没有用户设置覆盖。

完整 JSON 与便于阅读的伪代码保存为 sampler-default-type、sampler-load-file、sampler-stream-constructor。

默认类型设置现已接入 0.8：新台默认循环重触发，DJS 可更新当前台默认值；包内样本仍保留各自类型。UI 提供“新载入模式”，按台持久化并随 v4 包保存。原创演示样本保持其明确配置的单次模式。

## 2026-10-20：0.8.1 采样包导出

本轮继续追踪 PackThread/LibarchiveUtil，确认外部 .djz 使用 7-Zip 容器，根目录为 default.djs 和音频。独立实现当前台导出：保留索引、六类型、BPM、量化与默认类型；裁剪/样本增益写入 16 位 WAV，后台压缩、取消、削波计数均可用。组/台音量、同步与 Key Lock 等非便携设置明确告知不包含，完整备份继续用 .mxpack。

新增五项独立解包与实际 PCM 验证；固定源码完整回归 120/120 通过。最终版本另检查生产下载和移动弹窗。原版通过文档打开事件进入解包流程，但进度 100% 后输出目录为空，系统 libarchive 写入的对照包也相同；未声称原版自动安装或播放验收通过。界面标为实验功能。

证据 ID、文件布局、实现取舍和原版未通过项详见 [DJZ-EXPORT.md](DJZ-EXPORT.md)。.djz 直接导入、原版元数据完整保存、DSP A/B 等仍是缺口，完整目标保持未完成。

## 2026-10-20：0.8.2 原版采样包互通修复

0.8.1 的自动安装失败已定位并解决。REA 继续追踪归档库，确认原版默认 BZip2（方法 040202、级别 6），明确不支持 LZMA1/2 和 Delta。7z-wasm 默认不仅用了 LZMA2，还会给 WAV 添加 Delta；上一轮系统 libarchive 对照包也用了 LZMA1，因此两份失败不能证明原版导入流程本身不可用。

0.8.2 使用纯 BZip2，关闭自动过滤和压缩文件头。网页实际导出包已经由 DJUCED 6.6.1 自动安装并载入，原版显示正确标题、120 BPM、六个非连续样本及类型图标；原版安装的描述文件与六段 PCM 数据全部一致。原版会写入 WAV 标签，故比较音频帧而非要求整个文件字节不变。

同时补上包 BPM：导出可编辑；DJS 导入的包速度独立保存，随刷新和 .mxpack 保留，不改变当前实时播放。37 项采样和导出专项通过；最终构建/生产冒烟通过。依据和复现工具见 [DJZ-EXPORT.md](DJZ-EXPORT.md)。尚未实现 .djz 直接导入，也未完成原版音频 DSP/时延 A/B，目标继续保持未完成。

## 2026-10-20：0.8.3 直接导入 DJUCED 采样包

复用 REA 静态证据 `unpack-finished.json`：原版解包成功后读取根目录 default.djs 并发送载入动作。已实现 .djz 单文件导入当前采样台、完整包内路径匹配、阶段状态、取消、解包限额与原子存储。独立 libarchive 包、真实异常归档、取消与事务回滚测试见 [DJZ-IMPORT.md](DJZ-IMPORT.md)。这补齐了上文 0.8.2 的直接导入缺口；完整元数据、原版 DSP A/B、路由、Stems、Link、VJ、SmartMix 和真机验收仍待完成。
