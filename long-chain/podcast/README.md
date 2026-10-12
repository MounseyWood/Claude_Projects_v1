# Oil to soil? Three bite-size conversations

A podcast resource of the Phygital Materials Studio, alongside *The Thread and the Loop* and the *Oil to soil?* film. Three episodes, each about 4 minutes, so each fits a short walk or a commute.

| Episode | Title | Pairs with | Outcome |
|---|---|---|---|
| 1 | [Made from oil](episode-1-made-from-oil.md) | Make, Fibre | Explain what polyester is made from, and how one material becomes very different fibres. |
| 2 | [Every choice counts](episode-2-every-choice-counts.md) | Yarn, Combine, For and against, Wear | Explain how design choices change a polyester garment, while it's worn and after. |
| 3 | [Can it come back?](episode-3-can-it-come-back.md) | Return | Explain why most polyester clothing doesn't come back, and what "biodegradable" should have to prove. |

**Voices.** Two AI voices (Google Gemini text-to-speech): a curious Host and an engaging Specialist. Each episode says so in its first line, not just in the credits.

**Facts.** Every claim comes from the Studio's notes and carries its confidence rating there. Where the evidence is weak or contested, the Specialist says so aloud.

**Each episode ends** with one question to take away, and episode 3 ends with the Studio's central question: what would you design if every garment had to come back to you?

**Transcripts.** Each episode file is the full transcript, with its sources.

**Making the audio.** With a Gemini API key in the environment:

    GEMINI_API_KEY=... python3 long-chain/tools/make_podcast.py long-chain/podcast/episode-1-made-from-oil.md episode-1.mp3

Voices can be changed with `HOST_VOICE` and `SPECIALIST_VOICE`.

Matthew Mounsey-Wood FHEA MA (RCA) LCF Alumni
