# naoblock-kit

ナノブロック組立図アプリ（[2D](https://builder.naoblock.jp) ・ [3D](https://builder-3d.naoblock.jp)）の共通部品です。
2D・3D で同じ演出やルールを 2 回書かないように、ここ 1 か所にまとめています。ビルドは不要です（素の ES Modules）。

| 部品 | 内容 |
|---|---|
| `sound` | 効果音（Web Audio、音声ファイルなし）とミュートの保存。2D の音（`click` `nope` `stepDone` `complete`）、3D の音（`place(n)` `miss` `layerDone` `clear`）、共通の `combo(n)` `heart()` |
| 演出 | `confetti(x, y, 枚数, 勢い)` 紙吹雪、`showCombo(el, n)`「◯コンボ！」、`popText(el, 文字)`、`flyHeart(盤面, onCatch)` 飛んでくる ♥ |
| ♥ | `createHeartBonus({ total, area, placed, onCatch })` 前半・後半に 1 回ずつ ♥ を飛ばす。`catchHeart(のこり, 最大)` 取ったときの結果、`heartsText` |
| PDF | `buildPdf(pages)` JPEG を 1 ページ 1 枚の A4 PDF に（外部ライブラリなし）、`dataUrlBytes` |

## 使い方

```js
import { sound, showCombo, createHeartBonus, catchHeart } from 'https://cdn.jsdelivr.net/gh/naonao1971/naoblock-kit@0.1.0/kit.js';

let lives = 3, bonus = 0;
const hearts = createHeartBonus({
  total: 120,                       // 全体のブロック数
  area: document.querySelector('#board'),
  onCatch() {
    const r = catchHeart(lives, 3);
    lives = r.lives; bonus += r.bonus;
    toast(r.text);
  },
});

// はめるたびに
combo++;
sound.place(combo);
showCombo(comboEl, combo);
hearts.check(placedCount);
// 完成・ゲームオーバー・やり直しのとき
hearts.stop();
```

## 版の上げ方

1. `kit.js` の `KIT_VERSION` と `CHANGELOG.md` をそろえる
2. `node --test test/*.test.mjs` が通ること
3. main にマージしてから、同じ番号のタグを打つ（`git tag 0.1.1 && git push --tags`）
4. 2D・3D の読み込み先の番号を上げる PR を出す

タグを付け直すと jsDelivr に古いものが残るので、出した番号は使い回さず、直すときは次の番号にします。
