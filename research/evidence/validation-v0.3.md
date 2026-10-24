# MIXDESK 0.3 验证记录

- `npm test -- --reporter=line`：25 项通过（47.1 秒）。包含原有 18 项、4 项 PFL 测试、3 项四台测试。
- `npm run build`：Vite 构建成功；生成独立 AudioWorklet 和静态资源。
- 生产预览 `http://127.0.0.1:4173/`：从实际构建载入 C 台、启用 Key Lock、播放时间推进到 00:01，再暂停；输出设置弹窗可打开；四个 Deck 存在；无页面异常、无外部网络请求，开发诊断对象未暴露。
- 用户现有 `http://127.0.0.1:5173/` 标签已刷新到新版，并选择四台布局。内置浏览器加载后可见实时音高处理，不再是旧版缓存中禁用的状态。
- 桌面、平板、手机宽度 1440 / 900 / 390 均检查无页面横向溢出。

音频验证使用实际 Web Audio 节点和合成音频。PFL 测试把主音量、通道推子及交叉推子设为静音，验证耳机总线仍有采样信号，同时使用实际 MediaRecorder 录制主输出并解码确认没有预听串入。设备选择 API 在该测试内替代为模拟输出，不能据此推断真实声卡路由或时延已经通过。

MIX 未连接。控制器输入、灯光、热拔出采用协议与模拟端口测试；物理 USB / 蓝牙通信和实际灯光未验收。

截图：
- `screenshots/mixdesk-desktop.png`
- `screenshots/mixdesk-mobile.png`
- `screenshots/mixdesk-four-decks.png`
- `screenshots/mixdesk-four-decks-mobile.png`

完整 DJUCED 功能仍未达到，见上级目录的功能对照与验收。下一轮应继续补齐 Loop Roll / Slicer / Saved Loop 与 Slip 时间线、曲库管理、动态拍网格、Stems 和其余未实现项；还需取得原版运行流程及音频 A/B 验证。不能将当前测试覆盖范围当作完整功能覆盖。
