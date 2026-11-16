# Design: the technical log sheet

The docs frame is a serially numbered technical-log sheet; the reading column stays calm.
Tokens live in `src/styles/theme.css` (`--fc-*`, mapped onto Starlight's `--sl-*`).

## Palette

| Token | Light | Dark | Role |
|---|---|---|---|
| `--fc-paper` | `#f3f5f2` | `#0e1320` | Page ground (copy paper / night copy) |
| `--fc-sheet` | `#fafbf9` | `#121929` | Raised sheet: hero, asides |
| `--fc-ink` | `#1f3570` | `#8fa6e8` | Form ink: rules, labels, active fills, primary button |
| `--fc-masthead` | `#1f3570` | `#172654` | Solid masthead band |
| `--fc-serial` | `#b52f1b` | `#ff7a63` | Serials only: version, entry number, active TOC item, danger stamp, marked code lines, focus ring |
| `--fc-rule` / `--fc-rule-strong` | `#c9cfdc` / `#6577a8` | `#273149` / `#4a5a86` | Hairline and field-box rules |

Restrained strategy: neutrals tinted toward the ink, one ink, one red used sparingly.

## Type

- Labels, masthead, titles: **Barlow Condensed** 500–700, uppercase with 0.04–0.12em tracking for labels; sentence case for page titles.
- Reading: **Public Sans Variable**, 16px, line-height 1.7, column 46rem.
- Code: **JetBrains Mono Variable**, code only.

## Components

- **Masthead** (`src/components/Header.astro`): wordmark, top nav for the four sections (active = paper fill), search, a `SHEET Nº` serial box, GitHub and theme switch.
- **Field row** (`PageTitle.astro`): Section / Entry `NN of NN` / Source version, ruled boxes, above the title and description.
- **Index** (`Sidebar.astro`): only the current section's pages; on mobile, a 2×2 section switcher sits on top.
- **Landing** (`Hero.astro`, `Landing.astro`): the sheet header with serial and two real commands, the loop as a D/P/B/R ruled log, an "Around the loop" row and a generated four-column index.
- **Asides**: printed stamp labels. Note and tip are outlined, caution is filled with ink, danger is filled with serial red. No tinted backgrounds and no thick left borders.
- **Tables**: a 2px ink top rule, uppercase condensed headers and hairline rows.
- **Code**: square frames with no terminal chrome (`frame: 'none'`) and red-marked highlighted lines.

## Rules

- Corners are square (2–3px at most); depth comes from rules, never from shadows.
- Spacing is in multiples of 0.25rem/8px, with more space above headings than below.
- The world stays in the frame. Do not put field boxes or stamps into running prose.
