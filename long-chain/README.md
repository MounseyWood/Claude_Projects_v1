# The Thread and the Loop

An interactive, phone-first fibre lab from the Phygital Materials Studio about polyester and recycling. It is built like a hands-on science-museum gallery: twenty-three full-screen exhibits snap like a social feed, and there are no information-only pages. Facts arrive as numbered discovery cards when you do something (42 in all, one hidden). A wrong move gets a question back instead of the answer. A tally on the progress bar opens a drawer of what you have found, with "Go there" links to the exhibits still hiding one.

The look is a 1-bit fibre lab: every shade is woven, drawn with point-paper weave structures (spot, twill, plain weave) as dithering, and each exhibit frays into the colour of the next. The thread unwinds from a spool on the first page and writes "hi" there, with The Dot as the dot on the i. Where a word is worth remembering, the thread writes it: PET under the chain you have just linked, a giant Z for Z twist, and rPET across a slogan tee. Between letters it passes behind the cloth, as in embroidery, so each letter stands on its own. Elsewhere it throws a lasso round the text, as it does round the title, and it swaps sides between exhibits. Each chapter moves the thread its own way (Make steps like pipework, Fibre curves, Yarn coils, loops and stitches, Combine drapes and waves, Return zigzags and sags), so no two exhibits share a route. An original pixel hand demonstrates the gesture when an exhibit sits untouched; comic sound words pop on actions; discovery cards are taped on.

The cover asks one question: polyester has memory, but can it be recycled, or decompose? The exhibits answer it in parts. Turn up the heat shows the memory (heat-setting, as in Issey Miyake's Pleats Please). Bury it answers the last part: microbes eat cotton, polyester stays whole underground, and in the sun it breaks up into microplastics instead of breaking down.

Sound is synthesised in the page with the Web Audio API, so there are no audio files: every comic word on screen (CLICK, ZIP!, HISSS, MUNCH and the rest) has a matching sound effect, discoveries chime, and the air jet whooshes while it is held. A Sound button in the top bar switches it off, and the choice is remembered on that device.

One Verlet-simulated thread runs through every exhibit and is the controller. It keeps what you do to it, so its shape, filament count, texture, form, plies, wrap, colour and recycling history carry forward. The care label at the end reads the thread back and decides whether the loop can close. Text blocks are solid: the thread routes round them.

Exhibits:

- **Warm-up:** guess how much fibre is polyester (59%), then how much of the world's oil goes into synthetic fibre (about 1.35%, one estimate).
- **Make:** link the chain (EG and TPA from oil and gas link into PET, which the thread writes out; each link gives off water; 1941 Terylene); melt, push and stretch (draw the fibre).
- **Fibre:**
  - Pick a nozzle (round, trilobal, hollow or channelled), then drag a torch, an ice cube or a sweat drop onto the microscope lens.
  - One strand or hundreds (mono-, multi- and microfilament).
- **Yarn:**
  - Puff it up: hold the air jet to blow loops into the filaments (air-jet texturing), or tap the heater to crimp them (false-twist texturing). A feel meter fills from slick to soft. One thick filament won't texture.
  - Cut it and spin it (staple fibre and twist): the thread draws a Z, the direction most single yarns are spun.
  - Ply it: add bobbins and turn the twist dial. The hanging loop snarls until the ply twist balances the twist in each strand.
- **Combine:**
  - Wrap it: pull a cotton, wool or elastane yarn off the rail and bring it to the thread, which leans towards it; it snaps on and the wrap spreads out from where it landed (core-spun). Miss, and the yarn swings back to its hook.
  - Colour it (a dye bath that only works at about 130°C, or pigment into the melt). Blends reveal that only the polyester takes the dye.
- **For and against:** a tug-of-war.
- **Wear:** the washing machine is the interface. Fine, staple and loose yarns shed more.
- **Return:**
  - Where recycled polyester comes from: bottle to a slogan tee that reads rPET.
  - Feed the recycler: blends jam it; strip them off. Each melt breaks links, and the thread shows it.
  - Unzip the chain: tip a flask of water, glycol or enzymes into the tank and the chain breaks into its building blocks (dye leaches out, cotton comes out whole). Then link it back up, clean.
  - Spot the PET in a PET/PLA fork, then find out where PLA can compost.
  - Stretch without elastane (bicomponent spring).
  - Turn up the heat: the PLA ply melts first, and PET shows its memory.
  - Bury it: drag time from today to polyester's whole life since 1941. Cotton rots, polycotton loses only its cotton, a natural wrap on your thread rots underground but not in the air, and a scrap of polyester in the sun cracks into microplastics. Tap a microbe: it tries your polyester and gives up. The last card asks what a "biodegradable" label should tell you.
- **Promise:** tie knots.
- **Check yourself:** five quick questions with hints for wrong answers; each right answer threads an eyelet on the thread.
- **The end:** the care label reads the thread back. **Reflect and copy** asks two questions and copies the label and answers as plain text to paste into a Canvas discussion or journal. **Notes and sources** is written for students: outcomes, how the lab works, questions to think about, confidence ratings and 49 sources.

It is built for asynchronous guided independent study: the notes give the time (about 20 minutes), a pixel hand demonstrates gestures, and nothing needs a tutor or an account. Nothing is saved when the page closes, so the copy step is the record.

- `index.html`: the interactive piece (KU palette, Arial, no italics; retro flat-colour style after *The Dot and the Line*, 1965).
- `storyboard-v2.html`: the earlier 9:16 storyboard and animatic, kept for reference.
- `canvas/the-thread-and-the-loop.html`: the Canvas (VLE) version, one self-contained file to upload and embed in an iframe. See `canvas/README.md`. Rebuild it with `python3 long-chain/tools/build_canvas.py` after changing `index.html`.
- Published view: https://claude.ai/artifact/MG2tU9T3DhzUS1XftDt6xQ

The file is written as an artifact page (no `<html>`/`<head>` wrapper); it still opens directly in a browser.

Matthew Mounsey-Wood FHEA MA (RCA) LCF Alumni
