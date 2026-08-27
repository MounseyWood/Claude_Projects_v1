# Draft — a loom you can program

A weaving draft editor whose output is not a picture of cloth but a yarn-level
simulation of it: every warp and weft thread, interlaced exactly as drawn, that
you can then take hold of and pull.

`index.html` is self-contained — open it in a browser, no build step.

## The model

Two particles per crossing, one on each yarn system, pinned together in the
plane and separated in z by a yarn diameter. Which one sits on top is the
drawdown bit and nothing else. Constraints:

| type | what it is |
| --- | --- |
| stretch | along a yarn, resting at its actual woven path length |
| bend | two crossings apart, resting at the woven shape — a finished cloth is *set* |
| pin x, pin y | warp and weft held together in the plane at each crossing |
| contact | one-sided in z: threads may part but not interpenetrate |
| shear | cell diagonals — inter-thread friction, the one dialled number |
| lock | one-sided diagonal: threads jam, angle derived from diameter and pitch |

**No collision detection is needed.** The draft already says which threads cross
and in what order, so every contact pair is known before the simulation starts.
That is what makes a yarn-level model cheap enough to run in a browser.

## What is derived vs dialled

Derived from the draft alone: which thread is on top at each crossing; crimp;
float length and therefore face coverage; the locking angle (from thread
thickness against pitch — 31.8° of shear at the default sett).

Dialled: shear rigidity (the "grip at crossings" slider), yarn tensile and
bending compliance, and the flattening factor at crossings.

## Verification

`tools/` scripts slice the physics core out of `index.html` between the
`/*PHYSICS-START*/` and `/*PHYSICS-END*/` markers and evaluate it, so they test
the code that ships.

```
node tools/crimp-check.js    # relaxed crimp vs closed-form prediction from the drawdown
node tools/shear-cal.js      # bias/grain ratio against shear compliance
node tools/converge.js       # where the answer stops moving (mass and iterations)
node tools/weave-probe.js    # tensile test by cut angle and weave
node tools/page-check.js     # loads the page in headless Chromium, both themes
node tools/live-check.js     # drives the page's own controls and reads its gauges
```

`crimp-check.js` is the one that matters. Crimp can be predicted in closed form
from the drawdown — count the z-flips along a yarn — and the relaxed simulation
reproduces it to within 0.03 percentage points on every weave, warp and weft,
in the right order:

| weave | predicted | simulated |
| --- | --- | --- |
| plain | 4.84% | 4.81% |
| basket 2/2 | 2.24% | 2.24% |
| 2/2 twill | 2.42% | 2.41% |
| 3/1 twill | 2.42% | 2.41% |
| 5-end satin | 1.92% | 1.90% |

(at the older sett of 0.70; the page now defaults to 0.85, giving 7.04% for plain)

Bias behaviour, plain weave at 2 N/m, converged:

| grip at crossings | grain | bias | ratio | shear at 45° |
| --- | --- | --- | --- | --- |
| 0.01 | 0.360% | 0.787% | 2.2× | 0.6° |
| 0.1 (default) | 0.410% | 4.918% | 12.0× | 4.4° |
| 1 | 0.435% | 20.588% | 47.3× | 24.9° |

Yarn tensile strain stays under 0.02% throughout, which is the convergence
diagnostic: at a compliance of 1e-7 m/N the thread cannot physically elongate
at these loads, so any reading above zero is solver residual.

## Still to do

- Feed the measured compliance back into the shirt demo, replacing its invented
  alpha values with ones derived from a weave structure
- A herringbone preset, to show treadling alone changing the cloth
- Yarn slippage at crossings (currently the grip is a spring, not a limit)
