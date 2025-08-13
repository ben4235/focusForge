import { fmtTime } from '../ui/dom';
import { Balance } from '../config/balance';

export type PomodoroState = 'Idle' | 'Focus' | 'Break' | 'Paused';

export class PomodoroFSM {
  state: PomodoroState = 'Idle';

  private secRemaining = 25 * 60;
  private focusLen = 25 * 60;
  private breakLen = 5 * 60;

  onTick: (secLeft: number) => void = () => {};
  onTransition: (to: PomodoroState) => void = () => {};
  onFocusComplete: () => void = () => {};

  /** minutes → seconds; call this when inputs change */
  setDurations(focusMin: number, breakMin: number) {
    this.focusLen = Math.max(1, Math.floor(focusMin)) * 60;
    this.breakLen = Math.max(1, Math.floor(breakMin)) * 60;
    if (this.state === 'Idle') this.secRemaining = this.focusLen;
  }

  startFocus() {
    this.state = 'Focus';
    this.secRemaining = this.focusLen;
    this.onTransition('Focus');
    this.onTick(this.secRemaining);
  }

  startBreak() {
    this.state = 'Break';
    this.secRemaining = this.breakLen;
    this.onTransition('Break');
    this.onTick(this.secRemaining);
  }

  pause() {
    if (this.state !== 'Paused') {
      this.state = 'Paused';
      this.onTransition('Paused');
    }
  }

  reset() {
    this.state = 'Idle';
    this.secRemaining = this.focusLen;
    this.onTransition('Idle');
    this.onTick(this.secRemaining);
  }

  /** dtSeconds must be in SECONDS, e.g. (now-last)/1000 */
  tick(dtSeconds: number) {
    if (this.state !== 'Focus' && this.state !== 'Break') return;
    if (dtSeconds <= 0) return;

    this.secRemaining = Math.max(0, this.secRemaining - dtSeconds);
    this.onTick(Math.ceil(this.secRemaining));

    if (this.secRemaining <= 0) {
      if (this.state === 'Focus') {
        this.onFocusComplete?.();
        this.startBreak();
      } else {
        // end Break → go Idle (or loop back to Focus in your UI)
        this.state = 'Idle';
        this.onTransition('Idle');
        this.onTick(this.focusLen);
      }
    }
  }
}


  private to(s: PomodoroState){
    this.state = s;
    this.onTransition(s);
  }

  static computePointsAward(focusSeconds:number, streak:number){
    // Baseline: basePoints per standard 25 minutes
    const baseline = Balance.basePointsPer25 * (focusSeconds/1500);
    const extra5 = Math.max(0, (focusSeconds - 1500)) / 300;
    const longScalar = 1 + Balance.longSessionScalarPer5Min * extra5;
    const streakScalar = 1 + (streak>0 ? Balance.streakBonusPct * streak : 0);
    return Math.round(baseline * longScalar * streakScalar);
  }
}
