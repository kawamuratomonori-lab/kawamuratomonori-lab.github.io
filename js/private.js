/* ==========================================================
   関係者用ページの解錠処理
   本文は AES-256-GCM で暗号化されており、正しいパスワードを
   入力したときだけブラウザ上で復号される。
   （鍵はサーバーに送られず、暗号文は復号できなければ意味を持たない）
   ========================================================== */
(function () {
  var d = document;
  var form = d.getElementById("unlock-form");
  var input = d.getElementById("pw");
  var card = d.getElementById("lock");
  var err = d.getElementById("err");
  var secret = d.getElementById("secret");
  var button = form ? form.querySelector("button") : null;

  if (!form || !window.LAB_PRIVATE) return;

  function fail(message) {
    err.textContent = message;
    err.hidden = false;
    card.classList.remove("shake");
    // アニメーションを再生し直すためにリフローを挟む
    void card.offsetWidth;
    card.classList.add("shake");
    input.select();
  }

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function decrypt(password) {
    var box = window.LAB_PRIVATE;
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) {
      return Promise.reject(new Error("insecure-context"));
    }

    return subtle
      .importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"])
      .then(function (material) {
        return subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: b64ToBytes(box.salt),
            iterations: box.iter,
            hash: "SHA-256"
          },
          material,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
      })
      .then(function (key) {
        return subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(box.iv) }, key, b64ToBytes(box.data));
      })
      .then(function (buffer) {
        return new TextDecoder().decode(buffer);
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var password = input.value;
    if (!password) return;

    err.hidden = true;
    if (button) {
      button.disabled = true;
      button.textContent = "確認しています…";
    }

    decrypt(password).then(
      function (html) {
        card.classList.add("unlocked");
        setTimeout(function () {
          card.hidden = true;
          secret.innerHTML = html;
          secret.hidden = false;
        }, 260);
      },
      function (error) {
        if (button) {
          button.disabled = false;
          button.textContent = "解錠する / Unlock";
        }
        if (error && error.message === "insecure-context") {
          fail("この環境では復号できません。https:// のページで開いてください。");
        } else {
          fail("パスワードが正しくありません。");
        }
      }
    );
  });
})();
