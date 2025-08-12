import { describe, it, expect } from 'vitest';
import { PomodoroFSM } from '../fsm/PomodoroFSM';

describe('PomodoroFSM', ()=>{
  it('awards only on full focus completion', ()=>{
    const f = new PomodoroFSM();
    f.setDurations(25,5);
    let awarded = 0;
    f.onFocusComplete = ()=>{ awarded++; };
    f.start();
    // simulate 25*60 seconds
    for(let i=0;i<25*60;i++) f.tick(1);
    expect(awarded).toBe(1);
  });

  it('computes points with streak and length scaling', ()=>{
    const pts25 = PomodoroFSM.computePointsAward(1500, 0);
    const pts30 = PomodoroFSM.computePointsAward(1800, 2);
    expect(pts30).toBeGreaterThan(pts25);
  });
});
