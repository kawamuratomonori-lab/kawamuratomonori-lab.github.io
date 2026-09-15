/* ==========================================================
   アクセス数の集計（GoatCounter）

   - Cookieを使わないため、同意バナーは不要
   - 個人を特定する情報は送っていない（訪問数・ページ・参照元・国・端末の種類のみ）
   - 「このサイトを見ない」設定にしている人（Do Not Track）は集計しない
   - 下の CODE が空のあいだは、外部への通信を一切しない

   使いはじめかた:
     1. https://www.goatcounter.com/ で無料登録する（非商用は無料）
     2. 決めたコード（例 kawamura-lab）を下の CODE に書く
     3. 集計結果は https://（コード）.goatcounter.com/ で見られる
   ========================================================== */
(function () {
  var CODE = "";   // ← ここにGoatCounterのコードを書くと集計が始まる

  if (!CODE) return;                                   // 未設定なら何もしない
  if (navigator.doNotTrack === "1" ||
      window.doNotTrack === "1") return;                // 追跡を拒否している人は除外
  if (location.hostname === "localhost" ||
      location.protocol === "file:") return;            // 手元での確認は数えない

  window.goatcounter = { no_onload: false };
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + CODE + ".goatcounter.com/count");
  document.head.appendChild(s);
})();
