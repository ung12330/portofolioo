class PlanetScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.t      = 0;
    this.moons  = [
      { a: 170, b: 42, angle: 0.4,   speed: 0.008, r: 22, phase: 0   },
      { a: 220, b: 55, angle: 2.4,   speed: 0.005, r: 14, phase: 1.2 },
      { a: 130, b: 32, angle: 1.1,   speed: 0.013, r: 9,  phase: 2.4 },
    ];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    const el = this.canvas.parentElement;
    this.W = this.canvas.width  = el.offsetWidth  * window.devicePixelRatio;
    this.H = this.canvas.height = el.offsetHeight * window.devicePixelRatio;
    this.canvas.style.width  = el.offsetWidth  + 'px';
    this.canvas.style.height = el.offsetHeight + 'px';
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.R  = Math.min(this.W, this.H) * 0.22;
    this._buildPlanetGfx();
  }

  /* ── Pre-render planet surface once ── */
  _buildPlanetGfx() {
    const r = this.R;
    const d = Math.ceil(r * 2 + 20);
    const oc = document.createElement('canvas');
    oc.width = oc.height = d;
    const ox = d / 2, oy = d / 2;
    const g = oc.getContext('2d');

    // Base gradient (warm gold/amber planet)
    const base = g.createRadialGradient(ox - r * 0.28, oy - r * 0.28, r * 0.05, ox, oy, r);
    base.addColorStop(0,   '#ffd740');
    base.addColorStop(0.35,'#f0a800');
    base.addColorStop(0.65,'#c07200');
    base.addColorStop(0.88,'#7a3e00');
    base.addColorStop(1,   '#3d1800');
    g.beginPath();
    g.arc(ox, oy, r, 0, Math.PI * 2);
    g.fillStyle = base;
    g.fill();

    // Surface bands (atmospheric stripes)
    const bands = [
      { y: -0.55, h: 0.12, a: 0.07 },
      { y: -0.30, h: 0.08, a: 0.09 },
      { y: -0.05, h: 0.14, a: 0.06 },
      { y:  0.22, h: 0.09, a: 0.08 },
      { y:  0.45, h: 0.10, a: 0.07 },
    ];
    bands.forEach(b => {
      g.save();
      g.beginPath();
      g.arc(ox, oy, r, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = `rgba(255,200,100,${b.a})`;
      g.fillRect(ox - r, oy + b.y * r, r * 2, b.h * r * 2);
      g.restore();
    });

    // Dark band swirls
    [[-0.42, 0.06], [0.08, 0.05], [0.38, 0.07]].forEach(([y, h]) => {
      g.save();
      g.beginPath();
      g.arc(ox, oy, r, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = `rgba(60,20,0,0.13)`;
      g.fillRect(ox - r, oy + y * r, r * 2, h * r * 2);
      g.restore();
    });

    // Craters
    const craters = [
      { x: -0.30, y: -0.25, r: 0.09 },
      { x:  0.18, y:  0.30, r: 0.065},
      { x: -0.08, y:  0.45, r: 0.05 },
      { x:  0.35, y: -0.10, r: 0.055},
      { x: -0.40, y:  0.18, r: 0.04 },
    ];
    craters.forEach(c => {
      const cx2 = ox + c.x * r, cy2 = oy + c.y * r, cr = c.r * r;
      // Check inside planet
      const dist = Math.sqrt((cx2 - ox) ** 2 + (cy2 - oy) ** 2);
      if (dist + cr > r * 0.92) return;

      // Shadow arc
      g.beginPath();
      g.arc(cx2, cy2, cr, 0, Math.PI * 2);
      g.fillStyle = 'rgba(40,10,0,0.35)';
      g.fill();
      // Rim highlight
      g.beginPath();
      g.arc(cx2 - cr * 0.15, cy2 - cr * 0.15, cr * 0.8, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(255,200,100,0.18)';
      g.lineWidth = cr * 0.2;
      g.stroke();
    });

    // Specular highlight
    const spec = g.createRadialGradient(ox - r * 0.38, oy - r * 0.38, r * 0.02, ox - r * 0.3, oy - r * 0.3, r * 0.55);
    spec.addColorStop(0,   'rgba(255,245,200,0.42)');
    spec.addColorStop(0.6, 'rgba(255,220,130,0.07)');
    spec.addColorStop(1,   'rgba(255,200,80,0)');
    g.save();
    g.beginPath();
    g.arc(ox, oy, r, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = spec;
    g.fill();
    g.restore();

    // Terminator shadow (dark side)
    const term = g.createRadialGradient(ox + r * 0.45, oy + r * 0.1, r * 0.3, ox + r * 0.7, oy, r * 0.9);
    term.addColorStop(0,   'rgba(0,0,0,0)');
    term.addColorStop(0.5, 'rgba(0,0,0,0.25)');
    term.addColorStop(1,   'rgba(0,0,0,0.72)');
    g.save();
    g.beginPath();
    g.arc(ox, oy, r, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = term;
    g.fill();
    g.restore();

    // Atmosphere rim glow
    const atm = g.createRadialGradient(ox, oy, r * 0.88, ox, oy, r * 1.0);
    atm.addColorStop(0,   'rgba(255,180,40,0)');
    atm.addColorStop(0.7, 'rgba(255,160,30,0.18)');
    atm.addColorStop(1,   'rgba(255,140,20,0.38)');
    g.save();
    g.beginPath();
    g.arc(ox, oy, r, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = atm;
    g.fill();
    g.restore();

    this._planetImg = oc;
    this._planetR   = r;
    this._planetOff = d;
  }

  /* ── Draw ring system ── */
  _drawRings(behind) {
    const { ctx, cx, cy, R } = this;
    const rings = [
      { rx: R * 1.55, ry: R * 0.22, lw: R * 0.18, alpha: 0.13, color: 'rgba(245,200,66,' },
      { rx: R * 1.90, ry: R * 0.28, lw: R * 0.10, alpha: 0.08, color: 'rgba(230,170,50,' },
      { rx: R * 2.20, ry: R * 0.32, lw: R * 0.06, alpha: 0.05, color: 'rgba(255,210,80,' },
    ];
    ctx.save();
    const floatOff = Math.sin(this.t * 0.4) * 10;
    ctx.translate(cx, cy + floatOff);

    rings.forEach(ring => {
      // Behind: only lower arc. Front: only upper arc
      ctx.beginPath();
      if (behind) {
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI); // lower half
      } else {
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, Math.PI, Math.PI * 2); // upper half
      }
      ctx.strokeStyle = ring.color + ring.alpha + ')';
      ctx.lineWidth   = ring.lw;
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ── Draw a moon ── */
  _drawMoon(moon, floatOff) {
    const { ctx, cx, cy } = this;
    const mx = cx + moon.a * Math.cos(moon.angle);
    const my = cy + floatOff + moon.b * Math.sin(moon.angle);
    const r  = moon.r;

    // Moon body
    const g = ctx.createRadialGradient(mx - r * 0.3, my - r * 0.3, r * 0.05, mx, my, r);
    g.addColorStop(0,   '#8a90b0');
    g.addColorStop(0.5, '#4a4f68');
    g.addColorStop(1,   '#1a1f2e');
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Shadow
    const sh = ctx.createRadialGradient(mx + r * 0.4, my + r * 0.1, r * 0.2, mx + r * 0.5, my, r * 0.8);
    sh.addColorStop(0,   'rgba(0,0,0,0)');
    sh.addColorStop(1,   'rgba(0,0,0,0.65)');
    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = sh;
    ctx.fill();
    ctx.restore();

    // Highlight
    ctx.beginPath();
    ctx.arc(mx - r * 0.25, my - r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180,190,220,0.18)';
    ctx.fill();
  }

  /* ── Outer glow ── */
  _drawGlow(floatOff) {
    const { ctx, cx, cy, R } = this;
    const glow = ctx.createRadialGradient(cx, cy + floatOff, R * 0.8, cx, cy + floatOff, R * 2.2);
    glow.addColorStop(0,   'rgba(245,185,40,0.12)');
    glow.addColorStop(0.5, 'rgba(245,160,30,0.05)');
    glow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy + floatOff, R * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }

  animate() {
    const { ctx, W, H, cx, cy, R } = this;
    ctx.clearRect(0, 0, W, H);
    this.t += 0.016;

    const floatOff = Math.sin(this.t * 0.42) * (R * 0.09);

    // Update moon angles
    this.moons.forEach(m => { m.angle += m.speed; });

    // Outer glow
    this._drawGlow(floatOff);

    // Ring behind planet
    this._drawRings(true);

    // Moons behind (those in lower half of ellipse)
    this.moons.forEach(m => {
      if (Math.sin(m.angle) >= 0) this._drawMoon(m, floatOff);
    });

    // Planet
    const d = this._planetOff;
    ctx.save();
    ctx.translate(cx, cy + floatOff);
    ctx.drawImage(this._planetImg, -d / 2, -d / 2);
    ctx.restore();

    // Ring in front
    this._drawRings(false);

    // Moons in front
    this.moons.forEach(m => {
      if (Math.sin(m.angle) < 0) this._drawMoon(m, floatOff);
    });

    requestAnimationFrame(() => this.animate());
  }
}
