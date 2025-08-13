export class AudioGate {
  private audioCtx: AudioContext | null = null;
  private unlocked = false;
  private chimeBuf: AudioBuffer | null = null;

  async unlock(){
    if(this.unlocked) return;
    if(!this.audioCtx){
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Make a tiny silent buffer to unlock
    const ctx = this.audioCtx!;
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination); src.start(0);
    this.unlocked = true;
  }

  async loadChime(){
    if(!this.audioCtx) await this.unlock();
    // Generate a simple synthesized chime instead of loading a file (works offline)
    const ctx = this.audioCtx!;
    // We synthesize when playing instead of preloading a file
    return true;
  }

  playChime(){
    if(!this.audioCtx || !this.unlocked) return;
    const ctx = this.audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.001;
    o.connect(g).connect(ctx.destination);
    o.start();
    // simple ding envelope
    const t = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.stop(t + 0.6);
  }
}
