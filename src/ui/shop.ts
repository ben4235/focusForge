import { $, setText } from './dom';
import { pickOne } from '../util/random';
import { UpgradeDef, UpgradePool } from '../config/upgrades';
import { Balance } from '../config/balance';

export type ShopState = {
  open: boolean;
  choices: UpgradeDef[];
  rerollCost: number;
}

export class ShopUI {
  state: ShopState = { open:false, choices:[], rerollCost: Balance.rerollBaseCost };
  constructor(private onChoose:(u:UpgradeDef)=>void){}

  open(points: number){
    this.state.open = true;
    this.state.choices = this.roll3();
    document.getElementById('shopPanel')?.setAttribute('aria-hidden', 'false');
    this.render(points);
  }

  close(){
    this.state.open = false;
    document.getElementById('shopPanel')?.setAttribute('aria-hidden', 'true');
  }

  private roll3(){
    const rng = Math.random; // not critical to be seeded here
    const c: UpgradeDef[] = [];
    while(c.length<3){
      const u = pickOne(rng, UpgradePool);
      if(!c.find(x=>x.id===u.id)) c.push(u);
    }
    return c;
  }

  bind(pointsRef: ()=>number, spend:(n:number)=>boolean){
    $('#closeShopBtn')?.addEventListener('click', ()=> this.close());
    $('#rerollBtn')?.addEventListener('click', ()=>{
      const cost = Math.floor(this.state.rerollCost);
      if(spend(cost)){
        this.state.rerollCost *= Balance.rerollCostScale;
        this.state.choices = this.roll3();
        this.render(pointsRef());
      }
    });
    this.render(pointsRef());
  }

  render(points: number){
    const host = document.getElementById('shopChoices')!;
    host.innerHTML = '';
    this.state.choices.forEach(u=>{
      const row = document.createElement('div');
      row.className = 'choice';
      const txt = document.createElement('div');
      txt.innerHTML = `<div class="name">${u.name}</div><div class="meta">${u.desc}</div>`;
      const buy = document.createElement('button');
      buy.className = 'btn';
      buy.textContent = `Buy (${u.cost})`;
      buy.disabled = points < u.cost;
      buy.addEventListener('click', ()=> this.onChoose(u));
      row.appendChild(txt);
      row.appendChild(buy);
      host.appendChild(row);
    });
    setText('gritBadge', `Points: ${Math.floor(points)}`);
  }
}
