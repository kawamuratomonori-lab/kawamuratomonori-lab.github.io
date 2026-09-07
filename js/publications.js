/* ==========================================================
   業績ページを researchmap と同期する

   researchmap の公開API（CORS許可済み）から論文・受賞を取得し、
   ページの内容を置き換える。researchmap を更新すれば、このサイトにも
   自動的に反映される。

   通信に失敗した場合はHTMLに書かれている内容がそのまま残るため、
   ページが空になることはない。
   ========================================================== */
(function () {
  var BASE = "https://api.researchmap.jp/t_kawamura/";
  var ME = /kawamura|河村/i;   // 太字にする著者名
  var d = document;

  var elEn = d.getElementById("pub-en");
  var elJa = d.getElementById("pub-ja");
  var elAwards = d.getElementById("awards-list");
  var note = d.getElementById("sync-note");
  if (!elEn && !elJa && !elAwards) return;

  /* ---------- 小道具 ---------- */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // 指定言語を優先しつつ、無ければもう一方を使う
  function pick(obj, lang) {
    if (!obj) return "";
    return obj[lang] || obj[lang === "ja" ? "en" : "ja"] || "";
  }

  // 指定言語だけ（無ければ空文字）
  function only(obj, lang) {
    return (obj && obj[lang]) || "";
  }

  // researchmapの登録内容によっては、和名リストの末尾に英名が続けて
  // 入っていることがある。末尾がもう一方の言語のリストと完全に一致する
  // ときだけ、その分を取り除く
  function dropAppendedNames(primary, other) {
    if (!primary || !other || primary.length <= other.length) return primary;
    var tail = primary.slice(primary.length - other.length);
    var duplicated = tail.every(function (a, i) { return a.name === other[i].name; });
    return duplicated ? primary.slice(0, primary.length - other.length) : primary;
  }

  function authorList(item, lang) {
    var authors = item.authors || {};
    var primary = authors[lang];
    var other = authors[lang === "ja" ? "en" : "ja"];
    if (!primary) return other || [];
    return dropAppendedNames(primary, other);
  }

  function authorsHtml(list) {
    if (!list || !list.length) return "";
    return list
      .map(function (a) {
        var name = esc(a.name);
        return ME.test(a.name || "") ? '<span class="me">' + name + "</span>" : name;
      })
      .join(", ");
  }

  // 「2025;145(1):304-304.」の形に組み立てる
  function citation(item) {
    var out = (item.publication_date || "").slice(0, 4);
    if (item.volume) out += ";" + item.volume;
    if (item.number) out += "(" + item.number + ")";
    if (item.starting_page) {
      out += ":" + item.starting_page;
      if (item.ending_page && item.ending_page !== item.starting_page) {
        out += "-" + item.ending_page;
      }
    }
    return out ? out + "." : "";
  }

  function doiOf(item) {
    var ids = item.identifiers || {};
    var doi = ids.doi || ids.DOI;
    return doi && doi.length ? doi[0] : "";
  }

  function newerFirst(key) {
    return function (a, b) {
      return String(b[key] || "").localeCompare(String(a[key] || ""));
    };
  }

  // researchmapのAPIはときどき接続が切れるため、間隔をあけて数回試す
  function fetchJson(path, attempt) {
    attempt = attempt || 1;
    return fetch(BASE + path + "?limit=200", { mode: "cors" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (err) {
        if (attempt >= 3) throw err;
        return new Promise(function (resolve) {
          setTimeout(resolve, attempt * 800);
        }).then(function () {
          return fetchJson(path, attempt + 1);
        });
      });
  }

  /* ---------- 描画 ---------- */

  function paperLi(item, lang) {
    var title = esc(pick(item.paper_title, lang));
    var journal = esc(pick(item.publication_name, lang));
    var authors = authorsHtml(authorList(item, lang));
    var doi = doiOf(item);

    var html = "<li>";
    if (authors) html += '<span class="authors">' + authors + "</span>";
    html += '<span class="title">' + title + "</span>";
    if (journal) html += '<span class="journal">' + journal + "</span>. ";
    html += citation(item);
    if (doi) {
      html +=
        ' <a class="doi" href="https://doi.org/' + esc(doi) +
        '" target="_blank" rel="noopener">DOI</a>';
    }
    return html + "</li>";
  }

  function awardLi(item) {
    var date = esc((item.award_date || "").replace(/-/g, "."));

    var ja = [only(item.association, "ja"), only(item.award_name, "ja")]
      .filter(Boolean).join(" ");
    var en = [only(item.association, "en"), only(item.award_name, "en")]
      .filter(Boolean).join(", ");

    var html = "<li><time>" + date + "</time><div>";
    html += '<span class="ja">' + esc(ja || pick(item.award_name, "ja")) + "</span>";
    if (en) html += '<span class="en">' + esc(en) + "</span>";
    return html + "</div></li>";
  }

  // JSで差し替えた後も、順番に現れるアニメーションを保つ
  function restageAnimation(box) {
    Array.prototype.forEach.call(box.children, function (child, i) {
      child.style.transitionDelay = i * 70 + "ms";
    });
    var rect = box.getBoundingClientRect();
    if (rect.top < window.innerHeight) box.classList.add("on");
  }

  function render(box, items, toHtml) {
    if (!box || !items.length) return;
    box.innerHTML = items.map(toHtml).join("");
    restageAnimation(box);
  }

  /* ---------- 取得して反映 ---------- */

  Promise.all([fetchJson("published_papers"), fetchJson("awards")])
    .then(function (results) {
      var papers = (results[0].items || []).slice().sort(newerFirst("publication_date"));
      var awards = (results[1].items || []).slice().sort(newerFirst("award_date"));

      var japanese = papers.filter(function (p) {
        return (p.languages || [])[0] === "jpn";
      });
      var english = papers.filter(function (p) {
        return (p.languages || [])[0] !== "jpn";
      });

      render(elEn, english, function (item) { return paperLi(item, "en"); });
      render(elJa, japanese, function (item) { return paperLi(item, "ja"); });
      render(elAwards, awards, awardLi);

      if (note) {
        note.textContent =
          "researchmap と同期しています（論文 " + papers.length +
          "件・受賞 " + awards.length + "件）";
      }
    })
    .catch(function () {
      // 取得できないときはHTMLの内容をそのまま表示したままにする
      if (note) {
        note.textContent =
          "researchmap に接続できなかったため、保存済みの一覧を表示しています。";
      }
    });
})();
