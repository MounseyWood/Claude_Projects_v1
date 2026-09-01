# Pinned Swatch — an image fixed to an XPBD solver

A single self-contained HTML file. Open `index.html` in any browser with WebGL;
there is no build step, no dependency, and no network call except the Google
Fonts stylesheet.

## What it answers

Can XPBD be fixed to an image to make it interactive? Yes, and "fixed" carries
two distinct meanings that both have to be built:

1. **Binding the picture to the solver.** A regular grid of particles is laid
   over the bitmap. Each particle stores the UV it had at rest, so the texture
   is welded to the mesh and every triangle carries its patch of pixels. The
   GPU interpolates within each triangle; nothing re-samples the image.
2. **Fixing particles in place.** A pin is inverse mass `w = 0` — the solver
   computes a correction and multiplies it by zero. It is the same attachment
   constraint the pointer uses, taken to the limit `α → 0`.

## Method

Substepped XPBD: each visual frame is split into *n* substeps of `Δt/n`, with a
single Gauss–Seidel iteration and a multiplier reset per substep.

```
ã   = α / Δt²
Δλ  = ( −C − ã λ ) / ( Σ wᵢ|∇ᵢC|² + ã )
Δxᵢ = wᵢ Δλ ∇ᵢC
```

Constraint topology on the grid: structural edges (warp and weft), shear
diagonals, and `i → i+2` bending pairs. Shear and bend share a compliance
multiplier, because woven cloth barely stretches along the grain but gives
readily on the bias.

Interaction is three attachment constraints wearing different clothes:

| Thing        | Constraint        | Compliance |
|--------------|-------------------|------------|
| Pin          | attachment        | `α = 0` (via `w = 0`) |
| Pointer grip | attachment, patch | `α = 2e-7`, force-capped |
| Form         | non-penetration   | projected on position |

The grip is force-limited using the multiplier itself (`f = λ/Δt²`, capped at
1.2 N per gripped particle), so a hard drag makes the cloth slip rather than
stretch without bound. Constraint-force estimates of this kind are one of the
things XPBD gives you that plain PBD does not.

## Measured behaviour

Settled peak structural strain after 3 s, no wind, on this mesh:

| Fixture   | Mesh  | α     | Substeps | Peak strain |
|-----------|-------|-------|----------|-------------|
| top edge  | 32²   | 1e-3  | 20       | 0.6 %  |
| top edge  | 32²   | 1e-3  | 8        | 2.3 %  |
| corners   | 32²   | 1e-3  | 20       | 10.5 % |
| corners   | 44²   | 1e-2  | 8        | 89.3 % |

Two things fall out of that table. Substeps buy far more accuracy than a
softer material does, which is the point of the small-steps result. And
compliance only governs once `ã = α/Δt²` is comparable to `Σ wᵢ`: below about
`1e-4` on this mesh the solver runs effectively inextensible and the slider
does nothing. The presets are tuned by eye for this mesh, not measured from
real fabric, and they do not transfer unchanged to another resolution.

## Known limits

- The sheet is 2D, so it stretches and sags in plane but cannot fold in depth.
  The same solver in 3D gives true drape; the texture then goes edge-on.
- No self-collision, and no tearing. Tearing needs vertex splitting and
  re-triangulation, not just constraint removal — dropping constraints alone
  makes the texture ladder rather than part.
- A grid mesh means a rectangular sheet. A cut-out shape wants an alpha-contour
  trace and a constrained Delaunay triangulation instead.

## References

- Macklin, Müller & Chentanez, *XPBD: position-based simulation of compliant
  constrained dynamics*, MIG 2016. https://dl.acm.org/doi/10.1145/2994258.2994272
- Macklin, Storey, Lu, Terdiman, Chentanez, Jeschke & Müller, *Small steps in
  physics simulation*, SCA 2019. https://dl.acm.org/doi/10.1145/3309486.3340247

---
Matthew Mounsey-Wood FHEA MA (RCA) LCF Alumni
