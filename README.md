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
| `js/analytics.js` | アクセス数の集計（初期状態では動作しない・下記参照） |
| `tools/refresh_publications.py` | 業績の「保存済み一覧」を最新化するスクリプト |
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

## 公開情報

- GitHubアカウント: `kawamuratomonori-lab`
- リポジトリ名: `kawamuratomonori-lab.github.io`
- 公開URL: **https://kawamuratomonori-lab.github.io/**

費用は一切かかりません。

**GitHub Pages の有効化（初回のみ・手動）**

リポジトリを作成しただけでは公開されません。次の設定が必要です。

1. https://github.com/kawamuratomonori-lab/kawamuratomonori-lab.github.io/settings/pages を開く
2. 「Build and deployment」の **Source** を **Deploy from a branch** にする
3. **Branch** を `main` ／ フォルダを `/ (root)` にして **Save**
4. 1〜2分待つと上記URLで表示される

## 公開手順（初回のみ・GitHub Desktop）

1. **GitHub Desktop をインストール** — https://desktop.github.com/
2. アプリを開き、GitHubアカウント `kawamuratomonori-lab` でサインイン
3. メニューの **File → Add Local Repository** で、このフォルダ（`Lab_HP`）を選ぶ
4. **Publish repository** ボタンを押す
5. 表示されたダイアログで
   - **Name を `kawamuratomonori-lab.github.io` に書き換える**
     （初期値はフォルダ名の `Lab_HP` になっているので必ず変更する）
   - **「Keep this code private」のチェックを外す**（無料公開に必要）
6. **Publish repository** を押す
7. 上の「GitHub Pages の有効化」を行う（これをしないと404になる）

以降の更新は Claude に「GitHubに反映して」と伝えるだけで反映されます。

## 業績ページの自動同期

`publications.html` の論文・受賞は、**researchmap の公開APIから自動で取得**しています。
researchmap を更新すれば、このサイトの業績も自動的に新しくなります（手動更新は不要）。

- 取得元: `https://api.researchmap.jp/t_kawamura/published_papers` と `.../awards`
- 論文は `languages` を見て英文・和文に振り分け、新しい順に並べます
- DOIがあるものは「DOI」ボタンから論文ページへ移動できます
- 通信できなかったときは、HTMLに書かれている内容がそのまま表示されます（真っ白にはなりません）

### 通信できなかったときの表示

researchmap のAPIは、ときどき接続が切れて応答しないことがあります（researchmap側の事情）。
そのため次の二段構えにしています。

1. ページを開くと researchmap に問い合わせる（失敗しても最大3回まで再試行）
2. それでも取得できないときは、HTMLに書かれている**保存済みの一覧**をそのまま表示する

この「保存済みの一覧」も古くならないよう、ときどき次のコマンドで更新してください
（Claude に「業績の保存済み一覧を最新にして」と伝えるだけでも実行します）。

```bash
python3 tools/refresh_publications.py
```

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
- 書体は**ヒラギノ角ゴシック**優先。Windowsでは游ゴシック、それも無ければメイリオへ自動で切り替わる。
  **外部のフォントサーバーからは読み込んでいない**（訪問者の情報が外部に渡らないようにするため）
- アニメーションは `prefers-reduced-motion` を設定している環境では自動的に無効になる

## 検索で見つけてもらうために

検索エンジンに読み取ってもらうための設定は、サイト側にひととおり入れてあります。

| ファイル・設定 | 役割 |
|---|---|
| `sitemap.xml` | 公開している6ページの一覧（`private.html` は含めない） |
| `robots.txt` | 巡回を許可し、関係者用ページだけ除外。sitemapの場所も知らせる |
| `<link rel="canonical">` | 各ページの正式なURLを示し、重複扱いを防ぐ |
| 構造化データ（JSON-LD） | 研究室・所属大学・所在地・researchmap/ORCIDを機械可読な形で記述 |
| OGP（`assets/ogp.png`） | SNSやLINEで共有されたときのカード画像。`python3 tools/make_ogp.py` で作り直せる |

### ここから先は手作業が必要

1. **Google Search Console に登録する** — 一番効果があります
   - https://search.google.com/search-console にGoogleアカウントでログイン
   - 「URLプレフィックス」に `https://kawamuratomonori-lab.github.io/` を入力
   - 所有権の確認で「HTMLタグ」を選び、表示された `<meta name="google-site-verification" ...>` を Claude に貼り付ければ埋め込みます
   - 確認後、「サイトマップ」に `sitemap.xml` を送信する

2. **researchmap のプロフィールにこのサイトのURLを載せる**
   researchmap は検索エンジンによく読まれているため、そこからリンクが張られると
   このサイトも見つけてもらいやすくなります。ORCIDにも同様に登録できます。

新しく公開したサイトが検索結果に出るまでには、数週間から数か月かかることがあります。

## アクセス数を数えたいとき

初期状態では**何も集計しておらず、外部への通信もありません**。
数えたい場合は次の手順で有効にできます。

1. https://www.goatcounter.com/ で無料登録する（非商用は無料）
2. 好きなコード（例 `kawamura-lab`）を決める
3. `js/analytics.js` の先頭にある `var CODE = "";` にそのコードを書く
   （Claude に「アクセス解析のコードを◯◯にして」と伝えれば実施します）
4. 集計結果は `https://（コード）.goatcounter.com/` で見られる

GoatCounter を選んでいる理由:

- **Cookieを使わない**ので、同意バナーを出す必要がない
- 個人を特定する情報は送らない（訪問数・ページ・参照元・国・端末の種類のみ）
- 「追跡しないで」と設定している訪問者（Do Not Track）は自動的に除外する
- 手元（localhost）での確認は数に入らない

なお、**どなたが見たかを知ることはできません**。これはどの解析サービスでも同じです。

## 外部サーバーとの通信について

訪問者のブラウザが外部へ接続するのは、次の2か所だけです。

| ページ | 接続先 | 目的 |
|---|---|---|
| 業績 | `api.researchmap.jp` | 論文・受賞の最新一覧を取得 |
| お問い合わせ | `maps.google.com` | 地図の表示 |

他のページは**どこにも接続しません**。フッターにその旨の注記を入れています。

## 表示が古いままのときは

GitHub Pages と各ブラウザは、いちど読み込んだファイルをしばらく保存（キャッシュ）します。
更新したのに古い表示のままのときは、次を試してください。

- **Mac / Chrome・Edge**: `Shift + Command + R`
- **Mac / Safari**: `Option + Command + E`（キャッシュを空にする）→ `Command + R`
- **iPhone・iPad**: 設定 → Safari → 履歴とWebサイトデータを消去
- それでも古いままなら 10分ほど待つ（GitHub Pages 側のキャッシュが切れる）

`css/style.css` と `js/*.js` の読み込みには `?v=日付` を付けており、
見た目や動作を変えたときはこの日付も一緒に更新することで、古いファイルが使われないようにしています。
