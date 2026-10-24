# 采样器结构修正（0.8 已交付，原版一致性仍待验证）

目标：按 DJUCED 6.6.1 的已保存 REA 证据修正独立实现，不能将反编译伪代码称为原始源码。

- [x] 每台四组，每组四个可选择样本；组间可同时播放。
- [x] 六种触发类型与组内分页（含 3 页整数分页布局）；包级默认量化。
- [x] 按拍切换保留旧声音；取消等待不误停旧声音。
- [x] MIX 采样输入与反馈使用 C/D 台的四组。
- [x] 保留旧 IndexedDB 数据，迁移旧采样包；新格式可往返。
- [x] 构建、音频时序、迁移、事务失败及完整浏览器回归。

依据：research/evidence/rea 中 sampler-load-pack、sample-open-list、sample-get-loop、sample-set-loop、sample-open-file、sample-buffer-partial、performance-set-sampler-page、djs-pack-metadata；以及应用包内 DJControl_Mix.djm。

旧实现和旧测试保存在 research/archive/sampler-v0.7/。旧版本叠加层将迁移为同组的可选择样本，保留所有音频，但不再把四个样本一起触发。精确量化切换算法仍需与原版动态验证，不能仅凭自身测试称为一致。

验证记录：

- 固定版本完整浏览器回归：114/114 通过；此前一次运行被开发热更新打断，复测通过，日志在 evidence/mixdesk-0.8-full-regression.log。
- 后续按证据补齐默认类型后，采样专项：31/31 通过（含新增测试）。
- quant-enabled 的 32 位有符号整数边界专项通过。
- 最终生产构建通过；生产页面导入、编辑、播放、刷新恢复和手机布局通过，无页面异常或远程请求。截图在 ../screenshots/mixdesk-sampler-v0.8.png。
- 本轮共覆盖 115 个不同测试；并非原版的穷尽行为或音质对照。最终源码摘要保存到 evidence/mixdesk-0.8-source-hashes.json。

后续仍需：原版同音频 A/B、采样的完整音频路由/渐变/重触发相位和 .djs 导出，以及功能对照表中的 Stems、完整 FX、Link、VJ、SmartMix、专业声卡和实际控制器验证。完整复刻目标尚未完成。

## 0.8.1 后续：DJZ 导出

当前采样台可导出实验性 .djz（7-Zip 内含 default.djs 与 WAV），依据 REA 追踪的原版 PackThread 和 LibarchiveUtil。完整证据及已知限制见 [DJZ-EXPORT.md](DJZ-EXPORT.md)。导出裁剪与样本增益，保留模式、索引及量化；组/台音量、同步、Key Lock 等仍只完整保存在 .mxpack。固定源码完整回归 120/120 通过，原版自动安装未通过，不把标准解包成功当作原版播放验收。

## 0.8.2 后续：原版载入验证通过

0.8.1 中记录的原版自动安装失败已解决：原版归档库不支持 LZMA/Delta，现改为纯 BZip2 并关闭自动过滤与压缩文件头。网页产物已由 DJUCED 6.6.1 自动解包和载入；六段 PCM 一致，原版界面显示包标题、120 BPM、分组和空位。包 BPM 可编辑并保留导入值。当前 37 项专项通过，生产构建及下载验证通过；详情见 DJZ-EXPORT.md。原版播放行为/DSP A/B 和 .djz 直接导入仍未完成。

## 2026-10-20：0.8.3 直接导入 DJUCED 采样包

复用 REA 静态证据 `unpack-finished.json`：原版解包成功后读取根目录 default.djs 并发送载入动作。已实现 .djz 单文件导入当前采样台、完整包内路径匹配、阶段状态、取消、解包限额与原子存储。独立 libarchive 包、真实异常归档、取消与事务回滚测试见 [DJZ-IMPORT.md](DJZ-IMPORT.md)。这补齐了上文 0.8.2 的直接导入缺口；完整元数据、原版 DSP A/B、路由、Stems、Link、VJ、SmartMix 和真机验收仍待完成。
