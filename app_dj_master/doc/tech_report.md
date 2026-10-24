# 技术设计

- FastAPI 提供草稿 REST API、音频导入与流式读取、状态 SSE。
- React 18 与 Vite 构建桌面工作台；使用 Tailwind、Radix 原语、本地 shadcn 风格 Button 和 Lucide 图标。
- 双 Deck 音频图基于 MIXDESK AudioEngine；音频片段通过 Web Audio BufferSource 排程在 AudioContext 时钟上，交叉推子使用等功率曲线的 AudioParam 自动化。
- 事件编辑只修改 ArrangementProject；不声明或调用硬件 Meta。
- `ui/src/dj-operations.js` 是 DJControl MIX 菜单与逆向映射登记表。每个事件保留设备、映射文件、控件名、MIDI 通道、映射动作和参数，当前未连接实体控制器。
- 时间轴拖放将操作写入统一的 DJ 操作 / 音效轨道和指针所在演出时间；底层事件仍使用 `dj` 或 `fx` 类型，保持旧草稿兼容。音源定位通过正放、倒放、回放的显式分段路由反查，保留同一音源位置在不同演出时刻的区别。
- 每个 DJ 操作包含 `controlType`、`controlId`、单位、范围、曲线和音频目标。连续控件以 `startValue`/`endValue` 保存，按钮以按下/保持语义保存，采样器以固定一次的采样槽保存。试听调度统一使用 AudioContext 时间：滤波、EQ、通道电平、交叉推子通过 AudioParam 自动化，FX 插槽通过发送/干湿参数启停，变速/变调作用于分段 BufferSource，Kick/Clap/Hat 通过 Sampler 的定时触发器进入主输出。
