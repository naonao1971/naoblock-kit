# 3D に作品を足す

3D の作品は「マスの立体（ボクセル）」→「ナノブロックのパーツに分ける」→「`plan_<名前>.js` とサムネ」→「タブに登録」の順で作る。道具は `~/dev/nano3d`（git なし）。Python はすべて `~/dev/nano3d/.venv/bin/python` で動かす。

## 1. 立体のデータ（ボクセル）を作る

入口は 3 つ。どれも最後は `{"H": 段数, "cubes": [[x, y, z, 色], ...]}` の JSON（`*_solid.json` / `model_*.json`）になる。x は正面から見て左→右、y は下から、z は 0 が正面。

| 入口 | やり方 | 見本 |
|---|---|---|
| キャラの三面図（前・横・後ろ） | `chars/make_sheet.py <フォルダ>` で三面図を 1 枚に並べ、`hull.py` で影絵から立体にする | `chars/nemu` `chars/xiaolan` |
| 実物の写真 | 1 段ずつバラして真上から撮ってもらい、段ごとの図を手で書き起こす（**写真から推測で決めない**。分からない段は撮ってもらう） | `mitama/make_model.py`・`mitama/README.md` |
| 形を直接描く | 段ごとの図や式で描く | `halloween/make_halloween.py` |

- 顔は共通の型（頭 6 マス・目は上白下黒の 2 段）を使う。キャラの作り直しの記録は `sample/build.py` の先頭の注にある
- ミニナノのケースに入る大きさ（14 段前後）を目安にする

## 2. パーツに分ける（下から組めるように）

```sh
cd ~/dev/nano3d
bricks/pipeline.sh <入力_solid.json> <タグ>        # 三面図から：太らせる→支えの手直し→パーツ分け→宙づりを削って解き直し
halloween/pipeline_hw.sh <入力_solid.json> <タグ>  # 形を直接描いたとき：太らせる工程なし
```

結果は `bricks/plan_C_<タグ>.json`。売っている形と色の制限（ピンク・肌色は 1×1・1×2 だけ等）は `decompose.py` が守る。L 字・T 字も使える。

## 3. 宙づりチェック（必須・ここを通らないと先に進まない）

```sh
.venv/bin/python bricks/check_build.py bricks/plan_C_<タグ>.json
```

- **「宙づり 0」でなければ PR にしない**。手で直したあとも、毎回かならずもう一度流す
  - 2026-10-25、咲耶（S10）を手直ししたあと check_build を流さず公開し、2 段目のピンク 1×1 が 2 個宙づりのまま出てしまった（かんさんの指摘で S11 に直した）
- 「4 ポチ以上で下に 1 ポチだけ」も、多ければ見直す
- パーツの数・色ごとの数も、ここで報告する

## 4. アプリ用のファイルを作る

```sh
.venv/bin/python sample/build.py plan_C_<タグ> plan_<名前>.js   # → sample/plan_<名前>.js
.venv/bin/python sample/make_thumbs.py                          # → sample/thumb_<名前>.png（CHARS に <名前>: plan_C_<タグ> を足してから）
```

できた `plan_<名前>.js` と `thumb_<名前>.png` を `~/dev/naoblock-builder-3d` にコピーする。

## 5. タブに登録する

`index.html` と `game.html` の **両方**にある `CHARS` に 1 行足す（片方だけだと、選べるのに遊べない）。

```js
{key: 'mitama', cat: 'cnp', name: 'ミタマ', file: 'plan_mitama'},
```

- `cat` はタブ（`ninja` `cnp` `halloween` …）。期間限定のタブは `until` を付ける
- 新しい色を使うときは、パレットに色があるか確かめる（ミタマでライトブルーを足した）

## 6. 遊んで確かめる → PR

- 組立ガイド：1 段ずつ見て、宙に浮いているパーツがないこと
- ゲーム：最後まで組めて完成画面が出ること（近道は `TEMPTEST`）、♥・コンボが出ること
- 印刷・PDF：段の図と部品リストが出ること
- 実物を組む予定なら、パーツの数と買い物リストをなおなおに伝える
