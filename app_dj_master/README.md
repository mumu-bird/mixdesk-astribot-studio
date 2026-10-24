# DJ Master

Astribot OS App for arranging two-song DJ sets and auditioning the transition locally. This package covers music preparation only; it does not connect to robot, DJ controller, or live-performance APIs.

## Run

```bash
python -m pip install -r requirements.txt
npm install
npm run build
DJ_MASTER_DATA_DIR="$HOME/.local/share/astribot/apps/dj-master" python -m uvicorn src.main:app --host 0.0.0.0 --port 12340
```

For frontend development, run `npm run dev` and the API with `python -m uvicorn src.main:app --port 8765`; Vite proxies `/api` to port 8765.

Audio files and the draft stay in the app host's data directory. MP3, WAV, and FLAC files up to 150 MB are accepted.

For a repeatable presentation, click **加载一分钟演示**. The app creates two local deterministic 58-second demo tracks, `Night Drive` and `After Hours` (both 120 BPM), and starts both decks at 00:00. An 8-second equal-power transition runs from 00:26 to 00:34 while both songs are audible. The 58-second arrangement includes audible filter, bass, scratch reverse, crossfader and level changes, plus timeline markers. The generated 22.05 kHz WAVs are stored in the local app data directory and can be replaced with real music at any time. Loading the demo changes the workspace as an unsaved edit; **保存草稿** persists it, and **撤销** restores the prior arrangement.

The presentation leaves 5 seconds for the opening, then schedules filter at 5–7 seconds, bass cut at 12–14, scratch reverse and replay at 19–21, crossfade at 26–34, and channel level at 42–45, followed by 13 seconds to close. Both songs begin at 00:00; the second deck enters the audible mix at 00:26, so the crossfade is a real two-deck overlap. Every operation finishes at least 5 seconds before the next begins, including the forward replay after the one-second reverse. The second-track filter has been removed to keep the crossfade exclusive. These gaps are planning allowances; robot preparation, operation and return times still need measurement on the actual robot and controller. They are not verified robot execution durations.

The timed presentation walkthrough is in [doc/一分钟演示.md](doc/一分钟演示.md).

项目功能、使用流程、音频映射和当前边界详见 [doc/项目介绍.md](doc/项目介绍.md)。

The DJ operation / effect library follows the recovered `DJControl_Mix.djm` mapping names. Cards can be clicked to add at the playhead or dragged onto the unified **DJ 操作 / 音效** timeline lane. Legacy drafts still store `type: "dj"` and `type: "fx"`; the UI renders both in that lane and keeps their purple/yellow source colors. Events retain the source control name, action, channel and mapping value. The app does not send commands to a physical controller. Each menu item declares whether it is a continuous control (`startValue → endValue`), a button with a hold duration, or a one-shot sampler trigger. During local audition, scratch reverse, filter sweep, bass cut, channel level, crossfader, tempo/rate, pitch, FX slots and Kick/Clap/Hat sampler events are scheduled against the Web Audio clock. Transport, loop and Cue commands remain saved control mappings unless they have a dedicated audio preview path. These local DSP effects follow the recovered action and parameter intent, not proprietary DJUCED sound processing.

Overlapping audio-effect events on the same parameter continue from the active automated value, avoiding a jump back to the neutral setting when a new event begins.

Filter sweeps can move in either direction. Low-pass and high-pass preview paths run in parallel and their gains crossfade on the audio clock, so a later sweep can change direction without changing a live filter node on the UI thread.

The menu labels one-shot controls as single actions and shows the default duration for effects. Dragging an operation previews its target time and duration on the matching lane; duration events can be stretched on the timeline. Event collision layout follows the live timeline width so controls stay readable as the workspace resizes.

Scratch reverse is a resizable performance event: dragging its right edge changes the reversed source window, adds or removes twice that amount of performance time for the reverse-and-replay pass, and shifts later events on the same track accordingly. The selected event also shows the source range and added performance time.

Timeline zoom controls enlarge long arrangements for precise editing and fit the current schedule to the available width. Beat guides, drag previews, event placement and resizing use the same measured timeline scale.

An embedded, valid BPM tag takes priority on import. Without one, each track can estimate BPM and its first beat from audio transients; suggestions are marked so they can be checked and corrected. Trimming the start keeps the beat grid aligned to the source. Timeline insertions and event moves can snap to quarter-beat, half-beat, beat, two-beat or four-beat divisions. Turn snapping off for free placement. Beat guides are drawn on the event lanes for tracks with BPM set.

Keyboard shortcuts: `Ctrl/⌘+C` copies the selected event and `Ctrl/⌘+V` pastes it at the playhead, recalculating its source position and deck mapping. `Ctrl/⌘+S` saves, `Ctrl/⌘+Z` undoes, `Ctrl/⌘+Shift+Z` or `Ctrl/⌘+Y` redoes, `Space` toggles audition, and `Delete` removes the selected event. Text fields keep their normal editing shortcuts.

## Tests

```bash
python -m pytest
npm run test:e2e
```
