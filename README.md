# Punching shear at opening-adjacent slab–column connections — design calculator

A single-file, dependency-free calculator for the **punching shear resistance of interior
slab–column connections with openings adjacent to the column**, with and without strengthening.
It implements, term by term, the closed-form design equation and the partial factors proposed in
the accompanying paper.

**[Open the calculator](https://ORGANISATION.github.io/REPOSITORY/)** ·
**Archived release + database: [10.5281/zenodo.21872724](https://doi.org/10.5281/zenodo.21872724)**

> `ORGANISATION/REPOSITORY` is a placeholder and will be replaced when the repository address is
> fixed.

---

## What it does

The tool evaluates a three-tier resistance model and prints **every intermediate value**, so the
result can be checked by hand rather than taken on trust:

```
Tier 1   V_R,EC2        EC2-form baseline resistance of the equivalent solid slab, evaluated
                        WITHOUT the EC2 material partial factor (C = 0.18, i.e. gamma_c = 1.0),
                        with the measured cylinder-equivalent f_c and the gross rho_l
         x kappa_cal    calibration constant, kappa_cal = 1.1544
Tier 2   × η_op         opening factor,  η_op = 1 − 0.5·√(1 − κ_u),  κ_u = u₁,red / u₁
Tier 3   × k_g,0·η_op,g strengthening factor (CFRP / TRM / shear studs), by layout
         ÷ γ_R          partial factor  →  design value V_d
```

It also reports:

- the **design value V_d as the primary output**, with the mean prediction shown only as a
  secondary figure;
- **scope, validity-range, evidence-level and break-even warnings**, in the same order and with
  the same wording as the Python reference implementation;
- a **break-even check** — strengthening increases the *design* resistance only if
  `γ_g·k_g,0·η_op,g` exceeds `γ_R,strengthened / γ_R,unstrengthened` (1.158 at RC2). Two of the
  nine method × layout combinations fall below that threshold, and the tool says so.

## Scope — read this before using it

The model was calibrated on **interior columns, concentric loading, no shear reinforcement,
rectangular column cross-sections and non-prestressed slabs with no in-plane compression
(sigma_cp = 0)**. Anything outside that produces an explicit warning; the tool
does not silently extrapolate, but it also does not refuse to compute — the judgement stays with
the engineer.

Calibration set: **80 unstrengthened specimens from 11 studies**. The strengthening chain
splits by factor: the **method baselines k_g,0 for CFRP and shear studs draw on solid-slab
pairs from three laboratories** (16 and 13 pairs; TRM has no external solid pair and rests on
4 single-laboratory pairs — evidence level B), while the **layout factor η_op,g rests on 27
with-opening twin pairs** from a single laboratory programme. The six opening-adjacent external
pairs are a limited comparison only — never part of the calibration. Full provenance:
`faz7_provenance.csv` in the data set. Parameter ranges covered:

| parameter | range |
|---|---|
| effective depth *d* | 54 – 200 mm |
| concrete strength *f*_c | 19.6 – 44.0 MPa |
| reinforcement ratio ρ_l | 0.39 – 1.57 % |
| perimeter retention κ_u | 0.166 – 1.00 |
| opening distance *s*_op/*d* | 0 – 5.33 |
| column aspect *c*₁/*d* | 1.0 – 2.78 |

**The partial factors are research recommendations, not a code calibration.** They come from
an EN 1990-based design-value procedure applied on the resistance side — sensitivity factor
alpha_R = 0.8, design quantile p = Phi(-alpha_R*beta), lognormal model uncertainty — and
**not** from a full Annex D calibration: the finite-sample uncertainty of the estimated
parameters is reported separately as a bootstrap confidence interval rather than being built
into the factor. The factor for
strengthened connections is *indicative*: it derives from six comparison pairs and its
independence assumptions have not been tested. TRM and the L-arrangement layout are **evidence
level B** — single laboratory, no independent comparison point — and the tool marks them as such
wherever they appear.

## Model identity

| | |
|---|---|
| Tier-1 base | EN 1992-1-1:2004 form, **without the material partial factor** (C = 0.18), measured f_c, gross ρ_l, σ_cp = 0 |
| Calibration constant | κ_cal = 1.1544 (measured on 21 solid controls only; validation uses a fold-clean κ_cal^(−j)) |
| Opening factor | η_op = 1 − 0.5·√(1 − κ_u) — **no fitted parameter** |
| Partial factors γ_R (RC2) | 1.90 unstrengthened / 2.20 strengthened |
| Break-even threshold (RC2) | 1.158 |
| Database version | `database_v3_frozen.csv`, sha256[:16] = `9df2366017ff721d` |
| Tool version | **2.1** — single source: `src/reference_model.py::ARAC_SURUMU`; the title band, the footer, the JavaScript core and this line are all built from it and `tests/test_web_yapisi.py` fails if they diverge |

The JavaScript core is a line-by-line port of `src/reference_model.py` and agrees with it to
**1e-9 on every intermediate value**.

## This repository does **not** contain the specimen data

The calculator ships with the calibration constants and lookup tables it needs, and **nothing
else**. Individual test results cannot be recovered from it.

The experimental database, the extraction records, the exclusion log, the data dictionary and the
full analysis code are published separately, with their own identifier:
**[10.5281/zenodo.21872724](https://doi.org/10.5281/zenodo.21872724)**. Use the Zenodo record for
anything involving the underlying data; use this repository to run the calculator.

## Running it

Open `index.html` — in the browser, from a local copy, or through GitHub Pages. There is no build
step, no server, no package installation and no network request at runtime. It works offline and
from a `file://` path.

## Figure mode

Append `?print=1` to the URL to remove the fixed height and scrolling from the calculation-chain
and warnings panels, so that the whole chain and every warning are visible in a single
screenshot. Add `&nocharts=1` to hide the design-chart region and the footer as well — the
charts are published separately as vector figures, and a screenshot of them would only be a
lower-resolution duplicate. `#print` and `#print-nocharts` work too, for environments that drop
the query string from a `file://` URL.

Normal use is unaffected: without the parameter the panels stay scrollable so that the four
regions fit one screen. Printing the page keeps the charts, deliberately — only the screenshot
mode hides them.

The screenshot used as a figure in the article is reproduced from a documented input set —
corner layout with CFRP, RC2 — which yields V_d = 104.03 kN against 109.29 kN unstrengthened and
raises the break-even warning. The full recipe is in `docs/makale/00_sekil_tablo_listesi.md`,
and `tests/test_kapanis_tutarliligi.py` recomputes these two values on every test run so that
the example cannot go stale unnoticed.

## Citation

Please cite the paper for the method and the Zenodo record for the data:

```
[Authors]. Capacity loss and recovery at opening-adjacent slab–column connections:
a closed-form design equation with partial factors. [Journal], [year].
[DOI to be inserted on acceptance]

[Authors]. Punching shear of opening-adjacent slab–column connections:
experimental database, analysis code and design tool. Zenodo, 2026.
https://doi.org/10.5281/zenodo.21872724
```

## Licence

To be confirmed before release — intended: code under MIT, data and documentation under CC BY 4.0.
