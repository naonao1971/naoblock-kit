# 2D・3D の両方に、演出やルールを足す・直す（kit の道）

2D・3D で同じものは naoblock-kit に 1 回だけ書く。アプリ側は「kit の版の番号を上げる」「呼び出す 1〜2 行を足す」だけにする。

## 1. kit を直す（`~/dev/naoblock-kit`）

- ブランチを切る。部品の置き場所：
  - `src/sound.js` 効果音（2D の音・3D の音・共通の音）
  - `src/fx.js` 紙吹雪・コンボの文字・飛んでくる ♥・`popText`。見た目の CSS も JS から差し込む（アプリに CSS を書かせない）
  - `src/hearts.js` ♥ の決まりごと（出るタイミング・取ったときの結果）と、出し入れをまとめた `createHeartBonus`
  - `src/pdf.js` 組立図の PDF
  - 新しい部品は `src/` に足して、`kit.js` から export する
- **決まりごと（画面を使わない計算）は関数に分けて、`test/` にテストを足す**。`node --test test/*.test.mjs` が通ること
- 画面の部品は、手元の 2D・3D から読み込んで確かめる（下の 3）
- `kit.js` の `KIT_VERSION`・`CHANGELOG.md`・`README.md` の使い方をそろえる
- PR → なおながマージ → **main にタグを打つ**：`git tag 0.x.y && git push origin 0.x.y`
  - 出した番号は使い回さない（jsDelivr が古いものを覚えている）。直すときは次の番号
  - 確認：`curl -s https://cdn.jsdelivr.net/gh/naonao1971/naoblock-kit@0.x.y/kit.js | head -3`

## 2. 2D・3D の読み込み番号を上げる

- 2D：`src/kit.js` の `naoblock-kit@0.x.y`（＋版の番号を PR の番号に）
- 3D：`kit.js` の `naoblock-kit@0.x.y`
- 呼び出し側の変更は最小に。2D は `src/main.js`、3D は `game.html` の module script
- ルールが違うところ（例：2D の ♥ はタイムアタックだけ、3D はゲーム全部）は、アプリ側で呼ぶかどうかを決める。kit には入れない

## 3. 確かめる

- タグを打つ前に手元で試したいときは、アプリの `kit.js` の読み込み先を一時的にローカルの kit に向ける。そのときは kit とアプリを同じサーバー（同じ origin）から配る（別ポートだと CORS で止まる）。コミットの前に必ず戻す
- 2D・3D それぞれで、新しい演出が出ること・前からある演出（コンボ・紙吹雪・♥・音のオンオフ・PDF）が壊れていないこと・コンソールのエラー 0
- PR は 2D と 3D で 1 本ずつ。本文に kit の版と「確かめたこと」を書く
