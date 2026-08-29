# Annealed Alphabet

A writing system that designs itself, live, in the browser.

Twenty-six glyphs start as random marks on a 3x4 stroke lattice. Simulated
annealing then cools them under an energy function with two terms pulling in
opposite directions:

- **Separation.** Every glyph is rasterised at 18x24 and gaussian-blurred, then
  compared to every other glyph by RMS distance. The energy is a soft-max over
  pair similarity, `sum exp(-d/tau)`, so nearly all the pressure lands on the
  closest pair. This is the legibility term: it asks that no two letters survive
  being read badly in the same way.
- **Family resemblance.** `sum (count_s / n)^2` over the 53 candidate strokes
  rewards the alphabet for concentrating on a shared vocabulary. This is the
  term that makes the result read as one hand rather than a bag of marks.

A third term charges for each stroke (pen work plus ink), and glyphs must be
connected, 3-6 strokes, and at least two lattice rows tall.

The two main terms are genuinely opposed, and where they settle is the design.
The sliders let you move that settlement: at high family resemblance the
alphabet contracts toward a monogram, at low resemblance it scatters.

## Notes on the implementation

- Everything is one self-contained HTML file. No build, no dependencies; the
  only external request is the Google Fonts stylesheet.
- Rasterisation, blur and pair distances are hand-rolled over `Float32Array`s
  rather than canvas `getImageData`, so a proposal costs one raster plus `n`
  distance evaluations. The annealer runs ~10k proposals/second and adapts its
  per-frame batch size to a 7.5 ms budget.
- Energy is maintained incrementally: changing one glyph touches one row of the
  pair matrix, and the separation, stroke and vocabulary totals are updated by
  delta rather than recomputed.
- The three energy terms scale differently with alphabet size (separation is
  O(n) at the margin, stroke cost O(1), vocabulary O(1/n)), so the weights are
  scaled by `n/26` and `(n/26)^2` and the temperature by `n/26`. A slider then
  means the same thing whether the alphabet has 8 letters or 34.
- Click any glyph to pin it out of the anneal; the rest redesigns itself around
  what you keep.

Open `index.html` in a browser. State persists in `localStorage`.
