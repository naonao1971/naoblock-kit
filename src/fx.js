// 盛り上げの演出：紙吹雪・コンボの表示・飛んでくる ♥
// 見た目の CSS もここで差し込むので、使う側は CSS を書かなくてよい（.combo の位置と色だけは各アプリで決める）
const COLORS = ['#e65f91', '#ffcf4a', '#5bc0eb', '#7bd389', '#b28dff', '#ff8a5b'];
const CSS = `
.nk-fx { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20; }
.fly-heart {
  position: fixed; left: 0; top: 0; width: 56px; height: 56px; padding: 0; border: 0; background: none;
  font-size: 44px; line-height: 56px; cursor: pointer; z-index: 15; touch-action: none;
  filter: drop-shadow(0 0 8px #ff8fb1);
  animation: nk-heart-beat 0.5s ease-in-out infinite alternate;
}
@keyframes nk-heart-beat { to { font-size: 52px; filter: drop-shadow(0 0 14px #ff5c8a); } }
`;

let styled = false;
function ensureStyle() {
  if (styled) return;
  styled = true;
  const st = document.createElement('style');
  st.dataset.naoblockKit = '';
  st.textContent = CSS;
  document.head.appendChild(st);
}

const bits = [];
let canvas = null;
let ctx = null;
let running = false;

function ensureCanvas() {
  if (canvas) return;
  ensureStyle();
  canvas = document.createElement('canvas');
  canvas.className = 'nk-fx';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
}

function frame() {
  const dpr = window.devicePixelRatio || 1;
  const w = innerWidth, h = innerHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i];
    b.vy += 0.18; b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life -= 0.008;
    if (b.life <= 0 || b.y > h + 20) { bits.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.min(1, b.life * 2);
    ctx.translate(b.x, b.y);
    ctx.rotate(b.r);
    ctx.fillStyle = b.c;
    ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
    ctx.restore();
  }
  // 紙が全部消えたら止める（ずっと描き続けない）
  if (bits.length) requestAnimationFrame(frame);
  else { running = false; ctx.clearRect(0, 0, w, h); }
}

// (x, y) は画面の座標（clientX/Y と同じ）。n は枚数、power は飛ぶ勢い
export function confetti(x, y, n, power = 1) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensureCanvas();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 5) * power;
    bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4 * power, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 5 + Math.random() * 5, c: COLORS[i % COLORS.length], life: 1 });
  }
  if (!running) { running = true; requestAnimationFrame(frame); }
}

// 要素の真ん中の画面座標
export const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

// 要素に文字を入れて、.pop のアニメーションを頭から流し直す
export function popText(el, text) {
  el.textContent = text;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// 「◯コンボ！」の文字。3 回目から。5 で ✨、10 で 🔥。2 回目までは ''
export const comboText = (n) => (n < 3 ? '' : `${n}コンボ！` + (n >= 10 ? '🔥' : n >= 5 ? '✨' : ''));

// 「◯コンボ！」をポンと出す
export function showCombo(el, n) {
  if (n >= 3) popText(el, comboText(n));
}

// 飛んでくる ♥：画面を横切る ♥ を、時間内にタップしたら onCatch(x, y)。取りのがしたら消えておしまい
// area は飛ぶ範囲の要素（盤面）。戻り値は、途中で消すための関数
export function flyHeart(area, onCatch, ms = 3200) {
  ensureStyle();
  const r = area.getBoundingClientRect();
  const fromLeft = Math.random() < 0.5;
  const size = 56;
  const x0 = fromLeft ? r.left - size : r.right;
  const x1 = fromLeft ? r.right : r.left - size;
  const y0 = r.top + r.height * (0.25 + Math.random() * 0.4);
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'fly-heart';
  el.textContent = '❤️';
  el.setAttribute('aria-label', '♥ をタップして取る');
  document.body.appendChild(el);
  const t0 = performance.now();
  let done = false;
  const end = () => { done = true; el.remove(); };
  const step = (now) => {
    if (done) return;
    const p = (now - t0) / ms;
    if (p >= 1) { end(); return; }
    const x = x0 + (x1 - x0) * p, y = y0 + Math.sin(p * Math.PI * 4) * 24;
    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  // 盤面のタップとして扱われないよう、ここで止める
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (done) return;
    const b = el.getBoundingClientRect();
    end();
    onCatch(b.left + b.width / 2, b.top + b.height / 2);
  });
  return end;
}
