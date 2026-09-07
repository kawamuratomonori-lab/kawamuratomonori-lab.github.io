#!/usr/bin/env python3
"""researchmap の内容を publications.html に書き出す（表示の土台を最新にする）。

業績ページはブラウザ側でも researchmap と同期するが、researchmap のAPIは
ときどき応答しないことがある。そのときはHTMLに書かれている内容がそのまま
表示されるため、この土台を定期的に最新化しておく。

使い方:
    python3 tools/refresh_publications.py
"""

import json
import re
import sys
import time
import urllib.request
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "publications.html"
BASE = "https://api.researchmap.jp/t_kawamura/"
ME = re.compile(r"kawamura|河村", re.IGNORECASE)


def fetch(path, attempts=5):
    """APIが接続をリセットすることがあるため、間隔をあけて再試行する。"""
    url = f"{BASE}{path}?limit=200"
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/ld+json, application/json"})
            with urllib.request.urlopen(req, timeout=30) as res:
                return json.load(res)
        except Exception as err:  # 接続リセットなど
            last = err
            if i < attempts - 1:
                time.sleep(2 * (i + 1))
    sys.exit(f"取得に失敗しました（{path}）: {last}")


def pick(obj, lang):
    if not obj:
        return ""
    return obj.get(lang) or obj.get("en" if lang == "ja" else "ja") or ""


def drop_appended_names(primary, other):
    """和名リストの末尾に英名が続けて登録されている場合、その分を取り除く。"""
    if not primary or not other or len(primary) <= len(other):
        return primary
    tail = primary[len(primary) - len(other):]
    if all(a.get("name") == b.get("name") for a, b in zip(tail, other)):
        return primary[: len(primary) - len(other)]
    return primary


def author_list(item, lang):
    authors = item.get("authors") or {}
    primary = authors.get(lang)
    other = authors.get("en" if lang == "ja" else "ja")
    if not primary:
        return other or []
    return drop_appended_names(primary, other)


def authors_html(items):
    out = []
    for a in items:
        name = escape(a.get("name") or "")
        out.append(f'<span class="me">{name}</span>' if ME.search(a.get("name") or "") else name)
    return ", ".join(out)


def citation(item):
    out = (item.get("publication_date") or "")[:4]
    if item.get("volume"):
        out += ";" + item["volume"]
    if item.get("number"):
        out += "(" + item["number"] + ")"
    if item.get("starting_page"):
        out += ":" + item["starting_page"]
        end = item.get("ending_page")
        if end and end != item["starting_page"]:
            out += "-" + end
    return out + "." if out else ""


def paper_li(item, lang):
    doi = (item.get("identifiers") or {}).get("doi") or []
    parts = ["      <li>"]
    authors = authors_html(author_list(item, lang))
    if authors:
        parts.append(f'        <span class="authors">{authors}</span>')
    parts.append(f'        <span class="title">{escape(pick(item.get("paper_title"), lang))}</span>')
    line = ""
    journal = pick(item.get("publication_name"), lang)
    if journal:
        line += f'<span class="journal">{escape(journal)}</span>. '
    line += citation(item)
    if doi:
        line += f' <a class="doi" href="https://doi.org/{escape(doi[0])}" target="_blank" rel="noopener">DOI</a>'
    parts.append("        " + line)
    parts.append("      </li>")
    return "\n".join(parts)


def award_li(item):
    date = escape((item.get("award_date") or "").replace("-", "."))
    ja = " ".join(x for x in [(item.get("association") or {}).get("ja"),
                              (item.get("award_name") or {}).get("ja")] if x)
    en = ", ".join(x for x in [(item.get("association") or {}).get("en"),
                               (item.get("award_name") or {}).get("en")] if x)
    lines = ["      <li>", f"        <time>{date}</time>", "        <div>",
             f'          <span class="ja">{escape(ja or pick(item.get("award_name"), "ja"))}</span>']
    if en:
        lines.append(f'          <span class="en">{escape(en)}</span>')
    lines += ["        </div>", "      </li>"]
    return "\n".join(lines)


def replace_list(html, list_id, body):
    pattern = re.compile(r'(<(?:ol|ul)[^>]*id="' + list_id + r'"[^>]*>)(.*?)(</(?:ol|ul)>)', re.S)
    if not pattern.search(html):
        sys.exit(f"リストが見つかりません: {list_id}")
    return pattern.sub(lambda m: m.group(1) + "\n" + body + "\n    " + m.group(3), html, count=1)


def main():
    papers = sorted((fetch("published_papers").get("items") or []),
                    key=lambda x: x.get("publication_date") or "", reverse=True)
    awards = sorted((fetch("awards").get("items") or []),
                    key=lambda x: x.get("award_date") or "", reverse=True)

    japanese = [p for p in papers if (p.get("languages") or [None])[0] == "jpn"]
    english = [p for p in papers if (p.get("languages") or [None])[0] != "jpn"]

    html = PAGE.read_text(encoding="utf-8")
    html = replace_list(html, "pub-en", "\n".join(paper_li(p, "en") for p in english))
    html = replace_list(html, "pub-ja", "\n".join(paper_li(p, "ja") for p in japanese))
    html = replace_list(html, "awards-list", "\n".join(award_li(a) for a in awards))
    PAGE.write_text(html, encoding="utf-8")

    print(f"publications.html を更新しました（英文 {len(english)}件・和文 {len(japanese)}件・受賞 {len(awards)}件）")


if __name__ == "__main__":
    main()
