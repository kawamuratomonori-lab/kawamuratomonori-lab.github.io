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
| `contact.html` | お問い合わせ |
| `css/style.css` | 共通スタイル（配色は `:root` の変数で変更） |
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

## 運用メモ

- 日本語・英語併記ルール: 日本語の段落（`class="ja"`）の直後に英語の段落（`class="en"`）を置く
- お知らせは `index.html` の `news-list` に新しいものを上に追加する
- 業績の元データ: [researchmap](https://researchmap.jp/t_kawamura)
