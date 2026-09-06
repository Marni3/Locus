# Demo Data Brief — "First Month" (Student Persona)

Goal: raw material that, when run through the real pipeline, produces a *believable, varied* set of Themes and Observations — some with real arcs, some steady, one or two orphans — without ever naming a Theme yourself. If you catch yourself writing "I keep thinking about my roommate situation" as a signal to the AI, back off — write what the person would actually think, not what you want extracted.

## Cast & setting

A first-year university student, first month of the fall semester (weeks 1–4). New city, first time living away from home. Writes to the journal in scattered bursts — some nights nothing, some nights three separate entries.

## Thread map (for your planning only — never named in-entry)

| Thread | Arc type | Appears | Notes |
|---|---|---|---|
| Homesickness → belonging | Transformation | Weeks 1–4, ~5 entries | The flagship arc — should show a real emotional shift entry-to-entry, not a straight line (a relapse in week 3 is more believable than steady improvement) |
| Roommate friction → friendship | Transformation | Weeks 1, 2, 3, 4 | Cross-links with belonging thread once roommate becomes a friend |
| Hard class (pick one: calc, chem, etc.) | Transformation | Weeks 1, 2, 3, 4 | Bad midterm mid-arc, recovery via office hours/study group |
| Campus org / club | Transformation | Weeks 1, 2, 3 | Nervous signup → awkward first meeting → small win/responsibility |
| Calls home / family | Steady | Weeks 1, 2, 4 | Not an arc — a stable support pattern, good contrast to the transformation threads |
| Money/budgeting stress | Minor recurring | Weeks 2, 4 | Appears exactly twice — enough to become a real Theme, not enough to be a focus |
| One genuinely one-off reflection | Singleton | Week 3, once | A stray thought (a book, a random conversation, a passing idea about their major) that never recurs — this is your test case for "creates a new Theme, stays an orphan node" |

## Week-by-week entry plan

**Week 1 (~4–5 entries):** Everything is tangled together — write these as multi-topic dumps (homesickness + roommate + class anxiety all in one entry), which is realistic for someone overwhelmed and also exercises the "one Entry produces multiple Observations across different Themes" path. Include the org signup as a small aside in one of these.

**Week 2 (~4 entries):** Entries start narrowing to one topic each as the fog lifts slightly — good place for the bad midterm entry, a sharper roommate conflict, and the first money-stress mention. Put a phone number or an advisor's email address naturally in one entry here ("gave Priya my number, 555-0148, for the study group") — this is your PII-sanitizer test content; write it like a real detail, not a flagged test string.

**Week 3 (~3–4 entries):** The relapse entry belongs here — a night where the homesickness comes back harder despite the earlier progress (this is what makes the eventual Observation feed feel true rather than linear). This is also where the singleton reflection goes, and a good week for a short, quotable, insight-dense line you'd actually want to pin live during the demo — something like a single sharp realization mid-entry, distinct in tone from the surrounding text so it stands out when you're clicking around.

**Week 4 (~3–4 entries):** Visible resolution on the main arcs — office hours paid off, roommate's become a real friend, the org gave them something small to own, the second money-stress mention. Write one entry from back home during a weekend visit (a believable, narratively real moment to opt into location tagging — don't force it into every entry, opt-in should look selective and deliberate, same as a real user).

## Writing guidelines

- **Multi-turn, not monologue.** Each Entry should be several back-and-forth exchanges with the AI, not one big paragraph — the pipeline works off the concluded transcript, and multi-turn is also just more representative of how the app is actually used.
- **Vary length and register.** Some entries are three lines before bed. Some are long and rambling. Uniform entries read as generated, not lived.
- **Don't pre-sort your own thoughts.** A real diary entry doesn't cleanly separate "the class thing" from "the roommate thing" — let them bleed into each other where it's realistic, and let the extraction do the separating.
- **Let the relapse happen.** Real progress isn't monotonic — one setback entry mid-arc is what makes the eventual Theme synthesis text feel earned rather than scripted.

## Technical checkpoints (so nothing gets missed)

- [ ] At least one entry with 3 distinct topics in a single conversation (multi-Theme extraction)
- [ ] The homesickness thread has a visible dip after visible progress (non-linear arc)
- [ ] One entry contains a phone number or email address in natural context (sanitizer demo)
- [ ] One or two entries have location opted in, narratively justified, not every entry
- [ ] One singleton reflection that never recurs (orphan node in the graph)
- [ ] One short, quotable line worth pinning live during the demo
- [ ] By week 3–4, at least two Themes have 2+ Observations (so "Unpack Further" is live and produces something real to show)
