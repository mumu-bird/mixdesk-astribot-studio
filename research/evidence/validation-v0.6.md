# MIXDESK 0.6 验证记录

本次在 0.5 曲库功能之上，继续补原生 WAV 录音；完整 DJUCED 复刻仍未完成。

## 实现

- src/pcm-worklet.js 在音频线程捕获主输出，打包 16/24 位双声道 PCM；录音分支输出静音，避免主音频重复播放。
- src/recording-store.js 使用独立 IndexedDB 的 sessions/chunks 存储。片段与累计帧数在同一事务提交，验证顺序，保留未结束/异常会话的已写入片段。
- src/pcm-recorder.js 提供开始、停止、待写队列上限、处理器与存储异常保护、缓存导出；最多 30 分钟或 1 GiB。
- src/recording-ui.js 提供格式选择、当前状态、本机录音列表、重新导出和删除。原有 WebM/M4A 及 WAV 转码保留。
- 24 位 PCM 不意味着提升源音质。超限样本会裁切并计数；尚无 dither、响度标准化、原版音质 A/B。

## 验证

- npm test -- tests/recording.spec.js --reporter=line：9 项通过，17.7 秒。
- 最终 npm test -- --reporter=line：53 项全部通过，1.7 分钟。
- npm run build 成功；主脚本 index-BLQdVaae.js，PCM worklet 为 pcm-worklet-Be78EKQg.js。
- node scripts/smoke-recording.mjs 生产检查通过：实际 24 位 WAV 下载 364076 字节，信号 RMS 0.04661；刷新缓存可恢复，手机无整体横向溢出，无页面异常/远程请求，生产不暴露诊断对象。
- 桌面与手机截图已检查：screenshots/mixdesk-recording-v0.6.png、mixdesk-recording-mobile-v0.6.png。

测试验证实际 WAV 文件头、左右声道已知样本值和符号、16/24 位宽度、样本数、原始字节重复导出一致、主输出与采样信号、PFL-only 静音、不完整会话恢复、异常停止后可导出、乱序事务不破坏前段、削波统计与帧数上限。存储/处理器错误用受控故障注入，不声称真实磁盘配额耗尽或声卡故障实测。

## 未覆盖

没有 MP3 编码、长达 30 分钟的实时时间压力测试、磁盘直接流式写入、真实设备路由或原版录音 A/B。缓存清理和关闭前未提交的尾部片段仍可能导致数据丢失。完整目标保持 active。
