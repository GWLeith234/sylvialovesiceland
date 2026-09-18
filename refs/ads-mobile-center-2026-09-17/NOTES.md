# Mobile ad centering refs — 2026-09-17

Live bug: 300px `.ad-box` / `.ad-half` / `.ad-infeed` sat left on ~390 phones
because `@media (max-width: 990px)` set `max-width: 300px` with no horizontal
auto margins, and `.ad-infeed { margin: 16px 0 }` zeroed L/R.

- AFTER = this branch, local `python3 -m http.server` at 390×844
- SafeTravel chip/CSS/JS untouched (crimson bar still at top of both shots)
- Sticky `.ad-foot` stays full-bleed (`left: 0`, width 390)
- Desktop `.rail .ad-unit { margin: 0 }` unchanged (1200px check)

Measured used box on 390 viewport (equal leftover = centered):

| Unit | left | right | width |
| --- | --- | --- | --- |
| home `.ad-infeed` | 45 | 45 | 300 |
| article `.ad-half` | 45 | 45 | 300 |
| article `.ad-box` | 45 | 45 | 300 |

Files:

- `home-mid-scroll-390.png`
- `article-mid-scroll-390.png`
- `article-rail-box-390.png` (extra: lower article rail box)
- `MEASURE.json`
