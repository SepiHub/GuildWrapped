# Guild Wrapped

Character cards and a story-style yearly recap ("Wrapped") for the **Gay Furries of Azeroth** guild on WoW: Forever.
Every guildmate who sends in art of their character gets a card; tapping it plays their year in the guild, slide by
slide, then moves on to the next guildmate.

The live page is a Claude artifact. This repo tracks its source and how it works.

## Files

- `guild-wrapped.html`: the whole page (styles, script and the saved data in one file).

## How it works

- **Cards:** art (up to 6 pictures, the first is the cover), name, level, race, class and main professions. Arrows,
  dots and swiping flip through the pictures. The card keeps a 3:4 shape.
- **Themes:** each character picks one: Guild (default), Fiery, Twilight, Medieval, Cute, Frost, Grove, Arcane, Fel,
  Celestial. A theme sets the card's edge glow, image tint, name font and the colors of their Wrapped slides.
- **Wrapped slides:** intro, mobs and quests, dungeons/bosses/flights/hearthstones, loot (epics, rares, first epic,
  gold earned), professions, best XP/hour and play time, deaths, attunements, memories (clips), outro. Slides with no
  data are skipped.
- **Memories:** up to 3 video clips per character, MP4 or WebM, 2 minutes and 20 MB each.

## Where the data comes from

Stats come from the GFoA Guild Sync addon's export code (`/gf export`), the same code people paste into the guild
Discord: `GFOA1.<crc32 hex>.<base64 of UTF-8 JSON>`. The page checks the CRC32, decodes it and keeps, per character:
`n` name, `sn` surname, `lvl`, `cls` (class token, e.g. `DRUID`), `race`, `fac`, `prof` (`[name, skill, max]`),
`tal`, `att` (attunements) and `st` (shared stats, only when the player has `/gf stats share on`).

## Adding a character

Anyone who can edit the page can add a character. Guildmates get that by being invited **by email as Editors**
from the page's Share menu (people outside the owner's Claude organization can't save or upload any other way, and
an outside Editor loses that access while the page is also shared by public link).

1. In game: `/gf stats share on` (for the full Wrapped), then `/gf export`, and copy the code.
2. On the page: **Add character**, paste the code, add at least one picture.
3. Optional: up to 6 pictures in total, a card theme, up to 3 clips.
4. Save. The page saves itself as a new version and everyone sees it.

Required: an export code and one picture. Each editor can change or delete only the cards they added (stored as
their viewer id in `by`); the page owner can change every card.

Pictures and clips are stored as the artifact's assets; the page itself holds the character list as JSON in
`<script id="gw-data">`. The artifact declares the `artifact`, `assets` and `user` capabilities.

## Not included yet

PvP kills, top hit, played time and deathroll records live in Sephya's leaderboard addon, not in the export code.
Adding them to the export would let the cards show them.
