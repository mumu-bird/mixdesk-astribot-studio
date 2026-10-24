import { SoundTouchProcessorBase, STANDARD_PARAMETER_DESCRIPTORS } from '@soundtouchjs/worklet-base';

// Keep the third-party DSP unmodified; this adapter adds explicit lifetime control
// so seeking and pausing cannot leave a previous processor running indefinitely.
class MixdeskPitchProcessor extends SoundTouchProcessorBase {
  static get parameterDescriptors() { return STANDARD_PARAMETER_DESCRIPTORS; }
  constructor() {
    super('[MIXDESK pitch]', { sampleRate });
    this.disposed = false;
    const forward = this.port.onmessage;
    this.port.onmessage = event => {
      if (event.data?.type === 'dispose') { this.disposed = true; this.port.close(); }
      else forward(event);
    };
  }
  onProcessComplete() {}
  process(inputs, outputs, parameters) {
    if (this.disposed) return false;
    return super.process(inputs, outputs, parameters);
  }
}
registerProcessor('mixdesk-pitch', MixdeskPitchProcessor);
