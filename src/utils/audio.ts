// Web Audio API engine for workout countdowns and chimes
// Zero external audio assets required; synthesizes clean tones client-side.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      // Must be resumed on user gesture
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
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

  // Short 880Hz beep for 5, 4, 3, 2, 1s countdowns (matches transition chime tonality for phone speaker clarity)
  public playPip(frequency = 880, duration = 0.15): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Smooth attack and decay envelope to prevent clicks
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio failure
    }
  }

  // Uplifting 880Hz / dual-tone chime when an exercise or rest ends
  public playTransitionChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, start: now, dur: 0.18 }, // D5
        { freq: 880.0, start: now + 0.12, dur: 0.35 }, // A5
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, note.start);

        gain.gain.setValueAtTime(0.001, note.start);
        gain.gain.exponentialRampToValueAtTime(0.3, note.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(note.start);
        osc.stop(note.start + note.dur);
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Celebratory fanfare upon 15-minute workout completion
  public playCompletionFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // C Major arpeggio up: C5, E5, G5, C6
      const chord = [
        { freq: 523.25, time: now, dur: 0.2 },
        { freq: 659.25, time: now + 0.15, dur: 0.2 },
        { freq: 783.99, time: now + 0.3, dur: 0.25 },
        { freq: 1046.5, time: now + 0.48, dur: 0.6 },
      ];

      for (const note of chord) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Richer pleasant tone for celebration
        osc.frequency.setValueAtTime(note.freq, note.time);

        gain.gain.setValueAtTime(0.001, note.time);
        gain.gain.exponentialRampToValueAtTime(0.35, note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(note.time);
        osc.stop(note.time + note.dur);
      }
    } catch {
      // Ignore audio failure
    }
  }
}

export const soundEngine = new SoundEngine();
