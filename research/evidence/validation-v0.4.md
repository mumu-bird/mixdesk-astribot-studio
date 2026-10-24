# MIXDESK 0.4 验证记录

本轮继续推进完整 DJUCED 功能复刻。没有完成全部能力，也没有恢复原始源码。

## 证据与变更

- `pad-protocol-reference.json` 从已保存的原版控制器清单提取 Loop Roll 的 1/16–8 拍 temporary 操作、Slip、Slicer 和 MIX Cue 临时按下语义。此证据不证明原版 DSP 或精确量化时序。
- 新增 `src/deck-performance.js`：按 AudioContext 时间推进的后台时间线、临时循环与切片、叠按及嵌套循环恢复；变速时重设时钟基点，不依赖页面动画帧。
- 新增 `src/pad-ui.js` / `src/pads.css`：五种 Pad 模式、4/8/16/32 拍移动切片区域、重复拍长、手动 Loop IN / OUT、每曲八个保存循环槽、SLIP 开关、后台进度标识。
- 保存循环按精确秒数存储，允许以后修改 BPM；标记跨刷新恢复，同曲多台共享，防止旧台覆盖新标记。
- Cue 暂停时按住预览、松开返回；预览中 Play 锁定播放。MIX Note On velocity=0 与 Note Off 释放事件均处理；断开取消预览。

## 验证结果

- `npm test -- --reporter=line`：35 项全部通过，50.0 秒。
- 随后调整手动循环控件位置与临时循环拍长显示；针对受影响的 Pad / Cue 集成测试重跑：10 项全部通过，15.1 秒。
- 最终 `npm run build`：构建成功，主脚本 `index-I575qijY.js`。
- 生产预览：实际按住 1/4 拍 Roll，确认临时循环开启、拍长为 1/4；松开后退出；手动 IN / OUT 位于循环行旁。无页面异常。
- 生产预览检查无外部网络请求、开发诊断对象未暴露；390px 宽度无横向溢出。
- 桌面与手机截图已检查：`screenshots/mixdesk-performance-v0.4.png`、`screenshots/mixdesk-performance-mobile-v0.4.png`。

`tests/pads.spec.js` 的音频断言包括：重复 440 Hz 片段期间后台已越过下一音色区域；释放并以 1.25 倍速恢复时检测到对应 1100 Hz；切片选择产生对应音高；Slip 与普通循环有不同退出位置；变速、叠按、旧循环恢复、曲尾、暂停/定位/换曲、异步 Cue 释放、断连不重启。

边界：没有原版音频 A/B；Slicer 固定区域模式与完整量化/排队策略、Slip Hot Cue / Scratch 联动尚未完成。MIX 原映射没有直接 Roll / Slicer 消息，未擅自把硬件原有 Hot Cue 改为这些新模式；硬件仍未连接，不能视为真机验收。

下一步仍需推进功能表中的完整曲库管理、分析/动态拍网格、Stems、原生无损/MP3 录音、多通道音频、剩余演奏模式及实际原版逐屏/音频对照；不缩减完整目标。
