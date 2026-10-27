---
name: naoblock
description: ナノブロック組立図アプリ（2D builder.naoblock.jp・3D builder-3d.naoblock.jp）に作品や遊びを足すスキル。「2Dにこの絵を足して」「このキャラを3Dにして」「実物を3D化」「2D・3Dの両方に◯◯を足して」「ゲームに演出を足して」「naoblock-kitの版を上げて」と言われたら使う。絵→パーツ分け→組立順→宙づりチェック→タブ追加→PR、共通の演出は kit で直して両アプリに配る。
---

# naoblock（ナノブロック組立図アプリに足す）

いまは**なおなおとちーちゃん用**（ほかの人向けのひな形はまだ無い）。作業は Mac の手元で行い、道具は `~/dev` の下にあるものを使う。

| 置き場所 | 中身 |
|---|---|
| `~/dev/naoblock-builder`（naonao1971/naoblock-builder） | 2D。https://builder.naoblock.jp |
| `~/dev/naoblock-builder-3d`（naonao1971/naoblock-builder-3d） | 3D。https://builder-3d.naoblock.jp |
| `~/dev/naoblock-kit`（naonao1971/naoblock-kit） | 2D・3D 共通の部品（音・紙吹雪・コンボ・飛んでくる♥・PDF）。jsDelivr のタグで配る |
| `~/dev/nano3d`（git なし・手元だけ） | 3D の作品づくりの道具（パーツ分け・宙づりチェック・サムネ）。Python は `.venv/bin/python` |

## 最初に：どの道か決める

頼まれごとを、次の 3 本のどれかに振り分けてから進める。迷ったら番号で聞く。

1. **2D に絵を足す**（ドット絵・キャラ絵・期間限定の絵）→ `references/add-2d.md`
2. **3D に作品を足す**（三面図・実物の写真・Nouns から立体に）→ `references/add-3d.md`
3. **2D・3D の両方に、演出やルールを足す・直す**（♥・コンボ・音・PDF など）→ `references/kit-change.md`

「2D だけ」「3D だけ」の画面の変更は、そのアプリのリポジトリで普通に直す。**2D・3D の両方に同じものを入れたくなったら、それは 3 の道**（片方ずつ書かない）。

## どの道でも守ること

- **ブランチを切って PR にする**。main に直接 push しない。マージはなおながする
- **PR の前に手元で遊んで確かめる**：`python3 -m http.server 87xx`（8765・8766 は yolo-chrome が使うので避ける）→ yolo-chrome で開く
  - Discord の bot から動かしているときは、yolo-chrome が最初の 1 回 `not connected` になりやすい。`/usr/sbin/lsof -nP -iTCP:8765` で ESTABLISHED を 15 秒ほど待ってから再試行する
  - 最後まで組む確認には、**手元だけの近道**（正解の場所にはめる関数を `window.__t` に一時的に足す、行末に `// TEMPTEST`）を使ってよい。コミットの前に `TEMPTEST` を消し、`grep` で残っていないことを確かめる
  - 確かめ終わったら、手元のサーバーと自分で開いたタブを閉じる
- **マージのあと、本番に出たことを確かめてから「出ました」と言う**（2D は画面の版の番号、3D は変えたファイルを curl で）
- 作品の素材の約束：Nouns は CC0。クリプト忍者・CNP は**非商用なら OK**。それ以外の絵は、なおなおに使ってよいか確かめる
- 説明は、なおなおに向けたやさしい日本語で。専門用語は言いかえる

## 2D の版の番号

2D は PR を出すたびに、版の番号を **その PR の番号**にする（`src/version.js` の `VERSION` と `index.html` の `<html data-version>` の両方）。PR の番号は `gh pr list -R naonao1971/naoblock-builder --state all -L 1` の次の番号。3D には版の番号はない。
