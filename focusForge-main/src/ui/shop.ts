import { $, setText } from './dom';
import { UpgradeDef, UpgradePool } from '../config/upgrades';
import { Balance } from '../config/balance';

export type ShopState = {
  open: boolean;
  choices: UpgradeDef[];
  rerollCost: number;
};

// Functions to get current points and attempt spending them
type GetPoints = () => number;
type TrySpend = (amount: number) => boolean;

export class ShopUI {
  state: ShopState = { open: false, choices: [], rerollCost: Balance.rerollBaseCost };
  private getPoints: GetPoints = () => 0;
  private trySpend: TrySpend = () => false;
  constructor(private onChoose: (u: UpgradeDef) => void) {}

  // Bind callbacks for retrieving and spending points
  bind(getPoints: GetPoints, trySpend: TrySpend) {
    this.getPoints = getPoints;
    this.trySpend = trySpend;
  }

  // Open the shop and roll fresh choices
  open(points?: number) {
    this.state.open = true;
    this.rollChoices();
    this.render(points ?? this.getPoints());
    document.getElementById('shop')?.classList.add('open');
  }

  // Close the shop and clear its contents
  close() {
    this.state.open = false;
    document.getElementById('shop')?.classList.remove('open');
    this.clearList();
  }

  // Pick 3 unique upgrades from the pool at random
  private rollChoices() {
    const pool = [...UpgradePool];
    const picks: UpgradeDef[] = [];
    while (picks.length < 3 && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    this.state.choices = picks;
  }

  private clearList() {
    const host = document.getElementById('shopList');
    if (host) host.innerHTML = '';
  }

  // Render the list of upgrade choices and the reroll button
  private render(points: number) {
    const host = document.getElementById('shopList');
    if (!host) return;
    this.clearList();
    this.state.choices.forEach((u) => {
      const row = document.createElement('div');
      row.className = 'shop-row';
      const txt = document.createElement('div');
      txt.className = 'shop-text';
      txt.innerHTML = `<div class="name">${u.name}</div><div class="meta">${u.desc}</div>`;
      const buy = document.createElement('button');
      buy.className = 'btn';
      buy.textContent = `Buy (${u.cost})`;
      buy.disabled = points < u.cost;
      buy.addEventListener('click', () => this.onChoose(u));
      row.appendChild(txt);
      row.appendChild(buy);
      host.appendChild(row);
    });
    const actions = document.getElementById('shopActions');
    if (actions) {
      actions.innerHTML = '';
      const reroll = document.createElement('button');
      reroll.className = 'btn secondary';
      const cost = Math.ceil(this.state.rerollCost);
      reroll.textContent = `Reroll (${cost})`;
      reroll.disabled = this.getPoints() < cost;
      reroll.addEventListener('click', () => {
        if (this.trySpend(cost)) {
          this.state.rerollCost *= Balance.rerollCostScale;
          this.rollChoices();
          this.render(this.getPoints());
        }
      });
      actions.appendChild(reroll);
    }
  }
}
