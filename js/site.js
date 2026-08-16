/* ==========================================================
   サイト共通のうごき
   - スクロールに合わせた表示アニメーション
   - ヘッダーの影（スクロール時）
   - ページ上部へ戻るボタン（FAB）
   - クリック時のリップル（波紋）
   JSが無効な環境ではすべて静的に表示される
   ========================================================== */
(function () {
  var d = document;
  d.documentElement.classList.add("js");

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 表示アニメーション ---------- */
  var targets = d.querySelectorAll(".reveal, .stagger");

  // .stagger の子要素は順番に遅れて表示する
  Array.prototype.forEach.call(d.querySelectorAll(".stagger"), function (box) {
    Array.prototype.forEach.call(box.children, function (child, i) {
      child.style.transitionDelay = i * 70 + "ms";
    });
  });

  function showAll() {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("on"); });
  }

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

    // 保険: 何らかの理由で発火しなくても3秒後には表示する
    setTimeout(showAll, 3000);
  }

  /* ---------- ページ上部へ戻るボタン ---------- */
  var fab = d.createElement("button");
  fab.className = "fab ripple-host";
  fab.type = "button";
  fab.setAttribute("aria-label", "ページの先頭へ戻る / Back to top");
  fab.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';
  fab.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
  d.body.appendChild(fab);

  /* ---------- スクロール連動 ---------- */
  var header = d.querySelector(".site-header");
  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    fab.classList.toggle("show", y > 400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- リップル（クリック時の波紋） ---------- */
  var rippleTargets = ".btn, .m-btn, .fab, .feature-list a, .link-list li, .news-list li";
  Array.prototype.forEach.call(d.querySelectorAll(rippleTargets), function (el) {
    el.classList.add("ripple-host");
  });

  d.addEventListener("pointerdown", function (e) {
    if (reduce) return;
    var host = e.target.closest && e.target.closest(".ripple-host");
    if (!host) return;

    var rect = host.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var span = d.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = e.clientX - rect.left - size / 2 + "px";
    span.style.top = e.clientY - rect.top - size / 2 + "px";
    host.appendChild(span);
    setTimeout(function () { span.remove(); }, 620);
  });
})();
