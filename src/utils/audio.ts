// Web Audio API engine for workout countdowns and chimes
// Zero external audio assets required; synthesizes punchy, resonant tones client-side.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        try {
          // Master dynamics compressor functions as a transparent loudness maximizer and limiter,
          // allowing maximum audible output on phone speakers without clipping or distortion.
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(3, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

          // Master gain set for maximum clean volume
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        } catch {
          // Fallback if compressor cannot be initialized
          this.compressor = null;
          this.masterGain = null;
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      // Must be resumed on user gesture
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getOutputNode(ctx: AudioContext): AudioNode {
    return this.compressor ?? this.masterGain ?? ctx.destination;
  }

  // Pre-warms or unlocks AudioContext on first user interaction (e.g. "Start" button)
  public init(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Resonant, high-audibility beep for 5, 4, 3, 2, 1s countdowns (doubled length: ~0.30s, max volume)
  public playPip(frequency = 880, duration = 0.30): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const destination = this.getOutputNode(ctx);

      // Dual-harmonic tone (sine fundamental + warm triangle overtone) for crisp punch through phone speakers
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency, now);

      // Fast punchy attack and smooth resonant decay envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.85, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Ignore audio failure
    }
  }

  // Uplifting resonant chime when an exercise or round ends (doubled length: ~0.85s, max volume)
  public playTransitionChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const destination = this.getOutputNode(ctx);

      // Doubled note durations: D5 (0.38s) -> A5 (0.75s) with resonant harmonics
      const notes = [
        { freq: 587.33, start: now, dur: 0.38 }, // D5
        { freq: 880.0, start: now + 0.22, dur: 0.75 }, // A5
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Triangle tone gives rich harmonic overtones that carry across the room
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, note.start);

        gain.gain.setValueAtTime(0.001, note.start);
        gain.gain.linearRampToValueAtTime(0.85, note.start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.dur);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(note.start);
        osc.stop(note.start + note.dur);
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Distinct 2-tone melodic chime to prompt switching sides (doubled length: ~0.75s, max volume)
  public playSwitchSideChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const destination = this.getOutputNode(ctx);

      // Ascending interval: A4 (440Hz, 0.35s) -> E5 (659.25Hz, 0.65s)
      const notes = [
        { freq: 440.0, start: now, dur: 0.35 },
        { freq: 659.25, start: now + 0.2, dur: 0.65 },
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, note.start);

        gain.gain.setValueAtTime(0.001, note.start);
        gain.gain.linearRampToValueAtTime(0.85, note.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.dur);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(note.start);
        osc.stop(note.start + note.dur);
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Celebratory triumph fanfare upon 15-minute workout completion (doubled length: ~2.4s, max volume)
  public playCompletionFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const destination = this.getOutputNode(ctx);

      // C Major arpeggio up: C5, E5, G5, C6 (doubled note durations and spacing)
      const chord = [
        { freq: 523.25, time: now, dur: 0.4 },
        { freq: 659.25, time: now + 0.3, dur: 0.45 },
        { freq: 783.99, time: now + 0.6, dur: 0.55 },
        { freq: 1046.5, time: now + 0.95, dur: 1.35 },
      ];

      for (const note of chord) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, note.time);

        gain.gain.setValueAtTime(0.001, note.time);
        gain.gain.linearRampToValueAtTime(0.9, note.time + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, note.time + note.dur);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(note.time);
        osc.stop(note.time + note.dur);
      }
    } catch {
      // Ignore audio failure
    }
  }
}

export const soundEngine = new SoundEngine();
