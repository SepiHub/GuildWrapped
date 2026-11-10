/* Guild Wrapped (static site). Data: data/characters.json. Pictures: art/. Clips: clips/ or YouTube links. */
(function () {
  "use strict";

  var DATA = { v: 1, chars: [] };
  var MAX_ARTS = 6, SLIDE_MS = 6500;
  var YEAR = new Date().getFullYear();
  var SECONDARY = { "Cooking": 1, "Fishing": 1, "First Aid": 1, "Poisons": 1 };
  var CLASSES = {
    WARRIOR: ["Warrior", "#C69B6D"], PALADIN: ["Paladin", "#F48CBA"], HUNTER: ["Hunter", "#AAD372"],
    ROGUE: ["Rogue", "#FFF468"], PRIEST: ["Priest", "#FFFFFF"], SHAMAN: ["Shaman", "#2F8FFF"],
    MAGE: ["Mage", "#3FC7EB"], WARLOCK: ["Warlock", "#8788EE"], DRUID: ["Druid", "#FF7C0A"]
  };
  var THEMES = [
    ["guild", "Guild", "Pastel rainbow, the house look"],
    ["fiery", "Fiery", "Embers, molten orange"],
    ["twilight", "Twilight", "Dusk violet and starlight"],
    ["medieval", "Medieval", "Old gold and engraved type"],
    ["cute", "Cute", "Candy pastels, round letters"],
    ["frost", "Frost", "Glacier blue and ice"],
    ["grove", "Grove", "Moss, leaves, druid green"],
    ["arcane", "Arcane", "Electric violet and teal"],
    ["fel", "Fel", "Toxic green flame"],
    ["celestial", "Celestial", "Starlit navy and gold"]
  ];
  var PAW = '<svg class="paw" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><ellipse cx="12" cy="16" rx="5.2" ry="4.4"/><ellipse cx="5.6" cy="10.4" rx="2.1" ry="2.6"/><ellipse cx="9.3" cy="6.6" rx="2.1" ry="2.7"/><ellipse cx="14.7" cy="6.6" rx="2.1" ry="2.7"/><ellipse cx="18.4" cy="10.4" rx="2.1" ry="2.6"/></g></svg>';

  // ---------- helpers ----------
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style") el.setAttribute("style", v);
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { add(el, k); }); return; }
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  function fmt(v) { return Math.round(num(v)).toLocaleString("en-US"); }
  function plural(n, one, many) { return fmt(n) + " " + (Math.round(num(n)) === 1 ? one : many); }
  function duration(sec) {
    sec = Math.round(num(sec)); var hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60);
    return hh > 0 ? hh + "h " + mm + "m" : mm + "m";
  }
  function clipTime(sec) { sec = Math.round(num(sec)); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
  function day(ts) { return ts ? new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; }
  function gold(copper) { return fmt(Math.floor(num(copper) / 10000)) + "g"; }
  function classInfo(cls) {
    var key = String(cls || "").toUpperCase().replace(/[^A-Z]/g, "");
    return CLASSES[key] || [cls ? String(cls) : "Adventurer", "#F9B8D4"];
  }
  function fullName(c) { return c.sn ? c.name + " " + c.sn : c.name; }
  function metaLine(c) { return ["Level " + (c.lvl || "?"), c.race, classInfo(c.cls)[0]].filter(Boolean).join(" "); }
  function mainProfs(c) { return arr(c.prof).filter(function (p) { return Array.isArray(p) && p[0] && !SECONDARY[p[0]]; }).slice(0, 2); }
  function stats(c) { return c.st && typeof c.st === "object" && !c.st.off ? c.st : null; }
  function themeKey(c) { var k = c && c.theme; return THEMES.some(function (t) { return t[0] === k; }) ? k : "guild"; }
  function slug(s) { return String(s || "character").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "character"; }

  var toastEl = null, toastTimer = 0;
  function toast(msg, isErr) {
    if (!toastEl) { toastEl = h("div", { class: "toast", role: "status", "aria-live": "polite" }); document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.className = "toast" + (isErr ? " err" : ""); toastEl.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.hidden = true; }, isErr ? 6000 : 3000);
  }

  // ---------- art ----------
  function hashStr(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // Placeholder art for the example cards: a night landscape tinted with the class color.
  function genArt(c, k) {
    var col = classInfo(c.cls)[1], r = rng(hashStr((c.name || "x") + ":" + (k || 1)));
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15121B"/><stop offset=".55" stop-color="' + col + '" stop-opacity=".55"/><stop offset="1" stop-color="#2B2235"/></linearGradient></defs>' +
      '<rect width="300" height="400" fill="#2B2235"/><rect width="300" height="400" fill="url(#g)"/>';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + (r() * 300).toFixed(1) + '" cy="' + (r() * 200).toFixed(1) + '" r="' + (r() * 1.3 + 0.3).toFixed(2) + '" fill="#EDE6F2" fill-opacity="' + (r() * 0.6 + 0.2).toFixed(2) + '"/>';
    s += '<circle cx="' + (60 + r() * 180).toFixed(0) + '" cy="' + (70 + r() * 50).toFixed(0) + '" r="34" fill="#FFF1A8" fill-opacity=".9"/>';
    [["#3A3245", 0.95, 210], ["#2A2433", 1, 255], ["#15121B", 1, 305]].forEach(function (L) {
      var pts = "0,400 0," + L[2], x = 0;
      while (x < 300) { x += 30 + r() * 40; pts += " " + Math.min(300, x).toFixed(0) + "," + (L[2] - 20 - r() * 70).toFixed(0); }
      s += '<polygon points="' + pts + " 300," + L[2] + ' 300,400" fill="' + L[0] + '" fill-opacity="' + L[1] + '"/>';
    });
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s + "</svg>");
  }
  function artsOf(c) { return arr(c.arts).filter(function (a) { return a && (a.src || a.gen); }).slice(0, MAX_ARTS); }
  function artSrc(c, a) { return a.src ? a.src : genArt(c, a.gen); }
  function artUrls(c) { return artsOf(c).map(function (a) { return artSrc(c, a); }); }
  function artUrl(c) { return artUrls(c)[0] || ""; }
  function playable() { return DATA.chars.filter(function (c) { return artUrl(c); }); }

  // Image carousel: arrows, dots and swipe; one image shows no controls.
  function carousel(urls, opts) {
    opts = opts || {};
    var idx = 0, n = urls.length, swiped = false;
    var track = h("div", { class: "car-track" }, urls.map(function (u, i) {
      return h("img", { src: u, alt: opts.alt ? opts.alt + (n > 1 ? ", picture " + (i + 1) + " of " + n : "") : "", loading: i ? "lazy" : null, draggable: "false" });
    }));
    var live = n > 1 && !opts.still;
    var dots = n > 1 ? h("div", { class: "car-dots", "aria-hidden": "true" }, urls.map(function () { return h("i"); })) : null;
    var prev = live ? h("button", { class: "car-arrow prev", type: "button", "aria-label": "Previous picture", onclick: function (e) { e.stopPropagation(); go(idx - 1); } }, "‹") : null;
    var next = live ? h("button", { class: "car-arrow next", type: "button", "aria-label": "Next picture", onclick: function (e) { e.stopPropagation(); go(idx + 1); } }, "›") : null;
    var el = h("div", { class: "car" }, track, prev, next, dots);
    function paint() {
      track.style.transform = "translateX(" + (-100 * idx) + "%)";
      if (dots) for (var j = 0; j < dots.children.length; j++) dots.children[j].className = j === idx ? "on" : "";
    }
    function go(i) { idx = (i + n) % n; paint(); if (opts.onMove) opts.onMove(idx); }
    paint();
    if (live) {
      var gest = opts.gestureEl || el, sx = null, sy = 0;
      gest.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; swiped = false; });
      gest.addEventListener("pointerup", function (e) {
        if (sx == null) return;
        var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; go(idx + (dx < 0 ? 1 : -1)); }
      });
      gest.addEventListener("pointercancel", function () { sx = null; });
    }
    return { el: el, go: go, wasSwipe: function () { var s = swiped; swiped = false; return s; } };
  }

  // ---------- export code (GFOA1.<crc32>.<base64 JSON>, from /gf export) ----------
  var CRC_TABLE = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(str) { var c = 0xFFFFFFFF; for (var i = 0; i < str.length; i++) c = CRC_TABLE[(c ^ str.charCodeAt(i)) & 255] ^ (c >>> 8); return ((c ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, "0"); }
  function parseExport(raw) {
    var s = String(raw || "").replace(/\s+/g, "");
    if (!s) return null;
    var m = /^GFOA1\.([0-9a-fA-F]{8})\.([A-Za-z0-9+\/=]+)$/.exec(s);
    if (!m) throw new Error("That isn't an export code. In game, type /gf export and copy the whole box with Ctrl+A, Ctrl+C.");
    if (crc32(m[2]) !== m[1].toLowerCase()) throw new Error("The code is incomplete. Copy it again, and if it came in several parts, paste every part in order.");
    var bin = atob(m[2]), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var payload = JSON.parse(new TextDecoder("utf-8").decode(bytes));
    var chars = arr(payload && payload.chars).filter(function (c) { return c && typeof c.n === "string"; });
    if (!chars.length) throw new Error("This code has no characters in it.");
    return { t: payload.t, chars: chars };
  }
  function fromExport(e, t) {
    return {
      name: e.n, sn: typeof e.sn === "string" ? e.sn : "", cls: e.cls || "", race: e.race || "", lvl: num(e.lvl) || null, fac: e.fac || "",
      prof: arr(e.prof).filter(Array.isArray), tal: arr(e.tal).filter(Array.isArray), att: arr(e.att).filter(function (a) { return typeof a === "string"; }),
      st: e.st && typeof e.st === "object" && !e.st.off ? e.st : null, exported: t || null
    };
  }

  // ---------- gallery ----------
  var root = document.getElementById("root"), gridEl, countEl;
  // mode: "play" (gallery card that opens the story), "still" (outro, builder preview). urls overrides the art.
  function cardEl(c, mode, urls) {
    var ci = classInfo(c.cls);
    urls = urls || artUrls(c);
    var hit = mode === "play" ? h("button", { class: "card-hit", type: "button", "aria-label": "Play " + fullName(c) + "'s Guild Wrapped" }) : null;
    var car = urls.length ? carousel(urls, { still: mode !== "play", gestureEl: hit, alt: "" }) : null;
    if (hit) hit.addEventListener("click", function () { if (car && car.wasSwipe()) return; openStory(c.id); });
    var clips = arr(c.clips).length;
    return h("div", { class: "card t-" + themeKey(c), style: "--cc:" + ci[1] },
      car ? car.el : null,
      h("span", { class: "tint" }),
      h("span", { class: "shade" }),
      c.sample ? h("span", { class: "pill example", text: "Example" }) : null,
      clips ? h("span", { class: "pill clips", text: "▶ " + plural(clips, "clip", "clips") }) : null,
      h("div", { class: "info" },
        h("div", { class: "name", text: fullName(c) }),
        h("div", { class: "orn" }),
        h("div", { class: "sub" }, h("i", { class: "dot" }), h("span", { class: "lvl", text: c.lvl ? "Lv " + c.lvl : "Lv ?" }), h("span", { text: [c.race, ci[0]].filter(Boolean).join(" ") })),
        mainProfs(c).length ? h("div", { class: "profs" }, mainProfs(c).map(function (p) { return h("span", { text: p[0] }); })) : null),
      hit);
  }
  function renderShell() {
    var eyebrow = h("div", { class: "eyebrow-row" }); eyebrow.innerHTML = PAW; eyebrow.append("Gay Furries of Azeroth");
    countEl = h("span", { class: "count", text: "Loading the guild…" });
    gridEl = h("div", { class: "grid" });
    root.innerHTML = "";
    root.append(h("main", { class: "wrap" },
      h("header", { class: "top" },
        eyebrow,
        h("h1", null, "Guild ", h("span", { class: "w", text: "Wrapped" }), " " + YEAR),
        h("p", { class: "lede", text: "Every guildmate who sent in art of their character gets a card. Tap one to play their year in the guild, then keep going to the next." }),
        h("div", { class: "rule" }),
        h("div", { class: "toolbar" },
          h("button", { class: "btn", type: "button", onclick: function () { var p = playable(); if (p.length) openStory(p[0].id); } }, "▶ Play everyone"),
          h("a", { class: "btn primary", href: "#add" }, "+ Add your character"),
          countEl)),
      gridEl,
      h("footer", { class: "foot-links" },
        h("a", { href: "#builder" }, "Make an entry (for whoever adds characters)"),
        h("a", { href: "https://github.com/SepiHub/GuildWrapped" }, "Source on GitHub"))));
  }
  function renderGallery() {
    var chars = DATA.chars, clips = 0;
    chars.forEach(function (c) { clips += arr(c.clips).length; });
    countEl.textContent = plural(chars.length, "character", "characters") + " · " + plural(clips, "memory", "memories");
    gridEl.innerHTML = "";
    if (!chars.length) {
      gridEl.append(h("div", { class: "empty", style: "grid-column:1/-1" },
        h("b", { text: "No characters yet" }),
        h("span", { text: "Be the first: post your /gf export code and a picture in the guild Discord." })));
    }
    chars.forEach(function (c) { gridEl.append(h("div", { class: "card-wrap" }, cardEl(c, "play"))); });
  }

  // ---------- story ----------
  var S = { open: false, list: [], ci: 0, si: 0, slides: [], elapsed: 0, last: 0, paused: false, raf: 0 };
  var storyEl, frameEl, bgEl, barsEl, avEl, whoName, whoPos, hostEl, prevCharBtn, nextCharBtn, pauseBtn;
  function buildStoryShell() {
    bgEl = h("img", { class: "story-bg", alt: "" });
    barsEl = h("div", { class: "bars", "aria-hidden": "true" });
    avEl = h("img", { class: "av", alt: "" });
    whoName = h("b"); whoPos = h("small");
    pauseBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Pause", onclick: togglePause }, "❚❚");
    hostEl = h("div", { class: "host", "aria-live": "polite" });
    prevCharBtn = h("button", { class: "btn ghost", type: "button", onclick: function () { goChar(S.ci - 1); } });
    nextCharBtn = h("button", { class: "btn", type: "button", onclick: function () { goChar(S.ci + 1); } });
    frameEl = h("div", { class: "frame" },
      barsEl,
      h("div", { class: "story-head" }, avEl, h("div", { class: "who" }, whoName, whoPos), pauseBtn,
        h("button", { class: "icon-btn", type: "button", "aria-label": "Close", onclick: closeStory }, "✕")),
      hostEl,
      h("div", { class: "story-foot" }, prevCharBtn, nextCharBtn));
    storyEl = h("div", { class: "story", role: "dialog", "aria-modal": "true", "aria-label": "Guild Wrapped story", hidden: true }, bgEl, frameEl);
    document.body.append(storyEl);
    document.addEventListener("keydown", function (e) {
      if (!S.open) return;
      if (e.key === "Escape") closeStory();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    });
  }
  function accentFor(i) { return "var(--a" + (i % 6 + 1) + ")"; }
  function youtubeId(v) {
    var m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,})/.exec(String(v || ""));
    return m ? m[1] : (/^[A-Za-z0-9_-]{6,}$/.test(String(v || "")) ? v : null);
  }
  function clipEl(clip) {
    var yt = clip.youtube ? youtubeId(clip.youtube) : null;
    var media = yt
      ? h("iframe", { src: "https://www.youtube-nocookie.com/embed/" + yt, title: clip.title || "Clip", allow: "encrypted-media; picture-in-picture; fullscreen", allowfullscreen: true, loading: "lazy" })
      : h("video", { src: clip.src, controls: true, playsinline: true, preload: "metadata" });
    return h("figure", { class: "clip" }, media,
      h("figcaption", null, h("b", { text: clip.title || "Untitled clip" }), clip.dur ? h("span", { text: clipTime(clip.dur) }) : null));
  }
  function slidesFor(c) {
    var st = stats(c), out = [], urls = artUrls(c);
    function push(kind, kids, opts) { out.push({ kind: kind, kids: kids, opts: opts || {} }); }
    var introCar = urls.length ? carousel(urls, { alt: "Art of " + fullName(c), onMove: function () { S.elapsed = 0; } }) : null;
    push("intro", [
      introCar ? h("div", { class: "intro-car" }, introCar.el) : null,
      h("div", { class: "kicker", text: "Guild Wrapped " + YEAR }),
      h("div", { class: "intro-name", text: fullName(c) }),
      h("div", { class: "line", text: metaLine(c) + (c.fac ? " · " + c.fac : "") }),
      st ? null : h("div", { class: "line", text: "Stats sharing is off for this character, so this Wrapped is short. In game: /gf stats share on, then /gf export." })
    ]);
    if (st && (num(st.kills) || num(st.quests))) push("grind", [
      h("div", { class: "kicker", text: "The grind" }),
      h("div", { class: "big", text: fmt(st.kills) }),
      h("div", { class: "cap", text: "mobs defeated" }),
      num(st.quests) ? h("div", { class: "line" }, "plus ", h("strong", { text: plural(st.quests, "quest", "quests") }), " turned in.") : null
    ]);
    if (st) {
      var world = [["Dungeons", st.dungeons], ["Bosses down", st.bosses], ["Flight paths", st.flights], ["Hearthstones", st.hearths]].filter(function (x) { return num(x[1]) > 0; });
      if (world.length) push("world", [
        h("div", { class: "kicker", text: "Out in Azeroth" }),
        h("div", { class: "quad" }, world.map(function (x) { return h("div", null, h("b", { text: fmt(x[1]) }), h("span", { text: x[0] })); })),
        num(st.explore) ? h("div", { class: "line" }, h("strong", { text: fmt(st.explore) + " XP" }), " just from discovering new places.") : null
      ]);
      if (num(st.epics) || num(st.rares) || st.firstEpic || num(st.gold)) push("loot", [
        h("div", { class: "kicker", text: "Loot" }),
        h("div", { class: "quad" },
          h("div", null, h("b", { text: fmt(st.epics) }), h("span", { text: "epics" })),
          h("div", null, h("b", { text: fmt(st.rares) }), h("span", { text: "rares" })),
          num(st.gold) ? h("div", null, h("b", { text: gold(st.gold) }), h("span", { text: "gold earned" })) : null),
        st.firstEpic ? h("div", { class: "line" }, "First epic: ", h("strong", { text: String(st.firstEpic) }), st.firstEpicAt ? ", on " + day(st.firstEpicAt) + "." : ".") : null
      ]);
    }
    var profs = arr(c.prof).filter(function (p) { return Array.isArray(p) && p[0]; });
    if (profs.length) push("craft", [
      h("div", { class: "kicker", text: "Professions" }),
      h("div", { class: "skills" }, profs.map(function (p) {
        var cur = num(p[1]), max = num(p[2]) || 300;
        return h("div", { class: "skill" },
          h("div", { class: "skill-top" }, h("span", { text: p[0] }), h("span", { text: fmt(cur) + " / " + fmt(max) })),
          h("div", { class: "track" }, h("i", { style: "width:" + Math.max(0, Math.min(100, cur / max * 100)).toFixed(1) + "%" })));
      })),
      st && (num(st.skillUps) || num(st.fish)) ? h("div", { class: "line" },
        num(st.skillUps) ? [h("strong", { text: plural(st.skillUps, "skill-up", "skill-ups") }), num(st.fish) ? " and " : "."] : null,
        num(st.fish) ? [h("strong", { text: plural(st.fish, "fish", "fish") }), " caught."] : null) : null
    ]);
    if (st && (num(st.bestXph) || num(st.longestSession) || num(st.sessions))) push("time", [
      h("div", { class: "kicker", text: "Time well spent" }),
      num(st.bestXph) ? h("div", { class: "big mid", text: fmt(st.bestXph) }) : null,
      num(st.bestXph) ? h("div", { class: "cap", text: "XP per hour, best session" }) : null,
      h("div", { class: "quad" },
        num(st.longestSession) ? h("div", null, h("b", { text: duration(st.longestSession) }), h("span", { text: "longest session" })) : null,
        num(st.sessions) ? h("div", null, h("b", { text: fmt(st.sessions) }), h("span", { text: "play sessions" })) : null),
      st.since ? h("div", { class: "line", text: "Counting since " + day(st.since) + "." }) : null
    ]);
    if (st) {
      var d = num(st.deaths);
      var quip = d === 0 ? "Not once. Suspicious." : d < 10 ? "Barely a scratch." : d < 50 ? "The spirit healer knows your name." : d < 150 ? "Repair bills: legendary." : "At this point it's a lifestyle.";
      push("deaths", [
        h("div", { class: "kicker", text: "Spirit healer visits" }),
        h("div", { class: "big", text: fmt(d) }),
        h("div", { class: "cap", text: d === 1 ? "death" : "deaths" }),
        h("div", { class: "line", text: quip })
      ]);
    }
    if (arr(c.att).length) push("attune", [
      h("div", { class: "kicker", text: "Attuned" }),
      h("div", { class: "cap", text: "Ready for " + plural(c.att.length, "raid", "raids") }),
      h("div", { class: "chips" }, c.att.map(function (a) { return h("span", { text: a }); }))
    ]);
    var clips = arr(c.clips).filter(function (k) { return k && (k.src || k.youtube); }).slice(0, 3);
    if (clips.length) push("memories", [
      h("div", { class: "kicker", text: "Memories" }),
      h("div", { class: "clips-list" }, clips.map(clipEl))
    ], { noTap: true, noAuto: true });
    var next = S.list[S.ci + 1];
    push("outro", [
      h("div", { class: "kicker", text: "That's a wrap" }),
      h("div", { class: "outro-card" }, cardEl(c, "still")),
      h("div", { class: "cap", text: fullName(c) + "'s year in the guild." }),
      next ? h("button", { class: "btn primary", type: "button", onclick: function () { goChar(S.ci + 1); } }, "Up next: " + fullName(next) + " →")
           : h("button", { class: "btn", type: "button", onclick: closeStory }, "Back to everyone")
    ], { noTap: true, noAuto: true });
    return out;
  }
  function openStory(id) {
    S.list = playable();
    var i = S.list.findIndex(function (c) { return c.id === id; });
    if (i < 0) return;
    if (!storyEl) buildStoryShell();
    S.open = true; storyEl.hidden = false; document.body.style.overflow = "hidden";
    goChar(i, true);
    if (location.hash !== "#c-" + id) location.hash = "c-" + id;
  }
  function closeStory() {
    if (!S.open) return;
    S.open = false; storyEl.hidden = true; document.body.style.overflow = "";
    stopMedia(); cancelAnimationFrame(S.raf);
    if (/^#c-/.test(location.hash)) location.hash = "";
  }
  function goChar(i, fresh) {
    if (i < 0) i = 0;
    if (i >= S.list.length) { closeStory(); return; }
    S.ci = i; var c = S.list[i];
    S.slides = slidesFor(c); S.si = 0;
    var url = artUrl(c);
    bgEl.src = url; avEl.src = url;
    frameEl.className = "frame t-" + themeKey(c);
    whoName.textContent = fullName(c);
    var prev = S.list[i - 1], next = S.list[i + 1];
    prevCharBtn.hidden = !prev; nextCharBtn.hidden = !next;
    prevCharBtn.innerHTML = ""; nextCharBtn.innerHTML = "";
    if (prev) prevCharBtn.append("← ", h("span", { text: prev.name }));
    if (next) nextCharBtn.append(h("span", { text: next.name }), " →");
    barsEl.innerHTML = "";
    S.slides.forEach(function () { barsEl.append(h("div", { class: "bar" }, h("i"))); });
    if (!fresh) location.hash = "c-" + c.id;
    showSlide();
  }
  function stopMedia() {
    if (!hostEl) return;
    hostEl.querySelectorAll("video").forEach(function (v) { try { v.pause(); } catch (e) {} });
    hostEl.querySelectorAll("iframe").forEach(function (f) { f.remove(); });
  }
  function showSlide() {
    stopMedia();
    var sl = S.slides[S.si];
    hostEl.innerHTML = "";
    hostEl.className = "host" + (sl.opts.noTap ? " no-tap" : "");
    hostEl.append(
      h("section", { class: "slide s-" + sl.kind, style: "--acc:" + accentFor(S.ci + S.si) }, sl.kids),
      h("button", { class: "tap prev", type: "button", "aria-label": "Previous slide", onclick: function () { step(-1); } }),
      h("button", { class: "tap next", type: "button", "aria-label": "Next slide", onclick: function () { step(1); } }));
    hostEl.scrollTop = 0;
    whoPos.textContent = (S.ci + 1) + " of " + S.list.length + " · slide " + (S.si + 1) + " of " + S.slides.length;
    var bars = barsEl.children;
    for (var i = 0; i < bars.length; i++) bars[i].firstChild.style.width = i < S.si ? "100%" : "0%";
    S.elapsed = 0; S.last = performance.now();
    cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(tick);
    pauseBtn.hidden = !!sl.opts.noAuto;
  }
  function tick(now) {
    if (!S.open) return;
    var sl = S.slides[S.si];
    if (!S.paused && !sl.opts.noAuto && !document.hidden) S.elapsed += now - S.last;
    S.last = now;
    var bar = barsEl.children[S.si];
    if (bar) bar.firstChild.style.width = sl.opts.noAuto ? "100%" : Math.min(100, S.elapsed / SLIDE_MS * 100) + "%";
    if (!sl.opts.noAuto && S.elapsed >= SLIDE_MS) { step(1); return; }
    S.raf = requestAnimationFrame(tick);
  }
  function step(d) {
    var n = S.si + d;
    if (n < 0) { if (S.ci > 0) goChar(S.ci - 1); else { S.si = 0; showSlide(); } return; }
    if (n >= S.slides.length) { goChar(S.ci + 1); return; }
    S.si = n; showSlide();
  }
  function togglePause() {
    S.paused = !S.paused;
    pauseBtn.textContent = S.paused ? "▶" : "❚❚";
    pauseBtn.setAttribute("aria-label", S.paused ? "Play" : "Pause");
  }

  // ---------- modals: how to add a character, and the entry builder ----------
  var modalEl = null;
  function openModal(label, content) {
    closeModal(true);
    modalEl = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": label, onclick: function (e) { if (e.target === modalEl) closeModal(); } }, content);
    modalEl.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    document.body.append(modalEl);
    var f = modalEl.querySelector("textarea, button, a"); if (f) f.focus();
  }
  function closeModal(silent) {
    if (modalEl) { modalEl.remove(); modalEl = null; }
    if (!silent && (location.hash === "#add" || location.hash === "#builder")) location.hash = "";
  }
  function closeBtn() { return h("button", { class: "btn ghost", type: "button", onclick: function () { closeModal(); } }, "Close"); }

  function openAddGuide() {
    openModal("Add your character", h("div", { class: "sheet" },
      h("h2", { text: "Add your character" }),
      h("ol", { class: "steps" },
        h("li", null, "In game, type ", h("code", { text: "/gf stats share on" }), " so your Wrapped gets your stats (optional, but it's most of the fun)."),
        h("li", null, "Type ", h("code", { text: "/gf export" }), ", press Ctrl+A then Ctrl+C."),
        h("li", null, "In the guild Discord, post the code with ", h("strong", { text: "at least one picture" }), " of your character: a screenshot, a drawing, anything."),
        h("li", null, "Optional: up to 6 pictures in total, a card theme, and up to 3 clips of 2 minutes or less (a YouTube link works great).")),
      h("div", { class: "field" }, h("div", { class: "lbl", text: "Themes to pick from" }),
        h("div", { class: "themes" }, THEMES.map(function (t) {
          return h("div", { class: "theme-opt t-" + t[0] }, h("span", { class: "sw" }), h("b", { text: t[1] }), h("span", { text: t[2] }));
        }))),
      h("p", { class: "hint", text: "Your card shows up here once it's been added to the site." }),
      h("div", { class: "actions" }, closeBtn())));
  }

  // Entry builder: paste an export code, pick pictures and a theme, copy the JSON for data/characters.json.
  function openBuilder() {
    var B = { decoded: null, pick: 0, theme: "guild", files: [], clips: "" };
    var status = h("div", { class: "status", "aria-live": "polite" });
    var pickWrap = h("div");
    var code = h("textarea", { id: "b-code", spellcheck: "false", placeholder: "GFOA1.…", oninput: function () {
      pickWrap.innerHTML = ""; B.decoded = null; B.pick = 0;
      var r;
      try { r = parseExport(code.value); } catch (e) { status.className = "status err"; status.textContent = e.message; refresh(); return; }
      if (!r) { status.className = "status"; status.textContent = ""; refresh(); return; }
      B.decoded = r;
      var c0 = r.chars[0];
      status.className = "status ok";
      status.textContent = r.chars.length === 1
        ? "Found " + c0.n + ", level " + (c0.lvl || "?") + " " + classInfo(c0.cls)[0] + (c0.st && !c0.st.off ? ", with stats." : ". Stats sharing is off, so their Wrapped will be short.")
        : "Found " + r.chars.length + " characters. Pick one:";
      if (r.chars.length > 1) {
        var sel = h("select", { id: "b-char", "aria-label": "Character", onchange: function () { B.pick = Number(sel.value); refresh(); } },
          r.chars.map(function (x, i) { return h("option", { value: String(i), text: x.n + (x.sn ? " " + x.sn : "") + " · level " + (x.lvl || "?") + " " + classInfo(x.cls)[0] }); }));
        pickWrap.append(sel);
      }
      refresh();
    } });
    var fileInput = h("input", { type: "file", id: "b-art", multiple: true, accept: "image/png,image/jpeg,image/webp,image/gif", onchange: function () {
      B.files = [].slice.call(fileInput.files || []).slice(0, MAX_ARTS).map(function (f) { return { name: f.name, url: URL.createObjectURL(f) }; });
      refresh();
    } });
    var clipsInput = h("textarea", { id: "b-clips", placeholder: "One per line: title | YouTube link or clips/file.mp4", oninput: function () { B.clips = clipsInput.value; refresh(); } });
    var prevBox = h("div", { class: "look-prev", "aria-hidden": "true" });
    var themesBox = h("div", { class: "themes", role: "group", "aria-label": "Card theme" }, THEMES.map(function (t) {
      return h("button", { class: "theme-opt t-" + t[0], type: "button", "data-k": t[0], "aria-pressed": t[0] === B.theme ? "true" : "false", onclick: function () {
        B.theme = t[0];
        [].forEach.call(themesBox.children, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-k") === B.theme ? "true" : "false"); });
        refresh();
      } }, h("span", { class: "sw" }), h("b", { text: t[1] }), h("span", { text: t[2] }));
    }));
    var out = h("textarea", { id: "b-out", readonly: true, class: "out", "aria-label": "Entry for data/characters.json" });
    var copyBtn = h("button", { class: "btn primary", type: "button", onclick: function () {
      if (!out.value) { toast("Paste an export code first.", true); return; }
      var done = function () { toast("Copied. Paste it into data/characters.json."); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, function () { out.select(); toast("Press Ctrl+C to copy."); });
      else { out.select(); toast("Press Ctrl+C to copy."); }
    } }, "Copy entry");
    var fileList = h("div", { class: "hint" });

    function entry() {
      if (!B.decoded) return null;
      var e = B.decoded.chars[B.pick] || B.decoded.chars[0];
      var base = fromExport(e, B.decoded.t), sl = slug(base.name + (base.sn ? "-" + base.sn : ""));
      var arts = B.files.map(function (f, i) { return { src: "art/" + sl + "-" + (i + 1) + (f.name.match(/\.[a-z0-9]+$/i) || [".jpg"])[0].toLowerCase() }; });
      var clips = B.clips.split("\n").map(function (line) {
        var parts = line.split("|"), title = parts.length > 1 ? parts[0].trim() : "", ref = (parts.length > 1 ? parts.slice(1).join("|") : parts[0]).trim();
        if (!ref) return null;
        return youtubeId(ref) && !/\.(mp4|webm)$/i.test(ref) ? { title: title, youtube: ref } : { title: title, src: ref };
      }).filter(Boolean).slice(0, 3);
      return Object.assign({ id: "c-" + sl, theme: B.theme, arts: arts, clips: clips, added: Math.floor(Date.now() / 1000) }, base);
    }
    function refresh() {
      var e = entry();
      out.value = e ? JSON.stringify(e, null, 2) : "";
      var c = e || { name: "New character", theme: B.theme };
      c = Object.assign({}, c, { theme: B.theme });
      prevBox.innerHTML = "";
      prevBox.append(cardEl(c, "still", B.files.map(function (f) { return f.url; })));
      fileList.textContent = e && e.arts.length
        ? "Save the pictures in the art folder as: " + e.arts.map(function (a) { return a.src.replace("art/", ""); }).join(", ")
        : "Pick at least one picture. The site needs one to show the card.";
    }

    openModal("Make an entry", h("div", { class: "sheet" },
      h("h2", { text: "Make an entry" }),
      h("p", { class: "hint", text: "For whoever adds characters to the site. Nothing here is uploaded: this builds the text to add to data/characters.json, and tells you what to name the pictures." }),
      h("div", { class: "field" }, h("label", { class: "lbl", for: "b-code", text: "Export code (required)" }), code, status, pickWrap),
      h("div", { class: "field" }, h("label", { class: "lbl", for: "b-art", text: "Pictures (at least 1, up to " + MAX_ARTS + "; the first is the cover)" }), fileInput, fileList),
      h("div", { class: "field" }, h("div", { class: "lbl", text: "Card theme" }), h("div", { class: "look" }, prevBox, themesBox)),
      h("div", { class: "field" }, h("label", { class: "lbl", for: "b-clips", text: "Clips (optional, up to 3)" }),
        h("div", { class: "hint", text: "YouTube links play right in the Wrapped. Video files go in the clips folder (MP4 or WebM, 2 minutes at most)." }), clipsInput),
      h("div", { class: "field" }, h("label", { class: "lbl", for: "b-out", text: "Entry" }),
        h("div", { class: "hint", text: "Add it to the chars list in data/characters.json (with a comma between entries), add the pictures to art/, and push. The site updates within a couple of minutes." }), out),
      h("div", { class: "actions" }, closeBtn(), copyBtn)));
    refresh();
  }

  // ---------- routing ----------
  function routeHash() {
    var hsh = location.hash || "";
    var m = /^#c-([A-Za-z0-9-]+)$/.exec(hsh);
    if (hsh === "#add") { if (S.open) closeStory(); openAddGuide(); return; }
    if (hsh === "#builder") { if (S.open) closeStory(); openBuilder(); return; }
    if (modalEl) closeModal(true);
    if (m) { if (!S.open || (S.list[S.ci] && S.list[S.ci].id !== m[1])) openStory(m[1]); }
    else if (S.open) closeStory();
  }
  window.addEventListener("hashchange", routeHash);

  // ---------- start ----------
  renderShell();
  fetch("data/characters.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { DATA = d && Array.isArray(d.chars) ? d : { v: 1, chars: [] }; renderGallery(); routeHash(); })
    .catch(function () {
      countEl.textContent = "The character list couldn't load. Refresh the page to try again.";
      routeHash();
    });
})();
