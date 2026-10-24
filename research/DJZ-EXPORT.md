# DJUCED 采样包导出：0.8.2

0.8.2 已通过本机 DJUCED 6.6.1 的自动解包和载入验证，六段合成音频的 PCM 与导出内容逐字节一致。尚未完成原版播放 DSP、同步和时延 A/B，也没有完成全功能复刻。

## 原版静态证据

目标：DJUCED 6.6.1 arm64，SHA-256 `3d833a5175d99f6324bad3bd370b97bf46f9e82dad7f886ac6f5b08a83ccf5d8`。复用 REA 会话；Ghidra 伪代码是分析产物，不是原始 C++ 源码或执行观察。

| 问题 | 函数与 Evidence ID | 观察 |
| --- | --- | --- |
| 容器格式 | `0x100ce34a0 LibarchiveUtil::compress`，`ev_fe736cded7c3cbdbcb548c5000b1b06155e19d66f6b9703b9b19bfca5df2636b` | 调用 archive_write_set_format_7zip |
| 原版默认压缩 | `0x100cdfb24 archive_write_set_format_7zip`，`ev_888427d3581c7e9359f166b4f45f37394c52f7890c2f215d803e2418cd88225d` | 默认方法 040202 = BZip2，级别 6 |
| 压缩选项 | `7zip-writer-options`，`ev_1bc29ca9d8ecbe25bdab91e32421c612e0ed88ed77d6de25cb3b00d7a00bed73` | 明确拒绝 LZMA1/2 |
| 解码限制 | `7zip-decompress-init`，`ev_f6e0d30360c9f2d534c3e452ac0d3a127593f028bb087e6ec4905c2fa3da38ba` | 方法 030101/21 返回 LZMA unsupported；BZip2 可初始化，过滤器只接受指定 BCJ 家族，Delta 03 不接受 |
| 文件布局 | `0x1006d1b34 PackThread::run`，`ev_526c46df9b8ff40429739f9e45a30d26e393e306fd53c65f1cb68e3c5988b7d9` | 根目录 default.djs、音频和可选封面；文件名冲突时重命名 |
| XML | `0x100eb00b0 saveDJSSamplePackToXML`，`ev_ab8245d713d03ff4f174e24241e1f2e1405ec440d8aec55b6e26364f9ff8d9ee` | pack → sampler idx → sample idx；空格省略而索引保留；BPM、类型、length、quant、quant-enabled、defaultSampleType 等 |
| 文件名属性 | `djs-file-attribute.json`，read_bytes 地址 1016b97c7 | 字节 66 69 6c 65 00，确认属性 file |
| 解包入口 | `0x1006ced90 UnpackThread::run`，`ev_fcc3fdfbe4081fa24f359c8a0b1a5ce2f01db85733a2858fddac5aecf6a16959` | 调用 LibarchiveUtil::extractUtf8 |
| 样本保存 | `0x10015efbc BassSample3::saveSample`，`ev_f3ed21f478169af870f2b52283c99886e33768eb0de359356ba05f015ee2e10b` | 该路径移动/更新样本文件；不构成原版裁剪与时间拉伸 DSP 的复原证明 |

完整记录和伪代码位于 `evidence/rea/`。

## 独立实现

- 导出指定采样台的四组、每组四格，允许空组。根目录为 default.djs 与 sample-组-格.wav，重复样本名称不会覆盖文件。
- UTF-8 标题、XML 属性转义；无效 XML 控制字符拒绝导出。保存索引、六类型、样本 BPM、量化及默认类型，不编造未知的封面/颜色/艺术家。
- 可编辑包 BPM，优先使用导入包速度，其次采用一致的样本 BPM、来源台速度，最后回退 120。DJS 导入速度存入 settings.packBpm，随 IndexedDB 和 .mxpack v4 保留；旧设置默认为 null。导出表单修改只应用于此次文件，不改变当前播放速度。
- 按输入采样率取最近采样帧来裁剪区间，样本增益写入 16 位单/双声道 WAV；保留采样率，削波计数可见，源缓冲区不修改。这是独立导出设计，不是原版 DSP 恢复证明。
- 组/台音量、速度匹配、Key Lock、分页及输出路由不写入 DJUCED 包。完整会话继续使用 .mxpack。
- 单个导出音频最多 30 MiB，总 PCM 最多 256 MiB，多于两声道拒绝。Worker 压缩可取消，超时/错误后释放 Worker 和 UI 忙状态。
- 参数：`-t7z -m0=BZip2 -mx=6 -mf=off -mhc=off -ms=off`。关闭自动 Delta 过滤及通常使用 LZMA 的压缩文件头；WASM 本地加载，许可及源码来源随产品保存。
- 0.8.3 已补齐 .djz 单文件直接导入，仍兼容 .djs 与对应音频多选，见 [直接导入验证](DJZ-IMPORT.md)。

## 验证

采样器与导出专项 **37/37 通过**，覆盖 sampler.spec.js、sampler-groups.spec.js、djz-export.spec.js；日志：`evidence/mixdesk-0.8.2-sampler-regression.log`。之前的全量 120 项是 0.8.1 结果，不当作 0.8.2 全量运行。

导出测试用系统 bsdtar/libarchive 独立解包，检查六类型、非连续索引、空格、重复名称、中文和特殊字符；逐点核对六段双声道正弦波的裁剪/增益，验证每声道 PCM、时长、削波计数和源数据不变。还覆盖空台、取消重试、手机、本地资源，以及包 BPM 导入、刷新、.mxpack 恢复、编辑导出和越界拒绝。

独立读取器 `tests/fixtures/sevenzip.js` 直接解析输出字节的文件头及 Folder coder 表，要求未使用 EncodedHeader，七个流都只有 BZip2（040202）。它能检测 LZMA/Delta 回归，不只检查代码里的命令参数。

最终生产构建由 `scripts/smoke-djz.mjs` 检查真实导入、裁剪、BPM 编辑、下载后独立解包/时长/压缩方法、桌面/手机弹窗和本地资产。日志：`evidence/mixdesk-0.8.2-build.log`、`evidence/mixdesk-0.8.2-production.log`。

## 原版实际载入

网页生成 `evidence/djz/MIXDESK-interop-0.8.2.djz`，复制为 ASCII 名称后通过 macOS 文档打开事件交给原版。DJUCED 自动安装到：

`/Users/pomelo/Music/DJUCED/Samples/MIXDESK-082-ACTUAL-20261020`

- `evidence/djuced-0.8.2-loaded.png`：原版两台显示测试包标题、120.0 BPM、四组中六个非连续样本、空位、量化状态及类型图标。
- `evidence/djz/native-0.8.2-verification.json`：归档 SHA-256、实际安装目录、描述文件一致；六段 48 kHz / 16 位 / 双声道 / 36,000 帧音频的 PCM 逐字节一致。
- `tools/verify-djuced-pack.py` 只读取原版安装结果，以系统 bsdtar 读取归档进行比较，没有替原版复制文件到目标目录。
- 原版为导入 WAV 添加标签，文件大小因此增加；单独比较 PCM 和格式确认声音数据未变化。

全部音频为测试生成；没有把原版附带音乐或图片放入导出物，也没有修改原版应用包、重启或强制终止原版会话。运行时证据来自系统截图和实际输出文件。

这证明本机 6.6.1 能接受当前测试包，不证明所有播放、同步、相位、Key Lock、DSP、时延或其他版本均已通过。

## 0.8.1 历史失败与修正依据

0.8.1 WASM 包使用 Delta + LZMA2，系统 libarchive 对照包使用 LZMA1，均超出这个原版归档库的能力。只改 BZip2 时，default.djs 成功解包，但第一段 WAV 为零；归档目录显示音频仍有自动 Delta:4。关闭过滤和压缩文件头后才完整载入。四份实际归档的格式目录见 `evidence/djz/codec-comparison.jsonl`，失败包保留作历史证据。

0.8.1 失败记录 `evidence/djz/native-import-status.json` 不是 0.8.2 当前状态。历史 REA observe_native_ui 失败也保留：静态会话绑定 arm64 薄片，运行进程为通用二进制，目标身份不一致。为复用静态分析未重开会话；系统截图不标作 REA 运行时捕获。

后续：完整元数据、原版播放/音频 A/B、完整采样路由。Hercules 未连接，USB、灯光和真机延迟仍待实测，完整复刻目标未完成。
