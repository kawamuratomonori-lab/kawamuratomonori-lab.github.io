#!/usr/bin/env python3
"""SNSで共有されたときに表示されるカード画像（assets/ogp.png）を作る。

    python3 tools/make_ogp.py

配色・文言はサイト本体に合わせてある。内容を変えたいときはこのファイルを直す。
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "ogp.png"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"

PAPER = "#faf7f1"
INK = "#1a1f26"
INK2 = "#4c5560"
MUTE = "#686f78"
BENI = "#c23a41"

W, H = 1200, 630


def main() -> None:
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    bold = lambda s: ImageFont.truetype(FONT, s, index=2)   # W6
    light = lambda s: ImageFont.truetype(FONT, s, index=0)  # W3

    x = 96
    d.text((x, 150), "CARDIAC REHABILITATION & PHYSICAL THERAPY RESEARCH",
           font=light(19), fill=BENI)

    # 「河村」と「研究室」を少し離す（サイト本体と同じ見せ方）
    title, gap = "河村", 26
    f_title = bold(96)
    d.text((x, 205), title, font=f_title, fill=INK)
    d.text((x + d.textlength(title, font=f_title) + gap, 205), "研究室",
           font=f_title, fill=INK)

    d.text((x, 340), "Kawamura Lab", font=light(38), fill=MUTE)
    d.text((x, 415), "森ノ宮医療大学", font=bold(30), fill=INK2)
    d.text((x, 462), "Morinomiya University of Medical Sciences",
           font=light(23), fill=MUTE)

    # 心電図ライン
    y = 560
    pts = [(x, y), (x + 380, y), (x + 398, y - 16), (x + 416, y + 16),
           (x + 430, y - 62), (x + 448, y + 40), (x + 462, y - 8),
           (x + 476, y), (W - 96, y)]
    d.line(pts, fill=BENI, width=3, joint="curve")

    img.save(OUT, "PNG", optimize=True)
    print(f"作成しました → {OUT.relative_to(ROOT)}（{OUT.stat().st_size:,} バイト）")


if __name__ == "__main__":
    main()
