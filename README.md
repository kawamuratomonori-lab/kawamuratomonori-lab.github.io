# 河村研究室 ホームページ / Kawamura Lab Website

心臓リハビリテーション・理学療法の研究室「河村研究室（Kawamura Lab）」の公式サイトです。
GitHub Pages で完全無料で運用します。ビルド不要の静的HTML/CSSのみで構成されています。

## サイト構成

| ファイル | 内容 |
|---|---|
| `index.html` | ホーム（研究室紹介・お知らせ） |
| `research.html` | 研究内容 |
| `publications.html` | 業績（論文・受賞） |
| `members.html` | メンバー |
| `join.html` | 進学・共同研究をお考えの方へ |
| `contact.html` | お問い合わせ |
| `private.html` | 関係者用ページ（パスワード保護） |
| `css/style.css` | 共通スタイル（配色・書体は `:root` の変数で変更） |
| `js/site.js` | アニメーション（表示・リップル・上部へ戻るボタン） |
| `js/publications.js` | 業績ページを researchmap と同期する処理 |
| `js/private.js` | 関係者用ページの解錠処理 |
| `js/private-data.js` | 関係者用ページの本文（暗号化済み・自動生成） |
| `private/content.html` | 関係者用ページの本文（平文・**GitHubには公開されない**） |
| `tools/encrypt.py` | 本文を暗号化するスクリプト |
| `assets/favicon.svg` | ファビコン |

## 更新方法

このサイトの修正は Claude への指示で行います。例:

- 「お知らせに『○○学会で発表しました』を追加して」
- 「業績ページに新しい論文を追加して」（researchmapのURLやDOIを伝えると正確です）
- 「メンバーに大学院生の○○さんを追加して」

修正後は Claude に「GitHubに反映して」と伝えると、コミット＆プッシュで公開サイトに反映されます（反映まで1〜2分）。

## 公開手順（初回のみ）

1. **GitHubアカウントを作成**（無料）
   - https://github.com/signup をブラウザで開く
   - メールアドレス・パスワード・ユーザー名を登録
2. **リポジトリを作成**
   - https://github.com/new を開く
   - Repository name: `lab-hp`（任意の名前でOK）
   - Public を選択して「Create repository」
3. **Claude に「GitHubに公開して。ユーザー名は○○」と伝える**
   - Claude がプッシュと GitHub Pages の設定手順を案内します
4. 公開URL: `https://<ユーザー名>.github.io/lab-hp/`

※ 独自ドメインなしなら費用は一切かかりません。

## 業績ページの自動同期

`publications.html` の論文・受賞は、**researchmap の公開APIから自動で取得**しています。
researchmap を更新すれば、このサイトの業績も自動的に新しくなります（手動更新は不要）。

- 取得元: `https://api.researchmap.jp/t_kawamura/published_papers` と `.../awards`
- 論文は `languages` を見て英文・和文に振り分け、新しい順に並べます
- DOIがあるものは「DOI」ボタンから論文ページへ移動できます
- 通信できなかったときは、HTMLに書かれている内容がそのまま表示されます（真っ白にはなりません）

### 注意

- **researchmap側で「公開」にしている業績だけ**が表示されます
- 学会発表など他の項目も追加できます（`presentations` など。必要なら Claude に指示してください）
- researchmap の著者欄に和名と英名の両方を続けて登録している項目があると重複表示になるため、
  `js/publications.js` 側で自動的に取り除いています

## 関係者用ページ（パスワード保護）

`private.html` は、パスワードを知っている人だけが内容を見られるページです。

### しくみ

本文は **AES-256-GCM で暗号化** して `js/private-data.js` に保存されています。
正しいパスワードを入力したときだけ、ブラウザ上で復号されて表示されます。
暗号文だけを見ても内容は読めないため、GitHubで公開しても中身は守られます。

### できること・できないこと

- ページのソースを見ても本文は読めません（暗号化されているため）
- ただし**サーバー側の認証ではありません**。パスワードを知っている人は誰でも見られ、
  一度復号された内容はその人の手元に残ります
- **患者さんの個人情報やカルテ由来のデータは置かないでください。**
  そうしたデータは所属機関の規定に従った保管場所を使ってください

### 内容を更新する

1. `private/content.html` を編集する（Claude に指示すればOK）
2. 次のコマンドで暗号化し直す

```bash
LAB_PW='パスワード' python3 tools/encrypt.py
```

`private/content.html`（平文）は `.gitignore` で除外されているため、GitHubには公開されません。

### パスワードを変えたい

新しいパスワードで同じコマンドを実行するだけです。本文はそのままで構いません。
パスワードはこのリポジトリには保存していません（保存すると意味がなくなるため）。
忘れた場合も、上のコマンドで再設定できます。

## 運用メモ

- 日本語・英語併記ルール: 日本語の段落（`class="ja"`）の直後に英語の段落（`class="en"`）を置く
- お知らせは `index.html` の `news-list` に新しいものを上に追加する
- 業績の元データ: [researchmap](https://researchmap.jp/t_kawamura)
- 書体は**ゴシック体**（Zen Kaku Gothic New / Noto Sans JP）、英字は Roboto
- アニメーションは `prefers-reduced-motion` を設定している環境では自動的に無効になる
