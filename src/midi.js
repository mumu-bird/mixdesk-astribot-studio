// Protocol facts verified against DJUCED 6.6.1's DJControl_Mix.djm.
// Continuous controls accept the controller's paired 14-bit MSB/LSB messages.
export const isMixPort = port => /dj\s*control[\s_-]*mix(?:\b|_)/i.test(port.name || '') && !/ultra/i.test(port.name || '');

export function decodeMix(data, continuousState = null) {
  if (data.length !== 3) return null;
  const [status, key, value] = data;
  if (![status, key, value].every(Number.isInteger) || key < 0 || key > 127 || value < 0 || value > 127) return null;
  const type = status & 0xf0, channel = status & 0xf;
  const descriptor = (ch, base) => {
    if (ch === 0) return ({ 0: { action: 'crossfader', id: '0:0' }, 3: { action: 'master', id: '0:3' }, 4: { action: 'headphoneVolume', id: '0:4' } }[base] || null);
    if (ch === 1 || ch === 2) {
      const action = { 0: 'volume', 1: 'filter', 2: 'bass', 8: 'tempo' }[base];
      return action ? { action, deck: ch - 1, id: `${ch}:${base}` } : null;
    }
    return null;
  };
  const lsbDescriptor = (ch, key) => {
    if (ch === 0 && key === 0x20) return descriptor(0, 0);
    if (ch === 1 && key === 0x23) return descriptor(0, 3);
    if (ch === 1 && key === 0x24) return descriptor(0, 4);
    if ((ch === 1 || ch === 2) && [0x20, 0x21, 0x22, 0x28].includes(key)) return descriptor(ch, key - 0x20);
    return null;
  };
  const continuousAction = (info, raw, isLsb = false) => {
    if (!info) return null;
    if (!continuousState) return isLsb ? null : { action: info.action, ...(info.deck == null ? {} : { deck: info.deck }), value: raw / 127 };
    if (!isLsb) {
      continuousState.set(`${info.id}:msb`, raw);
      // The MSB is useful immediately; discard an older LSB so a new knob
      // turn cannot briefly combine with the previous turn's low byte.
      continuousState.delete(`${info.id}:lsb`);
      return { action: info.action, ...(info.deck == null ? {} : { deck: info.deck }), value: raw / 127 };
    }
    const high = continuousState.get(`${info.id}:msb`);
    if (high == null) return null;
    continuousState.set(`${info.id}:lsb`, raw);
    return { action: info.action, ...(info.deck == null ? {} : { deck: info.deck }), value: (high * 128 + raw) / 16383 };
  };
  // DJControl MIX uses the deck-side CUE note for cue preview and a
  // separate shift/CUE note on channels 4/5 for the hard stop action.
  if ((channel === 1 || channel === 2) && key === 6 && (type === 0x80 || (type === 0x90 && value === 0))) return { action: 'cueRelease', deck: channel - 1 };
  if ((channel === 4 || channel === 5) && key === 6 && type === 0x90 && value > 0) return { action: 'stop', deck: channel - 4 };
  if ((channel === 1 || channel === 2) && key === 8 && (type === 0x80 || type === 0x90)) return { action: 'scratchTouch', deck: channel - 1, active: type === 0x90 && value > 0 };
  if ((channel === 1 || channel === 2) && key === 3 && type === 0x90 && value > 0) return { action: 'scratchModeToggle', deck: channel - 1 };
  // DJControl MIX's HOTCUE_TAB button selects the deck's Hot Cue page.
  // DJUCED exposes this as `show_track_tab value="0"`; the browser UI has
  // the same state in the Pad mode selector, so keep the action semantic
  // instead of pretending it is another cue trigger.
  if ((channel === 1 || channel === 2) && key === 0x0f && type === 0x90 && value > 0) return { action: 'hotcueTab', deck: channel - 1 };
  if ((channel === 6 || channel === 7) && key >= 0 && key <= 3 && (type === 0x80 || (type === 0x90 && value === 0))) return { action: 'hotcueRelease', deck: channel - 6, index: key };
  if ((channel === 6 || channel === 7) && key >= 0x10 && key <= 0x13 && (type === 0x80 || (type === 0x90 && value === 0))) return { action: 'sampleRelease', deck: channel - 6, index: key - 0x10 };
  if (type === 0x90 && value > 0) {
    if (channel === 1 || channel === 2) {
      const action = { 5: 'sync', 6: 'cue', 7: 'play', 12: 'pfl' }[key];
      if (action) return { action, deck: channel - 1 };
    }
    if ((channel === 4 || channel === 5) && key === 6) return { action: 'stop', deck: channel - 4 };
    if ((channel === 4 || channel === 5) && key === 7) return { action: 'load', deck: channel - 4 };
    if (channel === 6 || channel === 7) {
      const deck = channel - 6;
      if (key <= 3) return { action: 'hotcue', deck, index: key };
      if (key >= 8 && key <= 11) return { action: 'clearCue', deck, index: key - 8 };
      if (key >= 0x10 && key <= 0x13) return { action: 'sample', deck, index: key - 0x10 };
      if (key >= 0x18 && key <= 0x1b) return { action: 'stopSample', deck, index: key - 0x18 };
      if (key >= 0x20 && key <= 0x22) return { action: 'effect', deck, index: key - 0x20 };
      if (key >= 0x30 && key <= 0x33) return { action: 'loop', deck, beats: 2 ** (key - 0x30) };
    }
  }
  if (type === 0xb0) {
    const lsb = lsbDescriptor(channel, key);
    if (lsb) {
      const action = continuousAction(lsb, value, true);
      if (action?.action === 'crossfader') action.value = action.value * 2 - 1;
      return action;
    }
    const msb = descriptor(channel, key);
    if (msb) {
      const action = continuousAction(msb, value);
      if (action?.action === 'crossfader') action.value = action.value * 2 - 1;
      return action;
    }
    if (channel === 1 || channel === 2) {
      // Normal jog is a temporary pitch bend. Shift+Jog is a four-beat seek.
      if (key === 9 && value !== 0) return { action: 'pitchBend', deck: channel - 1, value: (value < 64 ? value : value - 128) / 64 };
      if (key === 10 && value !== 0) return { action: 'scratchMove', deck: channel - 1, value: (value < 64 ? value : value - 128) / 256 };
    }
    if ((channel === 4 || channel === 5) && key === 9 && value !== 0) return { action: 'seekLoop', deck: channel - 4, beats: 4, value: value < 64 ? 1 : -1 };
    // Shift with a touched jog browses the library; it uses a different CC
    // from Shift on the jog rim, which seeks by four beats above.
    if ((channel === 4 || channel === 5) && key === 10 && value !== 0) return { action: 'browserMove', deck: channel - 4, value: value < 64 ? value : value - 128 };
  }
  return null;
}

export function feedbackMessages(decks, sampler, monitor) {
  const messages = [];
  decks.slice(0, 2).forEach((deck, id) => {
    const note = 0x91 + id, deckState = 0x94 + id, pad = 0x96 + id;
    const add = (status, key, on) => messages.push([status, key, on ? 127 : 0]);
    add(note, 7, deck.playing);
    add(deckState, 7, deck.playing);
    add(note, 12, !!monitor?.enabled && !!monitor.selected[id]);
    add(note, 3, !!deck.scratchMode);
    add(deckState, 3, !!deck.scratchMode);
    add(note, 6, !!deck.buffer && !deck.playing && Math.abs(deck.position - deck.cuePoint) < 0.05);
    add(deckState, 6, !!deck.buffer && !deck.playing && Math.abs(deck.position - deck.cuePoint) < 0.05);
    const other = decks[deck.syncTarget ?? (1 - id)];
    add(note, 5, !!deck.syncEnabled && !!deck.buffer && !!other?.buffer);
    for (let i = 0; i < 4; i++) {
      add(pad, i, deck.hotcues[i] !== null);
      add(pad, 0x08 + i, deck.hotcues[i] !== null);
      add(pad, 0x10 + i, !!sampler?.groupActive?.(i, id + 2));
      add(pad, 0x30 + i, !!deck.loop && deck.loop.beats === 2 ** i);
    }
    for (let i = 0; i < 3; i++) add(pad, 0x20 + i, deck.effects.slots[i].enabled);
    const rms = deck.meter();
    const level = Math.max(0, Math.min(1, (20 * Math.log10(rms + 0.00001) + 48) / 48));
    messages.push([note, id === 0 ? 0x00 : 0x23, Math.round(level * (id === 0 ? 0x1f : 0x7f))]);
  });
  return messages;
}

export class MixMidi {
  constructor({ onAction, onStatus, onDisconnect = () => {} }) {
    this.onAction = onAction; this.onStatus = onStatus;
    this.onDisconnect = onDisconnect;
    this.access = null; this.input = null; this.output = null;
    this.continuousState = new Map();
    this.heldHotcues = new Set();
    this.lastSent = new Map(); this.received = 0; this.sent = 0;
    this.lastMessage = ''; this.busy = false;
  }
  ports() {
    return { inputs: this.access ? [...this.access.inputs.values()].filter(p => p.state === 'connected' && isMixPort(p)) : [], outputs: this.access ? [...this.access.outputs.values()].filter(p => p.state === 'connected' && isMixPort(p)) : [] };
  }
  status(message) { this.onStatus({ message, ports: this.ports(), input: this.input?.id, output: this.output?.id, received: this.received, sent: this.sent, lastMessage: this.lastMessage }); }
  async discover() {
    if (!navigator.requestMIDIAccess) throw new Error('当前浏览器不支持 Web MIDI，请在 Chrome 中打开此页面');
    this.access ||= await navigator.requestMIDIAccess({ sysex: false });
    this.access.onstatechange = () => {
      if (this.input?.state === 'disconnected' || this.output?.state === 'disconnected') {
        this.disconnect().then(() => this.status('控制器已离线，请重新连接'));
      } else this.status(this.input ? '控制器已连接' : '端口已更新，请选择后连接');
    };
    this.status(this.ports().inputs.length ? '发现 DJControl MIX，请选择端口并连接' : '尚未发现在线的 DJControl MIX MIDI 端口');
    return this.ports();
  }
  async connect(inputId, outputId) {
    if (this.busy) return;
    this.busy = true;
    let input, output;
    try {
      await this.disconnect();
      input = this.access?.inputs.get(inputId);
      output = outputId ? this.access?.outputs.get(outputId) : null;
      if (!input || !isMixPort(input) || input.state !== 'connected') throw new Error('请选择在线的 DJControl MIX 输入端口');
      if (outputId && (!output || !isMixPort(output) || output.state !== 'connected')) throw new Error('请选择在线的 DJControl MIX 输出端口');
      await input.open();
      if (output) await output.open();
      if (input.state !== 'connected' || (output && output.state !== 'connected')) throw new Error('连接过程中控制器已离线');
      this.input = input; this.output = output;
      input.onmidimessage = event => {
        this.received++;
        this.lastMessage = [...event.data].map(n => n.toString(16).padStart(2, '0')).join(' ');
        const action = decodeMix([...event.data], this.continuousState);
        if (action?.action === 'hotcue') {
          const key = `${action.deck}:${action.index}`;
          if (this.heldHotcues.has(key)) return;
          this.heldHotcues.add(key);
        } else if (action?.action === 'hotcueRelease') {
          if (!this.heldHotcues.delete(`${action.deck}:${action.index}`)) return;
        }
        if (action) Promise.resolve(this.onAction(action)).catch(error => this.status(`控制操作失败：${error.message}`));
      };
      this.status(output ? '已连接 · 双向控制与灯光反馈' : '已连接 · 仅输入，未启用灯光反馈');
    } catch (error) {
      if (input) { input.onmidimessage = null; await input.close().catch(() => {}); }
      if (output) await output.close().catch(() => {});
      throw error;
    } finally { this.busy = false; }
  }
  sendFeedback(messages) {
    if (!this.output || this.output.state !== 'connected') return;
    try {
      for (const message of messages) {
        const key = `${message[0]}:${message[1]}`;
        if (this.lastSent.get(key) === message[2]) continue;
        this.output.send(message); this.lastSent.set(key, message[2]); this.sent++;
      }
    } catch { this.status('灯光发送失败，请检查设备连接'); }
  }
  async disconnect() {
    this.onDisconnect();
    const input = this.input, output = this.output;
    this.input = null; this.output = null;
    if (input) input.onmidimessage = null;
    if (output?.state === 'connected') {
      for (const key of this.lastSent.keys()) {
        try { output.send([...key.split(':').map(Number), 0]); } catch { break; }
      }
    }
    this.lastSent.clear();
    this.continuousState.clear();
    this.heldHotcues.clear();
    await Promise.all([input?.close().catch(() => {}), output?.close().catch(() => {})]);
    this.status('未连接控制器');
  }
}
