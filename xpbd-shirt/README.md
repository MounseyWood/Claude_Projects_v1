# XPBD Shirt Block

An interactive demonstration of Extended Position-Based Dynamics, run side by side
against the classic Verlet/Jakobsen relaxation that most cloth demos use.

`index.html` is self-contained — open it in a browser, no build step, no dependencies.

## What it shows

Both panes simulate the same shirt block: the same mesh, constraints, gravity,
substeps and passes. Only the constraint-projection rule differs. Holding the
fabric fixed and sweeping the solver budget separates them:

| substeps × passes (jersey) | Verlet | XPBD |
| --- | --- | --- |
| 2 × 4  | 2.266% | 1.093% |
| 8 × 4  | 0.210% | 0.455% |
| 20 × 4 | 0.043% | 0.456% |

XPBD reaches the fabric's own answer and stops. Verlet keeps stiffening, because
it is converging towards a rigid sheet rather than towards a material. Holding the
budget fixed and changing the fabric across four decades of compliance moves XPBD
by ~5.7× and moves Verlet by 1.0× — it has no fabric parameter to move.

## The shirt

A dropped-shoulder T-block drafted in code from two outline curves, sampled on a
grid, welded front-to-back along the shoulder, side seam and underarm, and inflated
by each particle's breadth-first distance from the nearest seam. Neck, cuffs and hem
are left as free edges.

## Verification

`tools/` holds three headless scripts. Each one slices the physics core straight out
of `index.html` between the `/*PHYSICS-START*/` and `/*PHYSICS-END*/` markers and
evaluates it, so they test the code that actually ships in the page.

```
node tools/chain-validate.js   # both solvers against a closed-form hanging chain
node tools/solver-probe.js     # budget and fabric sweeps on the shirt
node tools/mesh-diag.js        # mesh sanity: rest lengths, connectivity, strain hot spots
node tools/page-check.js       # loads the page in headless Chromium, both themes
```

`chain-validate.js` is the one that matters: a 12-link chain has a known answer
(15.304 mm total elongation at α = 1e-3). XPBD lands within about 1% of it from
8 × 4 upwards; Verlet ranges from −26.6% to −99.5% over the same budgets.
