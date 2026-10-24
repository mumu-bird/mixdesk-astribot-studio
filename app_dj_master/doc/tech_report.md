# 技术设计

- FastAPI 提供草稿 REST API、音频导入与流式读取、状态 SSE。
- React 18 与 Vite 构建桌面工作台；使用 Tailwind、Radix 原语、本地 shadcn 风格 Button 和 Lucide 图标。
- 双 Deck 音频图基于 MIXDESK AudioEngine；音频片段通过 Web Audio BufferSource 排程在 AudioContext 时钟上，交叉推子使用等功率曲线的 AudioParam 自动化。
- 事件编辑只修改 ArrangementProject；不声明或调用硬件 Meta。
- `ui/src/dj-operations.js` 是 DJControl MIX 菜单与逆向映射登记表。每个事件保留设备、映射文件、控件名、MIDI 通道、映射动作和参数，当前未连接实体控制器。
- 时间轴拖放将操作写入对应轨道和指针所在演出时间。音源定位通过正放、倒放、回放的显式分段路由反查，保留同一音源位置在不同演出时刻的区别。
