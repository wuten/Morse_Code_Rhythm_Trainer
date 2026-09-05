class MorseAudioEngine {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlayingTone: boolean = false;
  private frequency: number = 650;
  private volume: number = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setConfig(frequencyHz: number, volume: number) {
    this.frequency = frequencyHz;
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.oscillator && this.ctx) {
      this.oscillator.frequency.setValueAtTime(this.frequency, this.ctx.currentTime);
    }
    if (this.gainNode && this.ctx && this.isPlayingTone) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public startTone() {
    if (this.isPlayingTone) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      // Smooth sine wave
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(this.frequency, now);

      // Anti-click attack ramp (5ms)
      this.gainNode.gain.setValueAtTime(0.0001, now);
      this.gainNode.gain.exponentialRampToValueAtTime(this.volume, now + 0.005);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.oscillator.start(now);
      this.isPlayingTone = true;
    } catch (e) {
      console.warn('Audio start failed', e);
    }
  }

  public stopTone() {
    if (!this.isPlayingTone || !this.gainNode || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Anti-click release ramp (7ms)
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);

      const osc = this.oscillator;
      setTimeout(() => {
        try {
          osc?.stop();
          osc?.disconnect();
        } catch {
          // ignore
        }
      }, 15);

      this.isPlayingTone = false;
      this.oscillator = null;
    } catch (e) {
      console.warn('Audio stop failed', e);
    }
  }

  // Play a reference code e.g. ".-." at a specific WPM
  public async playReferenceCode(code: string, wpm: number, onProgress?: (charIndex: number) => void): Promise<void> {
    this.initContext();
    if (!this.ctx) return;

    const ditMs = 1200 / wpm;
    const dahMs = ditMs * 3;
    const intraGapMs = ditMs;

    for (let i = 0; i < code.length; i++) {
      const sym = code[i];
      onProgress?.(i);

      this.startTone();
      const duration = sym === '.' ? ditMs : dahMs;
      await new Promise((r) => setTimeout(r, duration));
      this.stopTone();

      if (i < code.length - 1) {
        await new Promise((r) => setTimeout(r, intraGapMs));
      }
    }
  }

  // Metronome tick sound for rhythm drill guide
  public playClick(isHighBeat: boolean = false) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isHighBeat ? 880 : 440, now);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }
}

export const morseAudio = new MorseAudioEngine();
