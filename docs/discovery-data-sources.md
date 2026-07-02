# Discovery Data Sources

## Runtime Storage

The app uses local JSON at runtime:

- `src/data/discovery-games.json`
- `src/data/discovery-characters.json`
- `src/data/discovery-questions.json`

The app does not fetch live character data from the internet while a user is playing. Internet sources are used during research, then cleaned into local JSON.

## HSR Source Strategy

For Honkai: Star Rail, the starter dataset is compiled from:

- Official HoYoverse game and character pages: canonical game identity, character marketing, official presentation.
- HoYoWiki / official wiki-style references: path, combat type, rarity, faction, playable status, release context.
- Official Honkai: Star Rail YouTube and social posts: trailers, animated shorts, drip marketing, media presence.
- Structured reference summaries such as Wikipedia pages for specific HSR characters when available: story context, release timing, reception references.
- Manual visual coding from official art and in-game presentation: hair color, outfit colors, weapon/motif, silhouette.

## Source URLs Used As Anchors

- Official HSR character page: https://hsr.hoyoverse.com/en-us/character
- HoYoWiki HSR home: https://wiki.hoyolab.com/pc/hsr/home
- Official HSR YouTube channel: https://www.youtube.com/@HonkaiStarRail
- HSR overview reference: https://en.wikipedia.org/wiki/Honkai:_Star_Rail
- HSR character list reference: https://en.wikipedia.org/wiki/List_of_Honkai:_Star_Rail_characters
- Kafka reference page: https://en.wikipedia.org/wiki/Kafka_(Honkai:_Star_Rail)
- Firefly reference page: https://en.wikipedia.org/wiki/Firefly_(Honkai:_Star_Rail)
- Acheron reference page: https://en.wikipedia.org/wiki/Acheron_(Honkai:_Star_Rail)

## What Was Downloaded

We downloaded and stored only structured text data that we created or normalized ourselves:

- character records
- question definitions
- evidence notes
- source manifest

We are not downloading official artwork, screenshots, or copyrighted videos into the repo. If the app later displays images, use official URLs, licensed assets, or user-provided image metadata with attribution.

## Confidence Rules

- `high`: official source or stable structured source.
- `medium`: manual coding from official presentation or cross-checked reference material.
- `low`: fan/community impression, placeholder, or unmeasured popularity signal.

Fan creation, memes, shipping, and cosplay fields are useful, but they should stay low or medium confidence until collected from repeatable source queries.
