/**
 * Retro 8-bit Web Audio API sound synthesizer
 * Zero external audio dependencies for instant, reliable playback.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted: boolean = false;
  private bgmOscs: OscillatorNode[] = [];
  private bgmGains: GainNode[] = [];
  private isBgmPlaying: boolean = false;
  private bgmTimeoutId: number | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public playJump(isSuper: boolean = false) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isSuper ? 'triangle' : 'square';
    const startFreq = isSuper ? 130 : 160;
    const endFreq = isSuper ? 420 : 540;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.16);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // B5 then E6 (classic coin notes)
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.setValueAtTime(0.3, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playStomp() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playPowerUp() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [330, 392, 659, 523, 587, 784, 880, 1046];
    const noteLen = 0.055;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = t0 + idx * noteLen;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + noteLen);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + noteLen);
    });
  }

  public playPowerDown() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [600, 520, 460, 390, 320, 240];
    const noteLen = 0.08;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = t0 + idx * noteLen;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + noteLen);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + noteLen);
    });
  }

  public playBlockBump() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.1);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  public playBrickBreak() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  public playFlagpole() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Slide down whistle then fanfare
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.6);

    gain.gain.setValueAtTime(0.3, t0);
    gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t0);
    osc.stop(t0 + 0.65);

    // Fanfare after slide
    const fanfareNotes = [
      { f: 523.25, d: 0.12, del: 0.7 },
      { f: 659.25, d: 0.12, del: 0.85 },
      { f: 783.99, d: 0.12, del: 1.0 },
      { f: 1046.5, d: 0.35, del: 1.15 },
    ];

    fanfareNotes.forEach((n) => {
      if (!this.ctx || !this.masterGain) return;
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const time = t0 + n.del;

      noteOsc.type = 'square';
      noteOsc.frequency.setValueAtTime(n.f, time);

      noteGain.gain.setValueAtTime(0.28, time);
      noteGain.gain.exponentialRampToValueAtTime(0.01, time + n.d);

      noteOsc.connect(noteGain);
      noteGain.connect(this.masterGain);

      noteOsc.start(time);
      noteOsc.stop(time + n.d);
    });
  }

  public playDeath() {
    this.init();
    this.stopBgm();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t0 = this.ctx.currentTime;
    const notes = [
      { f: 500, d: 0.1, delay: 0 },
      { f: 450, d: 0.1, delay: 0.12 },
      { f: 400, d: 0.1, delay: 0.24 },
      { f: 300, d: 0.35, delay: 0.38 },
      { f: 200, d: 0.45, delay: 0.75 },
    ];

    notes.forEach((n) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = t0 + n.delay;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + n.d);
    });
  }

  public startBgm() {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;
    this.playBgmLoop();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
    this.bgmOscs.forEach((o) => {
      try { o.stop(); } catch {}
    });
    this.bgmOscs = [];
    this.bgmGains = [];
  }

  private playBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx || !this.masterGain) return;

    // Classic upbeat catchy 8-bit theme notes
    const melody = [
      // phrase 1
      { f: 659.25, d: 0.12, pause: 0.04 }, // E5
      { f: 659.25, d: 0.12, pause: 0.14 }, // E5
      { f: 659.25, d: 0.12, pause: 0.14 }, // E5
      { f: 523.25, d: 0.12, pause: 0.04 }, // C5
      { f: 659.25, d: 0.12, pause: 0.14 }, // E5
      { f: 783.99, d: 0.22, pause: 0.25 }, // G5
      { f: 392.00, d: 0.22, pause: 0.25 }, // G4
      // phrase 2
      { f: 523.25, d: 0.16, pause: 0.18 }, // C5
      { f: 392.00, d: 0.16, pause: 0.18 }, // G4
      { f: 329.63, d: 0.16, pause: 0.18 }, // E4
      { f: 440.00, d: 0.14, pause: 0.08 }, // A4
      { f: 493.88, d: 0.14, pause: 0.08 }, // B4
      { f: 466.16, d: 0.12, pause: 0.04 }, // Bb4
      { f: 440.00, d: 0.14, pause: 0.08 }, // A4
      { f: 392.00, d: 0.16, pause: 0.1 },  // G4
      { f: 659.25, d: 0.14, pause: 0.08 }, // E5
      { f: 783.99, d: 0.14, pause: 0.08 }, // G5
      { f: 880.00, d: 0.18, pause: 0.12 }, // A5
      { f: 698.46, d: 0.12, pause: 0.06 }, // F5
      { f: 783.99, d: 0.14, pause: 0.15 }, // G5
    ];

    let cursor = this.ctx.currentTime + 0.05;
    const bgmGainVal = this.isMuted ? 0 : 0.09;

    melody.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, cursor);

      gain.gain.setValueAtTime(bgmGainVal, cursor);
      gain.gain.exponentialRampToValueAtTime(0.001, cursor + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(cursor);
      osc.stop(cursor + note.d);

      this.bgmOscs.push(osc);
      this.bgmGains.push(gain);

      cursor += note.d + note.pause;
    });

    const loopDurationMs = (cursor - this.ctx.currentTime) * 1000;
    this.bgmTimeoutId = window.setTimeout(() => {
      if (this.isBgmPlaying) {
        this.playBgmLoop();
      }
    }, loopDurationMs);
  }
}

export const sound = new SoundEngine();
