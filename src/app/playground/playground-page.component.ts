import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type Mode = 'amm' | 'interest' | 'marketmaking' | 'options' | 'il';

interface BusEvent {
  id: number;
  ts: number;
  t: number;         // sim tick
  mode: Mode;
  kind: string;      // e.g., 'amm.trade', 'interest.accrue', 'mm.fill'
  summary: string;   // human-readable
  payload?: string;  // compact JSON string (pretty printed)
};

@Component({
  selector: 'app-playground-page',
  templateUrl: './playground-page.component.html',
  styleUrls: ['./playground-page.component.scss'],
})
export class PlaygroundSimulatorComponent implements OnInit, OnDestroy {
  // ---- layout/state ----
  mode: Mode = 'amm';
  running = false;
  tick = 0;
  raf: number | null = null;

  // UI toggles
  showBus = true;
  showHelp = false;

  // ---- AMM state ----
  ammX = 1000;
  ammY = 1000;
  tradeSize = 10;
  amm = {
    type: 'cpmm' as 'cpmm' | 'weighted' | 'stable' | 'clamm',
    x: 1000,
    y: 1000,
    feeBps: 30,
    wx: 0.5,
    wy: 0.5,
    A: 200,
  };
  invariants = { k: 0 };
  // --- CLAMM (v3) state ---
  v3 = { tickSpacing: 60, currentTick: 0, tickLower: -600, tickUpper: 600, L: 50000 };

  // ---- Interest state ----
  principal = 1000;
  aprPct = 5; // % slider
  accrued = 0;
  interestMode: 'simple' | 'compound' = 'compound';
  horizonDays = 120;

  // ---- Lending/Borrowing (IR) state ----
  pool = { cash: 1000, borrows: 800, reserves: 10, reserveFactor: 0.1 };
  ir = { type: 'jump' as 'jump'|'linear'|'sigmoid', base: 0.01, kink: 0.8, slope1: 0.15, slope2: 0.6 };
  live = { U: 0, borrowAPR: 0, supplyAPR: 0 };

  // ---- Market making state ----
  mmMid = 100;
  mmSpread = 1; // %
  mmInventory = 0;
  mmLevels = 10;
  mmTick = 50; // bps
  book: { p:number; bid:number; ask:number; bidPct:number; askPct:number; bidFill:boolean; askFill:boolean }[] = [];

  // ---- Perps state ----
  perp = { side: 'long' as 'long' | 'short', entry: 100, qty: 1, leverage: 10, mmr: 0.006 };
  perpSubMode: 'ladder' | 'perps' = 'ladder';

  // ---- Options state ----
  opt = { type: 'call' as 'call'|'put', S: 100, K: 100, sigma: 0.6, T: 0.5, r: 0.02, xMax: 200 };
  optPrice = 0;
  optGreeks = { delta: 0, gamma: 0, theta: 0, vega: 0 };

  // ---- IL state ----
  il = { pRatio: 1.0, weight: '50_50' as '50_50' | '80_20' };
  ilValue = 0; // decimal (e.g., -0.057 = -5.7%)

  // ---- Drawing helpers ----
  paths: Record<string, string> = { ammCurve: '', interest: '', optPayoff: '', il: '', v3Ticks: '' };
  metrics: any = {};
  hover: { sx:number; sy:number; x:number; y:number } | null = null;
  sx = (x: number) => 48 + (x / this.xMax) * (390 - 48);
  sy = (y: number) => 220 - (y / this.yMax) * (220 - 36);
  private xMax = 2000;
  private yMax = 2000;

  // ---- Event bus ----
  private _id = 0;
  events: BusEvent[] = [];
  filters = { amm: true, interest: true, marketmaking: true, options: true, il: true };
  @ViewChild('timelineEl') timelineEl?: ElementRef<HTMLOListElement>;

  // ---- Chart references ----
  @ViewChild('ammChart') ammChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('interestChart') interestChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('optionsChart') optionsChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('ilChart') ilChartCanvas?: ElementRef<HTMLCanvasElement>;

  private ammChart?: Chart;
  private interestChart?: Chart;
  private optionsChart?: Chart;
  private ilChart?: Chart;

  ngOnInit(): void {
    this.recompute();
    this.regenBook();
    setTimeout(() => this.initCharts(), 100);
  }

  ngOnDestroy(): void {
    this.stop();
    this.destroyCharts();
  }

  private initCharts() {
    this.initAmmChart();
    this.initInterestChart();
    this.initOptionsChart();
    this.initILChart();
  }

  private destroyCharts() {
    this.ammChart?.destroy();
    this.interestChart?.destroy();
    this.optionsChart?.destroy();
    this.ilChart?.destroy();
  }

  // -------- Mode/UI --------
  setMode(m: Mode) {
    this.mode = m;
    this.log('ui.mode', `Switched to ${m}`, { mode: m });
    this.recompute();
  }
  toggleBus() { this.showBus = !this.showBus; }
  toggleHelp() { this.showHelp = !this.showHelp; }

  // -------- Simulation loop --------
  start() {
    if (this.running) return;
    this.running = true;
    this.log('sim.start', 'Simulation started');
    this.step();
  }
  stop() {
    this.running = false;
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.log('sim.pause', 'Simulation paused');
  }
  reset() {
    // AMM
    this.ammX = 1000; this.ammY = 1000;
    this.amm = { type: 'cpmm', x: 1000, y: 1000, feeBps: 30, wx:0.5, wy:0.5, A:200 };
    // Interest
    this.principal = 1000; this.accrued = 0; this.aprPct = 5; this.horizonDays = 120; this.interestMode = 'compound';
    // MM
    this.mmInventory = 0; this.mmMid = 100; this.mmSpread = 1; this.mmLevels = 10; this.mmTick = 50; this.regenBook();
    // Options
    this.opt = { type: 'call', S: 100, K: 100, sigma: 0.6, T: 0.5, r: 0.02, xMax: 200 };
    // IL
    this.il = { pRatio: 1.0, weight: '50_50' };
    // misc
    this.tick = 0;
    this.events = [];
    this.recompute();
    this.log('sim.reset', 'Reset all state');
  }
  toggle() { this.running ? this.stop() : this.start(); }
  stepOnce() { this.tick += 1; this.singleStep(); }

  private step = () => {
    if (!this.running) return;
    this.tick += 1;
    this.singleStep();
    this.raf = requestAnimationFrame(this.step);
  };

  private singleStep() {
    if (this.mode === 'amm') {
      const direction = Math.random() > 0.5 ? 'buy' : 'sell';
      const size = this.tradeSize * (0.5 + Math.random());
      const x0 = this.ammX, y0 = this.ammY, p0 = this.ammPrice;
      if (direction === 'buy') {
        const newX = x0 + size;
        const newY = (x0 * y0) / newX;
        this.ammX = newX; this.ammY = newY;
      } else {
        const newY = y0 + size;
        const newX = (x0 * y0) / newY;
        this.ammX = newX; this.ammY = newY;
      }
      this.amm.x = this.ammX; this.amm.y = this.ammY;
      this.computeAMM();
      const p1 = this.ammPrice;
      const slip = (p1 - p0) / (p0 || 1);
      this.log('amm.trade',
        `${direction.toUpperCase()} size ${size.toFixed(2)} → price ${p0.toFixed(6)} → ${p1.toFixed(6)} (slip ${(slip*100).toFixed(2)}%)`,
        { direction, size, x0, y0, x1: this.ammX, y1: this.ammY, p0, p1, slip });
    }
    else if (this.mode === 'interest') {
      const r = this.aprPct / 100;
      const daily = (this.interestMode === 'compound') ? (Math.pow(1 + r, 1 / 365) - 1) : (r / 365);
      const add = this.principal * daily;
      this.accrued += add;
      this.computeInterest();
      this.log('interest.accrue', `+${add.toFixed(4)} (mode ${this.interestMode})`, { daily, accrued: this.accrued });
    }
    else if (this.mode === 'marketmaking') {
      // random walk mid
      const move = (Math.random() - 0.5) * 0.5;
      const mid0 = this.mmMid;
      this.mmMid = Math.max(0.01, this.mmMid + move);

      // occasional fill
      if (Math.random() < 0.35) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const size = 1 + Math.floor(Math.random() * 5);
        this.mmInventory += side * size;
        const bestBid = this.book.filter(l => l.bid>0).slice(-1)[0];
        const bestAsk = this.book.find(l => l.ask>0);
        if (side > 0 && bestBid) bestBid.bidFill = true;
        if (side < 0 && bestAsk) bestAsk.askFill = true;
        this.log('mm.fill', `${side>0?'BID fill':'ASK fill'} of ${size}`, { inventory: this.mmInventory });
      }
      if (this.tick % 90 === 0) this.regenBook();
      this.log('mm.mid', `mid ${mid0.toFixed(2)} → ${this.mmMid.toFixed(2)}`, { mid0, mid1: this.mmMid });
    }
    else if (this.mode === 'options') {
      // tiny jitter on spot to make bus active in run mode
      const S0 = this.opt.S;
      this.opt.S = Math.max(0.01, this.opt.S + (Math.random() - 0.5) * 0.5);
      this.computeOptions();
      this.log('opt.reprice', `S ${S0.toFixed(2)} → ${this.opt.S.toFixed(2)} | Price ${this.optPrice.toFixed(4)}`, {
        S: this.opt.S, K: this.opt.K, price: this.optPrice, delta: this.optGreeks.delta
      });
    }
    else if (this.mode === 'il') {
      // tiny drift pRatio
      const p0 = this.il.pRatio;
      this.il.pRatio = Math.max(0.1, Math.min(3, this.il.pRatio + (Math.random() - 0.5) * 0.02));
      this.computeIL();
      this.log('il.update', `p ${p0.toFixed(3)} → ${this.il.pRatio.toFixed(3)} | IL ${(this.ilValue*100).toFixed(2)}%`,
        { p: this.il.pRatio, il: this.ilValue });
    }
  }

  // -------- Derived getters --------
  get ammPrice() { return this.ammX ? (this.ammY / this.ammX) : 0; }
  get mmBid()   { return this.mmMid * (1 - this.mmSpread/100); }
  get mmAsk()   { return this.mmMid * (1 + this.mmSpread/100); }

  // -------- Recompute by mode --------
  recompute() {
    if (this.mode === 'amm') this.computeAMM();
    if (this.mode === 'interest') {
      this.computeInterest();
      this.computeIRLearning();
    }
    if (this.mode === 'marketmaking') {
      this.regenBook();
      if (this.perpSubMode === 'perps') this.computePerps();
    }
    if (this.mode === 'options') this.computeOptions();
    if (this.mode === 'il') this.computeIL();
  }

  // -------- AMM math --------
  syncAmmReserves() { this.ammX = this.amm.x; this.ammY = this.amm.y; this.computeAMM(); }

  private weightedYFromX(k: number, x: number, wx: number, wy: number) {
    return Math.pow(k / Math.pow(x, wx), 1 / wy);
  }
  private stableLikeY(k:number, x:number, x0:number, y0:number, A:number) {
    const yCp = k / x;
    const sum = x0 + y0;
    const yBal = Math.max(1, sum - x);
    const dist = Math.abs(x - yCp);
    const alpha = Math.max(0, Math.min(1, 1 - Math.exp(-A * 1e-4) * Math.exp(-dist / (0.5*sum))));
    return alpha * yCp + (1 - alpha) * yBal;
  }

  private computeAMM() {
    const { type, x, y, wx, wy, A } = this.amm;
    const k = x * y;
    this.invariants.k = (type === 'weighted') ? Math.pow(x, wx) * Math.pow(y, wy) : k;

    const pts: {X:number, Y:number}[] = [];
    const Xmax = Math.max(x * 2.2, 1800);
    for (let X = 1; X <= Xmax; X += Xmax / 160) {
      let Y = 0;
      if (type === 'cpmm') Y = k / X;
      else if (type === 'weighted') Y = this.weightedYFromX(Math.pow(x, wx) * Math.pow(y, wy), X, wx, wy);
      else Y = this.stableLikeY(k, X, x, y, A);
      pts.push({ X, Y: Math.max(1, Math.min(Y, 5000)) });
    }
    this.xMax = Math.max(Xmax, x*2);
    this.yMax = Math.max(...pts.map(p => p.Y), y*2) * 1.05;

    // Update chart
    if (this.ammChart) {
      this.ammChart.data.labels = pts.map(p => p.X.toFixed(0));
      this.ammChart.data.datasets[0].data = pts.map(p => p.Y);
      this.ammChart.update('none');
    }

    // If CLAMM subtype, draw tick rails & compute v3 metrics
    if (this.amm.type === 'clamm') {
      this.drawClammRail();
    } else {
      this.paths.v3Ticks = '';
    }
  }

  // --- CLAMM helpers (didactic approximation) ---
  private tickToSqrtPrice(tick: number) {
    // 1.0001^(tick/2)
    return Math.pow(1.0001, tick / 2);
  }
  private sqrtPToPrice(sp: number) { return sp * sp; }

  private clammAmounts(L:number, sqrtP:number, sqrtPa:number, sqrtPb:number){
    if (sqrtP <= sqrtPa) {
      const amount0 = L * (sqrtPb - sqrtPa) / (sqrtPa * sqrtPb);
      return { amount0, amount1: 0 };
    } else if (sqrtP >= sqrtPb) {
      const amount1 = L * (sqrtPb - sqrtPa);
      return { amount0: 0, amount1 };
    } else {
      const amount0 = L * (sqrtPb - sqrtP) / (sqrtP * sqrtPb);
      const amount1 = L * (sqrtP - sqrtPa);
      return { amount0, amount1 };
    }
  }

  private drawClammRail() {
    const { tickSpacing, currentTick, tickLower, tickUpper, L } = this.v3;
    // draw a few ticks around currentTick
    const ticks: number[] = [];
    const rail = 12;
    for (let i=-rail; i<=rail; i++) ticks.push(currentTick + i * tickSpacing);

    const parts: string[] = [];
    for (const t of ticks) {
      const sp = this.tickToSqrtPrice(t);
      const P = this.sqrtPToPrice(sp);
      // map P to chart coordinates using same mapping used elsewhere
      const x = Math.max(48, Math.min(390, 48 + (P / this.xMax) * (390 - 48)));
      parts.push(`M ${x} ${36} L ${x} ${220}`);
    }
    this.paths.v3Ticks = parts.join(' ');

    // compute current amounts for the currentTick position
    const sP = this.tickToSqrtPrice(currentTick);
    const sPa = this.tickToSqrtPrice(tickLower);
    const sPb = this.tickToSqrtPrice(tickUpper);
    const { amount0, amount1 } = this.clammAmounts(L, sP, sPa, sPb);
    this.metrics = { ...(this.metrics||{}), v3Amount0: amount0, v3Amount1: amount1 };
  }

  onAmmHover(evt: MouseEvent) {
    if (this.mode!=='amm') return;
    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const sx = evt.clientX - rect.left;
    const sy = evt.clientY - rect.top;
    const x = ((sx - 48) / (390 - 48)) * this.xMax;
    const y = ((220 - sy) / (220 - 36)) * this.yMax;
    this.hover = { sx, sy, x: Math.max(0,x), y: Math.max(0,y) };
  }

  // -------- Interest --------
  private computeInterest() {
    const P = this.principal;
    const r = this.aprPct / 100;
    const horizon = Math.max(7, this.horizonDays);
    const pts: {d:number, bal:number}[] = [];
    for (let d=0; d<=horizon; d+= Math.max(1, Math.floor(horizon/160))) {
      const bal = (this.interestMode === 'compound')
        ? P * Math.pow(1 + r, d/365)
        : P * (1 + r * (d/365));
      pts.push({ d, bal });
    }
    const maxBal = Math.max(...pts.map(p=>p.bal));
    this.xMax = horizon;
    this.yMax = maxBal * 1.05;

    // Update chart
    if (this.interestChart) {
      this.interestChart.data.labels = pts.map(p => `Day ${p.d}`);
      this.interestChart.data.datasets[0].data = pts.map(p => p.bal);
      this.interestChart.update('none');
    }
  }

  // -------- Lending/Borrowing IR (Utilization Dynamics) --------
  private utilization() {
    const { cash, borrows, reserves } = this.pool;
    const denom = cash + borrows - reserves;
    return denom > 0 ? (borrows / denom) : 0;
  }

  private borrowAPR(u: number) {
    const { type, base, kink, slope1, slope2 } = this.ir;
    if (type === 'linear') return base + slope1 * u;
    if (type === 'sigmoid') return base + (slope2) / (1 + Math.exp(-10 * (u - 0.5)));
    if (u <= kink) return base + slope1 * (u / kink);
    return base + slope1 + slope2 * ((u - kink) / (1 - kink));
  }

  private supplyAPR(u: number, borrowAPR: number) {
    return borrowAPR * u * (1 - this.pool.reserveFactor);
  }

  applyPool(action: 'deposit' | 'withdraw' | 'borrow' | 'repay', amt: number) {
    if (action === 'deposit') this.pool.cash += amt;
    if (action === 'withdraw') this.pool.cash = Math.max(0, this.pool.cash - amt);
    if (action === 'borrow') {
      this.pool.borrows += amt;
      this.pool.cash = Math.max(0, this.pool.cash - amt);
    }
    if (action === 'repay') {
      const x = Math.min(amt, this.pool.borrows);
      this.pool.borrows -= x;
      this.pool.cash += x;
    }
    this.recompute();
    this.log('ir.move', `${action} ${amt}`, { ...this.pool });
  }

  private computeIRLearning() {
    const U = this.utilization();
    const b = this.borrowAPR(U);
    const s = this.supplyAPR(U, b);
    this.live = { U, borrowAPR: b, supplyAPR: s };

    // Build both curves (borrow & supply) for display
    const ptsBorrow: { u: number; y: number }[] = [];
    const ptsSupply: { u: number; y: number }[] = [];
    for (let i = 0; i <= 200; i++) {
      const u = i / 200;
      const bb = this.borrowAPR(u);
      const ss = this.supplyAPR(u, bb);
      ptsBorrow.push({ u, y: bb });
      ptsSupply.push({ u, y: ss });
    }

    // Store curves as path strings (will be rendered in SVG overlay or separate chart)
    this.paths['irBorrow'] = ptsBorrow.map((p, i) =>
      `${i ? 'L' : 'M'} ${48 + p.u * (390 - 48)} ${220 - (p.y / 1.0) * (220 - 36)}`
    ).join(' ');
    this.paths['irSupply'] = ptsSupply.map((p, i) =>
      `${i ? 'L' : 'M'} ${48 + p.u * (390 - 48)} ${220 - (p.y / 1.0) * (220 - 36)}`
    ).join(' ');
  }

  // -------- Market making --------
  regenBook() {
    const lv = Math.max(5, Math.min(30, this.mmLevels));
    const tickAbs = Math.max(0.0001, (this.mmTick/10000) * this.mmMid);
    const mid = this.mmMid;

    const ladder: typeof this.book = [];
    for (let i=lv; i>=1; i--){
      const p = +(mid - i * tickAbs).toFixed(4);
      const size = Math.round(60 + Math.random()*160);
      ladder.push({ p, bid: size, ask: 0, bidPct: 0, askPct: 0, bidFill: false, askFill: false });
    }
    ladder.push({ p: +mid.toFixed(4), bid: 0, ask: 0, bidPct:0, askPct:0, bidFill:false, askFill:false });
    for (let i=1; i<=lv; i++){
      const p = +(mid + i * tickAbs).toFixed(4);
      const size = Math.round(60 + Math.random()*160);
      ladder.push({ p, bid: 0, ask: size, bidPct: 0, askPct: 0, bidFill: false, askFill: false });
    }

    const maxBid = Math.max(...ladder.map(l=>l.bid));
    const maxAsk = Math.max(...ladder.map(l=>l.ask));
    ladder.forEach(l=>{
      l.bidPct = maxBid ? (l.bid/maxBid)*100 : 0;
      l.askPct = maxAsk ? (l.ask/maxAsk)*100 : 0;
      l.bidFill = false; l.askFill = false;
    });
    this.book = ladder;

    this.log('mm.rebuild', `Rebuilt ladder (lv=${lv}, tick=${this.mmTick}bps)`);
  }

  // -------- Perps / Leverage & Liquidation --------
  private perpLiqPrice() {
    const { side, entry, qty, leverage, mmr } = this.perp;
    const notional = entry * qty;
    const IM = notional / leverage; // initial margin
    // equity = IM + PnL; liquidation when equity <= mmr * (P*qty)
    if (side === 'long') {
      // IM + (P - entry)*qty = mmr * P * qty
      return (entry * qty - IM) / ((1 - mmr) * qty);
    } else {
      // IM + (entry - P)*qty = mmr * P * qty
      return (entry * qty + IM) / ((1 + mmr) * qty);
    }
  }

  private buildPerpPnLPath() {
    const { side, entry, qty } = this.perp;
    const xmin = entry * 0.4;
    const xmax = entry * 1.6;
    const pts: { x: number; y: number }[] = [];

    for (let P = xmin; P <= xmax; P += (xmax - xmin) / 200) {
      const pnl = (side === 'long') ? (P - entry) * qty : (entry - P) * qty;
      pts.push({ x: P, y: pnl });
    }

    const maxPnL = Math.max(Math.abs(pts[0].y), Math.abs(pts[pts.length - 1].y)) * 1.2;

    this.paths['perpPnL'] = pts.map((p, i) => {
      const sx = 48 + ((p.x - xmin) / (xmax - xmin)) * (390 - 48);
      const sy = 128 - (p.y / maxPnL) * 92; // center at 128, scale ±92 pixels
      return `${i ? 'L' : 'M'} ${sx} ${sy}`;
    }).join(' ');

    this.metrics = { ...(this.metrics || {}), liq: this.perpLiqPrice(), perpXmin: xmin, perpXmax: xmax };
  }

  computePerps() {
    this.buildPerpPnLPath();
  }

  // -------- Options (BSM) --------
  private erf(x:number){
    // Numerical approximation of erf from Abramowitz and Stegun (7.1.26)
    const sign = x >= 0 ? 1 : -1;
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const t = 1 / (1 + p * Math.abs(x));
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }
  private N(x:number){ return 0.5 * (1 + this.erf(x / Math.SQRT2)); }
  private n(x:number){ return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }
  private bsPrice(type:'call'|'put', S:number, K:number, r:number, sigma:number, T:number){
    const d1 = (Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*Math.sqrt(T));
    const d2 = d1 - sigma*Math.sqrt(T);
    if (type==='call') return S*this.N(d1) - K*Math.exp(-r*T)*this.N(d2);
    return K*Math.exp(-r*T)*this.N(-d2) - S*this.N(-d1);
  }
  private bsGreeks(type:'call'|'put', S:number, K:number, r:number, sigma:number, T:number){
    const d1 = (Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*Math.sqrt(T));
    const d2 = d1 - sigma*Math.sqrt(T);
    const delta = (type==='call') ? this.N(d1) : this.N(d1)-1;
    const gamma = this.n(d1)/(S*sigma*Math.sqrt(T));
    const vega = S*this.n(d1)*Math.sqrt(T);
    const theta = (-(S*this.n(d1)*sigma)/(2*Math.sqrt(T))) - (type==='call'
      ? r*K*Math.exp(-r*T)*this.N(d2)
      : -r*K*Math.exp(-r*T)*this.N(-d2));
    return { delta, gamma, theta, vega };
  }
  private computeOptions() {
    const { type, S, K, r, sigma, T, xMax } = this.opt;
    this.optPrice = this.bsPrice(type, S, K, r, sigma, T);
    this.optGreeks = this.bsGreeks(type, S, K, r, sigma, T);

    const pts: {x:number,y:number}[] = [];
    for (let x=0; x<=xMax; x+= xMax/200) {
      const y = (type==='call') ? Math.max(0, x - K) : Math.max(0, K - x);
      pts.push({ x, y });
    }
    this.yMax = Math.max(...pts.map(p=>p.y), S*0.6) * 1.2;
    this.xMax = xMax;

    // Update chart
    if (this.optionsChart) {
      this.optionsChart.data.labels = pts.map(p => p.x.toFixed(0));
      this.optionsChart.data.datasets[0].data = pts.map(p => p.y);
      this.optionsChart.update('none');
    }
  }

  // -------- Impermanent Loss --------
  private il50_50(p:number){ return (2*Math.sqrt(p)/(1+p)) - 1; }
  private il80_20(p:number){
    // Approximate IL for 80/20 Balancer-style: portfolio shares tilt the curve; heuristic blend
    const w = 0.8;
    const hodl = (w*p + (1-w));                     // value if HODL (linear in weights)
    const pool = (w*Math.sqrt(p) + (1-w)/Math.sqrt(p)); // proxy of AMM rebalancing
    return (pool / hodl) - 1;
  }
  private computeIL() {
    const f = (this.il.weight==='50_50') ? (p:number)=>this.il50_50(p) : (p:number)=>this.il80_20(p);
    const pts: {p:number, il:number}[] = [];
    for (let p=0.1; p<=3.0; p += (3.0-0.1)/200) pts.push({ p, il: f(p) });

    this.xMax = 3.0;
    this.yMax = Math.max(Math.abs(Math.min(...pts.map(p=>p.il))), Math.max(...pts.map(p=>p.il))) * 1.2;
    this.ilValue = f(this.il.pRatio);

    // Update chart
    if (this.ilChart) {
      this.ilChart.data.labels = pts.map(p => p.p.toFixed(2));
      this.ilChart.data.datasets[0].data = pts.map(p => p.il * 100); // Convert to percentage
      this.ilChart.update('none');
    }
  }

  // -------- Chart initialization --------
  private initAmmChart() {
    if (!this.ammChartCanvas) return;
    const ctx = this.ammChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.ammChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'AMM Curve',
          data: [],
          borderColor: '#77c1ff',
          backgroundColor: 'rgba(119, 193, 255, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#e8eef5' } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { title: { display: true, text: 'Reserve X', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } },
          y: { title: { display: true, text: 'Reserve Y', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } }
        }
      }
    });
  }

  private initInterestChart() {
    if (!this.interestChartCanvas) return;
    const ctx = this.interestChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.interestChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Balance Over Time',
          data: [],
          borderColor: '#35d0a3',
          backgroundColor: 'rgba(53, 208, 163, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#e8eef5' } }
        },
        scales: {
          x: { title: { display: true, text: 'Days', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } },
          y: { title: { display: true, text: 'Balance', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } }
        }
      }
    });
  }

  private initOptionsChart() {
    if (!this.optionsChartCanvas) return;
    const ctx = this.optionsChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.optionsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Payoff at Expiry',
          data: [],
          borderColor: '#77c1ff',
          backgroundColor: 'rgba(119, 193, 255, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#e8eef5' } }
        },
        scales: {
          x: { title: { display: true, text: 'Spot Price (ST)', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } },
          y: { title: { display: true, text: 'Payoff', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } }
        }
      }
    });
  }

  private initILChart() {
    if (!this.ilChartCanvas) return;
    const ctx = this.ilChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.ilChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Impermanent Loss',
          data: [],
          borderColor: '#9b6cff',
          backgroundColor: 'rgba(155, 108, 255, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#e8eef5' } }
        },
        scales: {
          x: { title: { display: true, text: 'Price Ratio (p)', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } },
          y: { title: { display: true, text: 'IL (%)', color: '#9aa4ad' }, ticks: { color: '#9aa4ad' }, grid: { color: '#2a3241' } }
        }
      }
    });
  }

  // -------- Event bus helpers --------
  private log(kind: string, summary: string, payload?: any) {
    const e: BusEvent = {
      id: ++this._id,
      ts: Date.now(),
      t: this.tick,
      mode: this.mode,
      kind,
      summary,
      payload: payload ? JSON.stringify(payload, null, 0) : undefined,
    };
    this.events.push(e);
    if (this.events.length > 500) this.events.shift();
    // autoscroll
    queueMicrotask(() => {
      if (!this.timelineEl) return;
      const el = this.timelineEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  filteredEvents() {
    return this.events.filter(e => {
      if (e.mode === 'amm' && !this.filters.amm) return false;
      if (e.mode === 'interest' && !this.filters.interest) return false;
      if (e.mode === 'marketmaking' && !this.filters.marketmaking) return false;
      if (e.mode === 'options' && !this.filters.options) return false;
      if (e.mode === 'il' && !this.filters.il) return false;
      return true;
    });
  }
}

// Export alias for backwards compatibility
export { PlaygroundSimulatorComponent as PlaygroundPageComponent };
