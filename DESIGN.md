# DESIGN.md — Catatan Keluarga

Design direction for this project. antislop removes generic output; this file
supplies the direction it cannot invent. Read this before writing any UI.

UI copy is **Indonesian**. Code, comments, and identifiers are **English**.

---

## 1. What this product is

A shared money log for two people — a husband and wife — running on their own
phones, off a Mac mini at home. Not a budgeting product, not a fintech dashboard.
It is closer to a shared notebook that happens to do arithmetic.

**Audience:** two non-technical adults, using this on an iPhone, one-handed,
usually while doing something else — standing at a cashier, sitting in a car,
in bed before sleep.

**The primary job:** review and confirm transactions that arrived automatically,
in under five seconds, without reading carefully. Everything else — reports,
settings, history — is secondary and can be slower.

This matters for every design choice below. The most-used screen in this app is
not a dashboard. It is a **queue of guesses waiting to be approved**. Design for
the queue first; the dashboard is a once-a-week screen.

---

## 2. Color

The brief: soft light blue, calm, nothing clashing.

```
--ink          #1B2A3A   near-navy, all primary text
--ink-soft     #5A6B7D   secondary text, timestamps, captions
--surface      #F6F9FC   page background, a barely-blue white
--card         #FFFFFF   raised surfaces
--line         #DCE6F0   borders, dividers, input outlines
--accent       #3E7CB1   the one blue: primary buttons, active states, links
--accent-wash  #E8F1F8   selected rows, focus halo, quiet badges
```

Dark mode is required (PWA on an iPhone at night, in bed):

```
--ink          #E6EDF4
--ink-soft     #93A4B6
--surface      #121A24
--card         #1A2531
--line         #2A3A4A
--accent       #6FA8D6
--accent-wash  #1E3244
```

### The hard rule: money direction is not shown with red and green

Every finance app paints income green and expense red. Here that would be two
saturated hues fighting the soft blue and each other — exactly the clash the
brief rules out. It also fails for colorblind users and reads as alarm when
nothing is wrong. Spending money is normal.

Instead:

- **Expense** — `--ink`, with a minus sign: `−Rp 25.000`
- **Income** — `#2F7D6E` (a muted, desaturated teal-green that sits quietly
  beside the blue), with a plus sign: `+Rp 8.000.000`
- **Transfer** — `--ink-soft`, with an arrow between account names, no sign.
  A transfer is not a gain or a loss and must never look like one.

The sign and the typography carry the meaning. Color only reinforces it.

**Red (`#C0453E`) is reserved for exactly two things:** destructive confirmation
(deleting an account that has transactions) and validation errors. If red appears
anywhere else, it has been misused. A large expense is not an error.

### Contrast

Soft palettes fail accessibility quietly. Non-negotiable: body text ≥ 4.5:1
against its background, large text and UI borders ≥ 3:1. `--ink-soft` on
`--surface` is the thinnest pair in the system — never put anything below
14px in it, and never use it for a number the user has to act on.

---

## 3. Type

**One family: Plus Jakarta Sans.** Self-hosted via `next/font`, not a CDN —
the Mac mini may be offline and the app must render identically with no network.

It was drawn in Jakarta for Indonesian text, its rounded terminals suit a soft
palette without turning childish, and it is not Inter, which is the default
every generated interface reaches for.

Weights: 400 body, 500 labels and buttons, 700 numbers and headings. No other
weights — three is enough and keeps the font payload small.

### Numbers are the content

Money is the only thing on most screens that the user actually reads. Enable
tabular figures globally so columns of rupiah align:

```css
font-variant-numeric: tabular-nums;
```

Type scale:

| Role | Size / line-height | Weight |
|---|---|---|
| Hero figure (one per screen, at most) | 34 / 40 | 700 |
| Transaction amount in a list row | 17 / 24 | 700 |
| Body, merchant names, labels | 15 / 22 | 400 |
| Secondary: date, account, category | 13 / 18 | 400, `--ink-soft` |

Sentence case everywhere. **No ALL-CAPS labels** — not for section headers, not
for badges, not for buttons. Indonesian words are long and all-caps makes them
unreadable at small sizes.

No eyebrow labels above headings. No tracked-out micro-labels. If a section
needs explaining, the content is wrong.

---

## 4. Layout

Single column, `max-width: 28rem`, centred. On a laptop it stays a phone-width
column — this is a phone app that happens to open in a browser. Do not build a
separate desktop layout.

```
┌─────────────────────────┐
│  Sisa bulan ini         │   ← one number, nothing competing
│  Rp 4.250.000           │
│                         │
│  ─────────────────────  │
│                         │
│  Perlu dicek      3     │   ← the Inbox. The reason to open the app.
│  ┌───────────────────┐  │
│  │ ☐ Indomaret       │  │
│  │   −Rp 45.000      │  │
│  │   Belanja · GoPay │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ☐ Tarik tunai ATM │  │
│  │   Rp 500.000      │  │
│  │   Mandiri → Tunai │  │
│  └───────────────────┘  │
│                         │
│  [ Setujui 2 transaksi ]│   ← fixed to the bottom, thumb reach
└─────────────────────────┘
```

Left-aligned text. Right-aligned amounts. Never centre body text.

**Touch targets: 44×44px minimum**, including checkboxes. A checkbox that needs
aiming defeats bulk approve, which is the whole point of the Inbox.

Primary actions sit at the **bottom** of the screen, inside the thumb arc —
never top-right. Account for the iPhone home indicator with
`padding-bottom: env(safe-area-inset-bottom)`.

### Density: one idea per screen

The brief says not too much information, and that is a rule, not a preference.

- The home screen shows **one** headline number. Not four stat cards.
- A transaction row shows four things: merchant, amount, category, account.
  Not the timestamp, not the source, not the confidence score. Those live in
  the detail view.
- No charts on the home screen. Reports are a separate tab the user visits
  deliberately.

Resist the stat-card grid. Three rounded cards in a row, each with a number and
a tiny label, is the default shape of every generated finance UI and tells the
user nothing they came for.

---

## 5. Components

**Cards.** One border-radius: `12px`. One elevation: a `1px solid --line`
border, no shadow. Shadows are reserved for things that genuinely float — the
undo toast and modal sheets. If everything is raised, nothing is.

**Buttons.** Primary: solid `--accent`, white text, full-width at the bottom of
a screen. Secondary: `--line` border, transparent fill. Destructive: red text on
transparent, never a solid red button — a solid red button invites the tap it is
trying to guard.

**The undo toast.** This is the single most important component in the app and
the one place to spend some craft. After approving, a dark pill slides up from
the bottom: `Disetujui · Batalkan`, with a thin progress line draining over ten
seconds. It is the only element with a shadow and the only self-starting motion
in the product. It must never cover the bottom button.

**Empty states are the normal state.** An empty Inbox means the system is
working. Do not draw a sad illustration. One line, calm:
`Tidak ada yang perlu dicek.` Below it, a quiet link to add something manually.

**Errors explain and offer a next step.** Not `Terjadi kesalahan`.
Instead: `Tidak bisa menyimpan — server rumah tidak terjangkau. Dicoba lagi otomatis.`

---

## 6. Motion

Two pieces of non-user-triggered motion exist in this product, and no more:

1. The undo toast entering and its timer draining.
2. An approved row collapsing out of the Inbox list — this shows the user what
   their tap did.

No fade-and-slide on page load. No hover transitions on cards (there is no
hover on a phone). No skeleton shimmer; a short pause is quieter than a pulsing
grey rectangle.

Honour `prefers-reduced-motion`: collapse becomes an instant removal, the toast
appears without sliding. The ten-second undo window stays the same length.

---

## 7. Writing

Indonesian, informal but not cute. The app is a tool the family lives with, not
a friend performing enthusiasm.

- **Verbs, not nouns.** `Setujui`, `Simpan`, `Batalkan` — never `Submit`, never `OK`.
- **One name per action, everywhere.** The button says `Setujui`, so the toast
  says `Disetujui`. Not `Berhasil disimpan`.
- **Numbers are always full rupiah with dots:** `Rp 45.000`. Never `45K`,
  never `Rp 45rb` in output. Shorthand is for input only.
- **Dates are human.** `Hari ini`, `Kemarin`, then `3 Nov`. Only show the year
  when it is not this year.
- **No emoji in the interface.** Category icons are a defined icon set, chosen
  once, not emoji picked per category.
- **No exclamation marks.** Nothing here is exciting enough.

Ask, do not announce. When the AI is unsure, the row says
`Masuk kategori mana?` — not `Confidence rendah` and not `AI tidak yakin`.
The user does not need to know which layer of the pipeline hesitated.

---

## 8. Where to spend the quality

One memorable thing, everything else quiet. Here it is the **Inbox approval
flow**: the checkbox hit areas, the bulk-approve button counting up live as rows
are selected, the collapse animation, and the undo toast. That sequence is what
the family touches every day and what makes this app feel finished.

Everything else — settings, account management, reports — should be plain,
legible, and unremarkable. Do not decorate them to match the effort spent on
the Inbox.
