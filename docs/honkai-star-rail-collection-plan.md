# Honkai: Star Rail Character Collection Plan

## Why Start With One Game

Start with one game before comparing across games. Honkai: Star Rail is a strong first target because character information is relatively centralized across official HoYoverse channels, game pages, trailers, animated shorts, livestream/drip marketing posts, wiki/database mirrors, and visible fan communities.

The goal is to build a deep character dataset first, then generalize the schema to other games.

## Character Batch 1

Start with a mixed batch of character types:

- Kafka: Stellaron Hunter, major story/fanbase signal
- Firefly: Penacony story focus, animated short, high fan creation potential
- Dan Heng / Imbibitor Lunae: main cast plus alternate form
- March 7th: mascot-like main cast member
- Trailblazer: player avatar/protagonist
- Jing Yuan: Xianzhou popularity and meme/community signal
- Acheron: major trailer/story/style signal
- Sunday: strong fan anticipation and playable-release community signal

This first batch tests: protagonist, avatar, main cast, villain/antihero, alternate form, story-heavy character, meta-relevant character, and fan-favorite character.

## Sources To Collect

### Official Sources

- HoYoverse / Honkai: Star Rail official site
- Official character pages or character announcements
- Official YouTube trailers, animated shorts, Keeping Up With Star Rail, myriad celestia trailers, music videos
- Official HoYoLAB posts
- Official X/Twitter posts, especially drip marketing
- Version livestream pages or recap posts

### Structured/Reference Sources

- Wiki/database pages for release version, rarity, path, combat type, faction, world, voice actors
- Wikimedia pageviews when a character has a dedicated article
- YouTube metadata from official videos: views, likes if available, publish date, title, video type

### Community/Fan Sources

- Reddit discussion volume and top posts
- HoYoLAB posts and engagement
- Pixiv / Danbooru / Zerochan / DeviantArt-style fan art counts where accessible and safe to use
- Cosplay search counts or curated examples
- Meme visibility and recurring fan phrases
- Shipping/community relationship tags where relevant

Community data must be labeled carefully. It is evidence of fandom activity, not proof of objective popularity.

## Per-Character Fields

Each HSR character should collect:

- Identity: name, aliases, faction, world/region, playable status, release version
- Gameplay: rarity, path, combat type, role, signature Light Cone, team/meta notes
- Story: arc, faction relationships, major quests, companion mission, narrative importance
- Official media: trailers, animated shorts, teasers, livestream/drip posts, music videos
- Voice/cast: CN, JP, KR, EN voice actors where sourced
- Visual design: dominant colors, outfit, silhouette, accessories, weapon/tool, motifs
- Fanbase: fan art, cosplay, memes, ships, Reddit/HoYoLAB discussion, controversies if any
- Popularity signals: video views, pageviews, fan creation counts, banner/release hype proxies
- Citations: official URL, database URL, fan/community URL, retrieval date, confidence

## Media Taxonomy

For each official video/media item:

- `animated_short`
- `character_trailer`
- `combat_trailer`
- `keeping_up`
- `myriad_celestia`
- `music_video`
- `version_trailer`
- `livestream_segment`
- `drip_marketing`

Track title, URL, publish date, official channel, character focus, and engagement metrics if available.

## Fan-Creation Taxonomy

Use separate fields for each community source:

- `fan_art_count`
- `cosplay_count`
- `reddit_posts`
- `hoyolab_posts`
- `video_edits`
- `meme_presence`
- `ship_tags`

Each should include source, query/tag used, count or qualitative level, date collected, and confidence.

## Scoring Later

Do not combine these into one score immediately. First collect raw signals. Later we can create separate analysis dimensions:

- official prominence
- gameplay/meta prominence
- story importance
- fan creation activity
- video/media reach
- visual design distinctiveness
- cross-community popularity

Then the website can compare characters by dimension instead of pretending one popularity score explains everything.
