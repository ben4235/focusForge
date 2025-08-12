export const nowMs = () => performance.now();

export class FixedTimestep {
  private acc = 0;
  constructor(public dt: number){}
  step(elapsed: number, fn: (dt:number)=>void, maxSteps=5){
    this.acc += elapsed;
    let steps=0;
    while(this.acc >= this.dt && steps < maxSteps){
      fn(this.dt);
      this.acc -= this.dt;
      steps++;
    }
  }
  reset(){ this.acc = 0; }
}
