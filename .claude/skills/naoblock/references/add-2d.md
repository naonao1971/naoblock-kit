# 2D に絵を足す

2D の絵は「40×40 マス以下のドット絵の PNG」1 枚と、`src/subjects.js` の 1 行でできる。パーツ割り・組立順・ゲーム・PDF・ランキングは、絵から自動で作られる。

## 1. 絵を用意する

- 置き場所：`data/samples/<名前>.png`（名前は英小文字とハイフン。URL の `?pic=<名前>` になる）
- 背景は**透明**にする（白いブロックも使えるように）。左上の 1 ピクセルが透明なら、透明なところだけが背景になる
- **ナノブロックの色だけ**で描く。色の表は `src/palette.js`（`BLOCK_COLORS`）。表にない色は、いちばん近い色に置きかわる
- 40 マスより細かい絵を渡されたら、40 マスに落としてから、なおなおに見せる（目・口などの細部がつぶれやすい）
- 絵を Python で描くときの見本：`tools/halloween_draft.py`（色の記号 → 40×40 のマス → PNG）

## 2. 登録する

`src/subjects.js` の `PICTURES` に 1 行足す。

```js
'ninja-jin': { file: 'data/samples/ninja-jin.png', label: '刃', category: 'ninja' },
```

- `category` は `CATEGORIES` の `input: 'cards'` のどれか（`ninja` `cnp` `halloween` …）。新しいタブが要るときは `CATEGORIES` にも足す
- 期間限定のタブ：`CATEGORIES` に `until: 'YYYY-MM-DD'`（その日が終わったらタブを出さない）。1 体ずつ出すなら、絵に `from: 'YYYY-MM-DD'`
- スタート画面のカードは自動でできる

## 3. 検算する

```sh
node tools/check.mjs --subjects   # 題材の名前・保存名・シェア文面
```

パーツ割りがおかしくないかは、手元のサーバーで `?pic=<名前>` を開いて「組立図」タブで見る。

## 4. 遊んで確かめる → PR

- れんしゅう・タイムアタックの両方で、最後まで組めて完成画面が出ること、コンソールのエラーが 0 であること
- 版の番号を PR の番号にそろえる（SKILL.md の「2D の版の番号」）
- PR の本文に「変わること」「確かめたこと」を書く
