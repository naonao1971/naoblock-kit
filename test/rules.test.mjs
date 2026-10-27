// node --test で動かす（画面を使わない決まりごとだけ）
import test from 'node:test';
import assert from 'node:assert/strict';
import { heartSchedule, catchHeart, heartsText } from '../src/hearts.js';
import { comboText } from '../src/fx.js';
import { comboFreq } from '../src/sound.js';

test('♥ は前半 15〜45%・後半 55〜90% に 1 回ずつ', () => {
  assert.deepEqual(heartSchedule(100, () => 0), [15, 55]);
  assert.deepEqual(heartSchedule(100, () => 1), [45, 90]);
  for (let i = 0; i < 200; i++) {
    const [a, b] = heartSchedule(77);
    assert.ok(a >= 12 && a <= 35 && b >= 42 && b <= 69 && a < b);
  }
});

test('ブロックが少なくても 1 個目より前には出ない', () => {
  assert.deepEqual(heartSchedule(2, () => 0), [1, 1]);
});

test('♥ を取ると 1 つ戻る、いっぱいなら bonus', () => {
  assert.deepEqual(catchHeart(1, 3), { lives: 2, bonus: 0, text: '♥ 復活！' });
  assert.deepEqual(catchHeart(3, 3), { lives: 3, bonus: 1, text: '♥ いっぱい！' });
  assert.equal(heartsText(1, 3), '♥♡♡');
});

test('コンボの文字は 3 回目から、5 で ✨、10 で 🔥', () => {
  assert.equal(comboText(2), '');
  assert.equal(comboText(3), '3コンボ！');
  assert.equal(comboText(5), '5コンボ！✨');
  assert.equal(comboText(12), '12コンボ！🔥');
});

test('コンボの音は 12 回で 1 オクターブ上、そこで止まる', () => {
  assert.equal(comboFreq(1), 520);
  assert.equal(Math.round(comboFreq(13)), 1040);
  assert.equal(comboFreq(30), comboFreq(13));
});
