# MIXDESK 0.5 验证记录

目标仍为完整重建 DJUCED 的可观察功能；本次只完成曲库增量，不代表全功能复制或恢复原始源码。

## 实现与依据

本机 DJUCED 6.6.1 changelog.txt 中的播放列表导出（95）、防重复（199）、拖入追加（234）、重读标签（237）、智能列表 contains（405/432）和保存顺序（466）作为功能线索，不能据此断言全部原版交互一致。

- src/catalog.js：普通/智能列表、收藏、元数据覆盖、播放历史。IndexedDB 事务合并、同源标签页广播；新建/导入列表在一次事务内提交。
- src/library.js / library.css：多条件查询排序、批量选择、列表管理、拖到列表或播放器、曲目信息、JSON/M3U 交换。元数据以文本显示，避免导入字符串变成可执行 HTML。
- src/metadata.js：music-metadata 12.2.3 本地解析标签和内嵌 JPEG/PNG/WebP。动态解析器从本机加载，无远程封面请求；相关许可证已复制到 public/third-party。
- src/history.js：每次载入、累计检测主输出信号达到 15 秒记一次；按 AudioContext 时间保守累计，排除 Cue 预览、静音、仅 PFL 及未观察到的长停顿。15 秒为本项目规则，未声称与原版相同。
- BPM 与标题编辑同步已载入的曲目副本；编辑其他字段不会把估算 BPM 错标成手动。

## 测试

新增 tests/library.spec.js 九项集成测试：列表操作/顺序/去重/持久化、智能 AND 条件、元数据跨台与转义、真实 ID3/PNG WAV 读取播放与原文件不变、JSON/M3U、跨页并发合并、拖放/筛选/移动布局、真实 15 秒播放历史、计次边界。

专项测试九项均通过。测试里的跨屏拖动先启动真实 HTML drag，再滚动到目标，避免 Playwright 一步跨屏滚动跳过 dragstart。

完整回归第一次 43/44：修改源码导致 Vite 热更新打断正在运行的 evaluate；第二次 43/44：旧 Roll 测试在不同 AudioContext 时刻读取参考值和实际值，偶发相差一个渲染周期。已改为同一观测时刻比较，容许一帧块的时钟推进，并保留真实频谱验证。后续回归还发现同类嵌套 Slip 时钟断言及 Cue 保存未完成即刷新问题：已统一按观测时刻/音频帧块比较，增加标记保存状态和写入期间离开提醒，测试等待事务完成。最终 npm test -- --reporter=line：44 项全部通过，1.4 分钟。

## 生产验证

npm run build 成功，主脚本 index-CB8CDE7g.js；node scripts/smoke-library.mjs 通过：实际导入带标签音频、封面、播放暂停、列表刷新持久化，390px 页面无整体横向溢出，零页面异常/远程请求，生产未暴露开发诊断对象。

已视觉检查 screenshots/mixdesk-library-v0.5.png 和 mixdesk-library-mobile-v0.5.png；手机曲目表可横向滚动，分类和过滤控件在屏幕内换行。元数据编辑截图为 mixdesk-metadata-v0.5.png。

## 边界

未写回原文件 ID3；没有文件重定位、原版全部智能规则、Rekordbox/Serato 交换、完整播放历史/会话管理。M3U 只匹配已导入文件；智能 JSON 恢复规则，按当前曲库重新求值。跨页音频导入/删除需刷新另一页。未测试十万曲库性能、原版音频 A/B、真机 MIDI 或实际声卡路由。完整目标保持未完成。
