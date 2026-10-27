// ♥（のこり）と飛んでくる ♥ の決まりごと
// 前半に 1 回・後半に 1 回、ランダムな数だけはめたところで ♥ が画面を横切る。時間内にタップすると ♥ が 1 つ戻る
// ♥ がいっぱいのときは何も起きない（取った数だけ bonus として数えておく。将来の得点用）
import { flyHeart, confetti } from './fx.js';
import { heart as heartSound } from './sound.js';

// ♥ が出る範囲（全体のブロック数に対する割合）。前半・後半の 2 回
export const HEART_WINDOWS = [[0.15, 0.45], [0.55, 0.9]];

// ♥ を出す「はめた数」の一覧。rand は 0〜1 を返す関数（テストで差し替える）
export function heartSchedule(total, rand = Math.random) {
  return HEART_WINDOWS.map(([a, b]) => Math.max(1, Math.round((a + rand() * (b - a)) * total)));
}

// ♥ を取ったときの結果。lives は今の ♥ の数、max はいっぱいの数
export function catchHeart(lives, max) {
  return lives < max
    ? { lives: lives + 1, bonus: 0, text: '♥ 復活！' }
    : { lives, bonus: 1, text: '♥ いっぱい！' };
}

// ♥ の並び（♥♥♡ のような文字）
export const heartsText = (lives, max) => '♥'.repeat(lives) + '♡'.repeat(Math.max(0, max - lives));

// 飛んでくる ♥ の出し入れをまとめたもの
//   total   全体のブロック数
//   area    ♥ が横切る要素（盤面）
//   placed  途中から続けたときの、もうはめた数（過ぎた分は出さない）
//   onCatch(x, y)  ♥ を取ったとき。音と紙吹雪はこちらで出すので、♥ を増やす・文字を出すだけでよい
// check(placed) をはめるたびに呼ぶ。stop() で飛んでいる ♥ を消す（完成・ゲームオーバー・やり直し）
export function createHeartBonus({ total, area, placed = 0, onCatch, rand = Math.random }) {
  const at = heartSchedule(total, rand);
  let next = at.filter((n) => n <= placed).length;
  let stopFly = null;
  return {
    at,
    check(count) {
      if (next >= at.length || count < at[next]) return false;
      next++;
      stopFly = flyHeart(area, (x, y) => {
        stopFly = null;
        if (onCatch(x, y) === false) return; // 終わったあとなど、取っても何もしないとき
        heartSound();
        confetti(x, y, 30, 0.8);
      });
      return true;
    },
    stop() {
      stopFly?.();
      stopFly = null;
    },
  };
}
