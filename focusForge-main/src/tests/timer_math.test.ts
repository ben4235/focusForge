import { describe, it, expect } from 'vitest';
import { PomodoroFSM } from '../fsm/PomodoroFSM';

describe('Timer math', ()=>{
  it('transitions Focus -> Break -> Idle', ()=>{
    const f = new PomodoroFSM();
    f.setDurations(1,1); // 60s, 60s
    f.start();
    for(let i=0;i<60;i++) f.tick(1);
    expect(f.state).toBe('Break');
    for(let i=0;i<60;i++) f.tick(1);
    expect(f.state).toBe('Idle');
  });
});
