# Guild Wrapped

Character cards and a story-style yearly recap ("Wrapped") for the **Gay Furries of Azeroth** guild on WoW: Forever.
Every guildmate who sends in art of their character gets a card; tapping it plays their year in the guild, slide by
slide, then moves on to the next guildmate.

**Live site:** https://sepihub.github.io/GuildWrapped/ (GitHub Pages, from the `main` branch). No account needed to
view it.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page shell |
| `assets/style.css` | All styles, including the ten card themes |
| `assets/app.js` | Gallery, picture carousel, Wrapped story, add guide and entry builder |
| `data/characters.json` | The character list; the site reads it on load |
| `art/` | Character pictures |
| `clips/` | Video clips (MP4 or WebM, 2 minutes at most) |
| `artifact/guild-wrapped.html` | The earlier single-file Claude artifact version, kept for reference |

## Adding a character

Guildmates don't need any account. They post in the guild Discord:

1. Their `/gf export` code (required). Typing `/gf stats share on` first gives them the full Wrapped.
2. At least one picture of the character (required), up to 6.
3. Optional: a card theme, and up to 3 clips (YouTube links are easiest).

Then whoever adds characters:

1. Opens the site's **Make an entry** page (link at the bottom, or `#builder`), pastes the code, picks the pictures,
   theme and clips, and copies the entry.
2. Adds the entry to the `chars` list in `data/characters.json`.
3. Saves the pictures in `art/` with the file names the builder shows (and any clip files in `clips/`).
4. Commits and pushes. GitHub Pages updates the site within a couple of minutes.

## Entry format

```json
{
  "id": "c-mossbelly-thornpaw",
  "theme": "grove",
  "arts": [{ "src": "art/mossbelly-thornpaw-1.jpg" }],
  "clips": [{ "title": "Ony wipe", "youtube": "https://youtu.be/..." }, { "title": "Ding 60", "src": "clips/ding.mp4", "dur": 95 }],
  "name": "Mossbelly", "sn": "Thornpaw", "cls": "DRUID", "race": "Tauren", "lvl": 60, "fac": "Horde",
  "prof": [["Herbalism", 300, 300]], "tal": [["Feral Combat", 31]], "att": ["Molten Core"],
  "st": { "kills": 4812, "quests": 612 }
}
```

- `theme`: `guild` (default), `fiery`, `twilight`, `medieval`, `cute`, `frost`, `grove`, `arcane`, `fel`, `celestial`.
- `arts`: the first picture is the cover; cards keep a 3:4 shape, so portrait pictures look best. When `src` is a
  crop, add `"full": "art/full/<name>"` with the whole picture; the full-screen viewer (the ⤢ button on a card, or
  tapping the picture in a Wrapped) shows `full` when it's there, else `src`.
- Character fields come from the export code: `/gf export` gives `GFOA1.<crc32 hex>.<base64 of UTF-8 JSON>`; the
  builder checks the CRC32 and decodes it. `st` (shared stats) is there only when the player has stats sharing on.

## Versions (updating a character)

Updating never throws the old character away. The entry itself is the **latest** version, and `versions` holds
older snapshots, newest first. Each snapshot keeps `lvl`, `race`, `fac`, `prof`, `tal`, `att`, `st`, `arts`, `clips`,
`theme` and `exported` (the export's time), so an old version shows its own stats, pictures, clips and theme.

- On the site, a character with more than one version gets a "2 versions" tag on its card and a version picker
  under its name in the Wrapped. The latest version also gets a **Since last time** slide (levels, mobs, quests,
  dungeons, bosses, epics and deaths gained since the previous version).
- To update someone: open **Make an entry**, choose "Update <name>", paste their new export code, optionally add
  new pictures, clips or a theme, and copy the entry. It already contains their current version as a snapshot:
  replace their whole entry in `data/characters.json` with it. New pictures are named with the date
  (`art/<name>-<yyyy-mm-dd>-1.jpg`) so they never overwrite old ones.
- Never delete files from `art/` or `clips/` that a snapshot still points to.

## Wrapped slides

Intro (picture carousel), mobs and quests, dungeons/bosses/flights/hearthstones, loot (epics, rares, first epic,
gold earned), professions, best XP/hour and play time, deaths, attunements, memories (clips), outro. Slides with no
data are skipped. Each card links straight to its Wrapped: `#c-<id>`.

## Not included yet

PvP kills, top hit, played time and deathroll records live in Sephya's leaderboard addon, not in the export code.
Adding them to the export would let the cards show them.
