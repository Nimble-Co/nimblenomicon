#!/usr/bin/env python3
"""Build game-masters-guide-snippets.json from gmg-extract-raw.txt (PDF extract)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "gmg-extract-raw.txt"
OUT = ROOT / "src/data/game-masters-guide-snippets.json"

# Non-overlapping (snippet_id, start_page, end_page, markdown_h2 heading)
SECTIONS: list[tuple[str, int, int, str]] = [
    ("copyright-and-credits", 2, 3, "## Credits and license"),
    ("starting-as-a-gm", 4, 5, "## Starting as a GM"),
    ("advanced-gm-tools-intro", 6, 6, "## Advanced GM Tools"),
    ("what-you-dont-see", 7, 7, "## What You DON'T See Is…"),
    ("heroic-vignettes", 8, 10, "## Heroic Vignettes"),
    ("making-your-own-adventures", 11, 14, "## Making Your Own Adventures"),
    ("running-skill-challenges", 15, 15, "## Running Skill Challenges!"),
    ("what-to-avoid", 16, 17, "## What to Avoid"),
    ("adventuring-rewards-intro", 18, 18, "## Adventuring Rewards"),
    ("release-valves-and-story-items", 19, 19, "## Release Valves"),
    ("combat-items-and-resting", 20, 20, "## Combat Items"),
    ("secret-spells-intro", 21, 21, "## Secret Spells"),
    ("gold-and-lodging", 22, 22, "## Gold"),
    ("boons", 23, 23, "## Boons"),
    ("monsters-and-running", 24, 25, "## Monsters"),
    ("encounter-guidelines-and-tuning", 26, 27, "## Combat Encounter Guidelines"),
    ("unique-encounters", 28, 29, "## Unique Encounters"),
    ("monster-builder-and-flavor", 30, 31, "## Monster Builder"),
    ("bestiary", 32, 41, "## Bestiary"),
    ("legendary-monsters", 42, 61, "## Legendary Monsters"),
    ("garden-of-death", 62, 77, "## Garden of Death"),
    ("valley-of-hope-and-farhope", 78, 85, "## Valley of Hope"),
    ("adventure-locations-elderwild-through-skyreach", 86, 101, "## The Elderwild"),
    ("adventure-locations-growling-through-shadowblight", 102, 109, "## Growling Marshes"),
    ("5e-conversion", 110, 111, "## 5e Conversion"),
    ("appendix-of-inspiration", 112, 112, "## Appendix of Inspiration"),
    ("for-creators-and-more", 113, 114, "## For Creators"),
    ("chaos-intro", 115, 115, "## Chaos"),
]


def load_pages(raw: str) -> dict[int, str]:
    pages: dict[int, str] = {}
    rx = re.compile(r"\n===== PAGE (\d+) =====\n")
    parts = rx.split(raw)
    if not parts[0].strip():
        parts = parts[1:]
    i = 0
    while i + 1 < len(parts):
        num_s, body = parts[i], parts[i + 1]
        pages[int(num_s)] = body
        i += 2
    return pages


def clean_block(text: str) -> str:
    lines = text.split("\n")
    out: list[str] = []
    for line in lines:
        if re.fullmatch(r"\d{1,3}", line.strip()):
            continue
        out.append(line)
    text = "\n".join(out)
    text = re.sub(r"([a-zA-Z])-\n([a-z])", r"\1\2", text)
    text = re.sub(r"([a-z]) \n([a-z])", r"\1 \2", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def pages_to_text(pages: dict[int, str], start: int, end: int) -> str:
    chunks = []
    for p in range(start, end + 1):
        chunks.append(pages.get(p, ""))
    return clean_block("\n\n".join(chunks))


def main() -> None:
    if not RAW.exists():
        raise SystemExit(f"Missing {RAW}")
    raw = RAW.read_text(encoding="utf-8")
    pages = load_pages(raw)
    snippets: list[dict[str, str]] = []
    for sid, start, end, heading in SECTIONS:
        body = pages_to_text(pages, start, end)
        if not body:
            continue
        desc = f"{heading}\n\n{body}"
        snippets.append({"id": sid, "description": desc})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(snippets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(snippets)} snippets to {OUT}")


if __name__ == "__main__":
    main()
