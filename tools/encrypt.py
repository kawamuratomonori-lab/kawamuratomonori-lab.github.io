#!/usr/bin/env python3
"""関係者用ページの本文を暗号化して js/private-data.js を生成する。

  入力  : private/content.html （平文。GitHubには公開しない）
  出力  : js/private-data.js   （暗号化済み。公開されても中身は読めない）
  方式  : PBKDF2-HMAC-SHA256（25万回）で鍵を導出し、AES-256-GCM で暗号化

使い方:
    python3 tools/encrypt.py            # パスワードを対話入力
    LAB_PW='パスワード' python3 tools/encrypt.py   # 非対話で実行

パスワードを変更したいときは、新しいパスワードでこのスクリプトを
実行し直すだけでよい（本文はそのままでよい）。
"""

import base64
import getpass
import hashlib
import json
import os
import sys
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "private" / "content.html"
OUT = ROOT / "js" / "private-data.js"
ITERATIONS = 250_000


def main() -> None:
    if not SRC.exists():
        sys.exit(f"本文が見つかりません: {SRC}")

    plaintext = SRC.read_text(encoding="utf-8").encode("utf-8")

    password = os.environ.get("LAB_PW") or getpass.getpass("パスワード: ")
    if not password:
        sys.exit("パスワードが空です。")

    salt = os.urandom(16)
    iv = os.urandom(12)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS, dklen=32)
    ciphertext = AESGCM(key).encrypt(iv, plaintext, None)

    def b64(raw: bytes) -> str:
        return base64.b64encode(raw).decode("ascii")

    payload = {
        "v": 1,
        "iter": ITERATIONS,
        "salt": b64(salt),
        "iv": b64(iv),
        "data": b64(ciphertext),
    }

    OUT.write_text(
        "/* 自動生成ファイル — tools/encrypt.py が出力します。手で編集しないでください。 */\n"
        "window.LAB_PRIVATE = " + json.dumps(payload) + ";\n",
        encoding="utf-8",
    )
    print(f"暗号化しました → {OUT.relative_to(ROOT)}（{len(ciphertext):,} バイト）")


if __name__ == "__main__":
    main()
