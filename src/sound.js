// 効果音（Web Audio でその場で鳴らす。音声ファイルは置かない）
// 2D 版の音（click・nope・stepDone・complete）と 3D 版の音（place・miss・layerDone・clear）の両方を持つ。
// combo・heart は 2D・3D 共通

const MUTE_KEY = 'naoblock:muted';
const OLD_3D_KEY = 'mininano-sound'; // 3D 版が前に使っていた名前（'on' / 'off'）

let ctx = null;
let muted = false;
try {
  const v = localStorage.getItem(MUTE_KEY);
  muted = v === null ? localStorage.getItem(OLD_3D_KEY) === 'off' : v === '1';
} catch { /* 保存できない環境では毎回鳴らす設定から */ }

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// 鳴らす準備：鳴らせるときだけ AudioContext と今の時刻を返す
function ready() {
  if (muted) return null;
  const ac = audio();
  return ac ? [ac, ac.currentTime] : null;
}

// タップのたびに呼ぶ（iOS はユーザー操作の中で鳴らし始める必要がある）
export function unlock() {
  if (!muted) audio();
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  try { localStorage.setItem(MUTE_KEY, value ? '1' : '0'); } catch { /* 無視 */ }
}

function noiseBurst(ac, t, { duration, freq, q, gain }) {
  const len = Math.ceil(ac.sampleRate * duration);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(t);
}

// attack は鳴り始めの立ち上がり（秒）。0 にすると、いきなりその音量から鳴る（3D 版の音）
function tone(ac, t, { freq, duration, gain, type = 'sine', attack = 0.005 }) {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = ac.createGain();
  if (attack > 0) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
  } else {
    g.gain.setValueAtTime(gain, t);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// コンボ n 回目の高さ。回数が増えるほど高くなる（12 回で 1 オクターブ上、そこで止まる）
export const comboFreq = (n) => 520 * Math.pow(2, Math.min(n - 1, 12) / 12);

// ---- 2D 版の音 ----

// パーツがはまる「カチッ」
export function click() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  noiseBurst(ac, t, { duration: 0.025, freq: 3200, q: 1.2, gain: 0.9 });
  tone(ac, t, { freq: 1900, duration: 0.03, gain: 0.08, type: 'square' });
  noiseBurst(ac, t + 0.028, { duration: 0.02, freq: 2200, q: 1.5, gain: 0.5 });
}

// 違う場所をタップしたとき（控えめ）
export function nope() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  tone(ac, t, { freq: 180, duration: 0.09, gain: 0.08, type: 'triangle' });
}

// ステップ完了
export function stepDone() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  [784, 1047].forEach((f, i) => tone(ac, t + i * 0.08, { freq: f, duration: 0.18, gain: 0.12 }));
}

// 全部完成
export function complete() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  [523, 659, 784, 1047].forEach((f, i) => tone(ac, t + i * 0.1, { freq: f, duration: 0.35, gain: 0.12 }));
}

// ---- 3D 版の音 ----

// はめたとき。n はコンボの回数（音が上がっていく）
export function place(n = 1) {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  const f = comboFreq(n);
  tone(ac, t, { freq: f * 2, duration: 0.05, gain: 0.08, type: 'square', attack: 0 });
  tone(ac, t, { freq: f, duration: 0.12, gain: 0.3, type: 'triangle', attack: 0 });
}

// ミス
export function miss() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  tone(ac, t, { freq: 180, duration: 0.18, gain: 0.12, type: 'sawtooth', attack: 0 });
  tone(ac, t + 0.1, { freq: 140, duration: 0.22, gain: 0.12, type: 'sawtooth', attack: 0 });
}

// 段クリア
export function layerDone() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  [660, 830, 990].forEach((f, i) => tone(ac, t + i * 0.07, { freq: f, duration: 0.18, gain: 0.22, type: 'triangle', attack: 0 }));
}

// 完成
export function clear() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(ac, t + i * 0.11, { freq: f, duration: i === 5 ? 0.6 : 0.2, gain: 0.25, type: 'triangle', attack: 0 }));
}

// ---- 共通 ----

// コンボが続くと、カチッに重ねて鳴らす音（2D 版。3D 版は place(n) が同じ上がり方をする）
export function combo(n) {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  tone(ac, t, { freq: comboFreq(n), duration: 0.12, gain: 0.1, type: 'triangle' });
}

// 飛んでくる ♥ を取ったとき
export function heart() {
  const r = ready(); if (!r) return;
  const [ac, t] = r;
  [880, 1175, 1568].forEach((f, i) => tone(ac, t + i * 0.07, { freq: f, duration: 0.2, gain: 0.12, type: 'triangle' }));
}
