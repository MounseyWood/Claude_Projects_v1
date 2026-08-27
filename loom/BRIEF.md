# The Loom — design brief

**Status:** not started. Agreed 2026-08-27, to build next session.
**Prereq:** the XPBD solver in `../xpbd-shirt/index.html` (physics core sits between
the `/*PHYSICS-START*/` and `/*PHYSICS-END*/` markers, and the `tools/` probes eval
it directly — reuse both patterns here).

## What it is

A weaving draft editor that is secretly two lessons. Presents as a pattern toy;
turns out to be about shear kinematics, and then about the history of computing.

### Reveal 1 — the draft drives real yarn
Warp and weft as XPBD rods, interlaced exactly as drafted.

**The insight that makes it buildable: no collision detection is needed.** The draft
already says which yarns cross and in which order, so every contact pair is known by
construction. A 24x24 swatch is ~48 yarns and ~576 known crossings.

### Reveal 2 — then you pull it
On grain: almost no extension, you are pulling along the yarns. At 45 degrees: large
extension, and visibly *the yarns do not stretch* — they rotate at the crossings and
the square grid shears into a diamond. Bias stretch is a mechanism, not a material
property. That is the aha, and it has to be watchable, not stated.

### Reveal 3 — it hands you a number
Measured compliance on grain / cross-grain / bias, in m/N, plus a "drape this" button
that feeds the shirt demo. This repairs the one dishonest line still on that page:
the admission that its alpha values are invented rather than measured. Plain weave vs
2/2 twill vs 5-end satin should then drape differently because their *structure*
differs.

### Reveal 4 — quiet, and last
The draft is a binary matrix. Jacquard punched cards to store exactly this, and that
card is the direct ancestor of the computing punch card. Lovelace: the Analytical
Engine weaves algebraic patterns as the Jacquard loom weaves flowers. **One sentence
near the end, after the reader has spent ten minutes programming a loom without being
told that is what they were doing.** Do not lecture; the whole effect depends on it
arriving late and understated.

## Technical notes worked out already

**Draft notation** (the real thing, weavers will recognise it):
- *threading* — which shaft each warp end passes through
- *tie-up* — which shafts each treadle lifts
- *treadling* — the sequence of treadles pressed

Drawdown (the interlacement matrix): warp end `i` is up on pick `j` iff
`tieup[treadling[j]][threading[i]]` is set. Boolean matrix, and it is also the thing
that makes Reveal 4 land.

**Yarn model:** chain of particles, distance constraints for stretch plus two-apart
distance constraints for bend — same as the shirt. Start there; only reach for proper
Cosserat rods with twist if the yarns look wrong.

**Contact at crossings:** one-sided constraint in z at each crossing. If the drawdown
bit is set require `warp.z - weft.z >= d`, else the reverse, where `d` is yarn
diameter. Project only when violated. Leave the yarns free to slide in-plane — that
sliding, plus friction at the crossings, is what makes woven cloth behave, and it is
what lets the grid shear on the bias.

**Measuring compliance:** clamp opposite edges, apply a known load, measure extension.
Repeat at 0 / 90 / 45 degrees. Units come out of it directly.

**Rendering:** stroked polylines with round caps, depth-sorted per segment, is probably
enough and is cheap — try that before extruding tubes.

**Rough cost:** ~2400 particles, ~5400 constraints for a 24x24 swatch. Comparable to
the shirt (746 particles / 4268 constraints ran at ~40fps with two sims on screen), so
one swatch should be comfortable.

## Open questions

- Does the bias shear read clearly at 24x24, or does it need a coarser swatch?
- Friction model at crossings — how much is needed before the fabric stops behaving
  like a loose net?
- Does compliance measured on a small swatch transfer sensibly to the shirt's 3cm mesh?
  The conversion depends on mesh spacing; work it out rather than fudging it.
- Draft library: plain, 2/2 twill, 3/1 twill, 5-end satin, huck lace? Enough to show
  structure changing behaviour, not so many it becomes a catalogue.

## Alternates that lost, kept in case of a change of heart

- **Shibori.** Fold, bind, dye, unfold; the unfolding is the moment. Buried lesson is
  symmetry groups — a fold plus a mark is a symmetry operation, itajime generates
  wallpaper groups. Blocked on self-collision, which the shirt demo deliberately omits.
- **Why darts exist.** Try to flatten a 3D form and watch it refuse. Buried lesson is
  Gaussian curvature: a sphere cannot be developed, and every dart is that theorem paid
  for in seam allowance. Most useful to the studio, least surprising to them.
