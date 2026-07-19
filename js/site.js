/* スクロールに合わせて .reveal 要素をふわっと表示する
   JSが無効な環境では何もせず、すべて最初から表示される */
(function () {
  document.documentElement.classList.add("js");

  var targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("on"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("on");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach(function (el) { io.observe(el); });

  /* 保険: 何らかの理由でObserverが発火しない環境でも
     3秒後には必ずすべて表示する */
  setTimeout(function () {
    targets.forEach(function (el) { el.classList.add("on"); });
  }, 3000);
})();
