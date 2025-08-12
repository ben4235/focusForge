import { fmtTime } from '../ui/dom';
import { Balance } from '../config/balance';

export type PomodoroState = 'Idle' | 'Focus' | 'Break' | 'Paused';

export class PomodoroFSM {
  state: PomodoroState = 'Idle';
  private secRemaining = 25*60;
  private focusLen = 25*60;
  private breakLen = 5*60;
  streak = 0;

  onTick: (secLeft:number)=>void = ()=>{};
  onTransition: (to:PomodoroState)=>void = ()=>{};
  onFocusComplete: ()=>void = ()=>{};

  setDurations(focusMin:number, breakMin:number){
    this.focusLen = Math.max(60, focusMin*60);
    this.breakLen = Math.max(30, breakMin*60);
    if(this.state==='Idle'){ this.secRemaining = this.focusLen; }
  }

  get remaining(){ return this.secRemaining; }

  start(){
    if(this.state==='Idle' || this.state==='Break'){
      if(this.state==='Idle') this.secRemaining = this.focusLen;
      this.to('Focus');
    }else if(this.state==='Paused'){
      // no auto-resume; explicit start acts as resume
      this.to('Focus');
    }
  }

  pause(){
    if(this.state==='Focus' || this.state==='Break'){
      this.to('Paused');
    }
  }

  reset(){
    this.to('Idle');
    this.secRemaining = this.focusLen;
  }

  tick(dt:number){
    if(this.state!=='Focus' && this.state!=='Break') return;
    this.secRemaining -= dt;
    if(this.secRemaining <= 0){
      if(this.state==='Focus'){
        this.onFocusComplete();
        this.streak += 1;
        this.to('Break');
        this.secRemaining = this.breakLen;
      }else if(this.state==='Break'){
        this.to('Idle');
        this.secRemaining = this.focusLen;
      }
    }
    this.onTick(this.secRemaining);
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
