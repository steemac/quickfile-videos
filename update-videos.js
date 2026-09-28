#!/usr/bin/env node
/*
  QuickFile Videos - updater
  --------------------------
  Refreshes videos.js and videos.json from the QuickFile Help Guides YouTube channel.
  Only links, titles and details are stored. The videos themselves stay on YouTube.

  Needs Node.js 18 or newer. There are no packages to install.

  Two modes:
    1. With a YouTube Data API key (recommended). Loads EVERY public video on the
       channel, with duration and view count. Removed videos drop off the site.
         Set the key in the YOUTUBE_API_KEY environment variable, or put it in a file
         called youtube-api-key.txt next to this script.
    2. Without a key. Reads the channel's public RSS feed, which only lists the latest
       15 uploads. New videos are ADDED to the list you already have and nothing is
       removed. This is fine for day-to-day updates once the full list is loaded.

  Usage:  node update-videos.js
*/
const fs = require("fs");
const path = require("path");

const CHANNEL_ID = "UCsztsJV-92UraKrJ90cBTOg"; // QuickFile Help Guides
const CHANNEL_URL = "https://www.youtube.com/@QuickFileHelpGuides";
const EXCLUDE_SHORTS = false; // true = leave out videos of 60 seconds or less

const DIR = __dirname;
const OUT_JS = path.join(DIR, "videos.js");
const OUT_JSON = path.join(DIR, "videos.json");

function apiKey() {
  if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY.trim();
  const f = path.join(DIR, "youtube-api-key.txt");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8").trim();
  return "";
}

function readExisting() {
  try {
    const txt = fs.readFileSync(OUT_JSON, "utf8");
    return JSON.parse(txt);
  } catch (_) {}
  try {
    const txt = fs.readFileSync(OUT_JS, "utf8");
    const start = txt.indexOf("{");
    const end = txt.lastIndexOf("}");
    return JSON.parse(txt.slice(start, end + 1));
  } catch (_) {}
  return null;
}

// ISO 8601 duration (PT1H2M3S) to seconds
function isoToSeconds(iso) {
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return null;
  return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0);
}

async function getJson(url) {
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} from YouTube: ${body.slice(0, 300)}`);
  return JSON.parse(body);
}

async function fromApi(key) {
  const base = "https://www.googleapis.com/youtube/v3";
  const ch = await getJson(`${base}/channels?part=snippet,contentDetails,statistics&id=${CHANNEL_ID}&key=${key}`);
  if (!ch.items || !ch.items.length) throw new Error("Channel not found. Check CHANNEL_ID.");
  const channel = ch.items[0];
  const uploads = channel.contentDetails.relatedPlaylists.uploads;

  const ids = [];
  let page = "";
  do {
    const pl = await getJson(`${base}/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}&key=${key}${page ? "&pageToken=" + page : ""}`);
    for (const it of pl.items || []) ids.push(it.contentDetails.videoId);
    page = pl.nextPageToken || "";
  } while (page);

  const videos = [];
  const skipped = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50).join(",");
    const v = await getJson(`${base}/videos?part=snippet,contentDetails,statistics,status&id=${chunk}&key=${key}`);
    for (const it of v.items || []) {
      if (it.status && it.status.privacyStatus !== "public") { skipped.push([it, it.status.privacyStatus]); continue; }
      if (it.snippet.liveBroadcastContent && it.snippet.liveBroadcastContent !== "none") { skipped.push([it, "live or scheduled premiere"]); continue; }
      const t = it.snippet.thumbnails || {};
      videos.push({
        id: it.id,
        title: it.snippet.title,
        description: it.snippet.description || "",
        published: it.snippet.publishedAt,
        duration: isoToSeconds(it.contentDetails.duration),
        views: it.statistics && it.statistics.viewCount != null ? Number(it.statistics.viewCount) : null,
        thumbnail: (t.medium || t.high || t.default || {}).url || null,
        tags: it.snippet.tags || []
      });
    }
  }
  const found = new Set(videos.map(v => v.id).concat(skipped.map(([it]) => it.id)));
  const missing = ids.filter(id => !found.has(id));
  console.log(`Channel reports ${channel.statistics.videoCount} videos. Uploads list has ${ids.length}. Adding ${videos.length} to the site.`);
  for (const [it, why] of skipped) console.log(`  Skipped (${why}): ${it.snippet.title}  https://youtu.be/${it.id}`);
  for (const id of missing) console.log(`  Skipped (YouTube returned no details, possibly deleted or blocked): https://youtu.be/${id}`);
  return {
    source: "api",
    channel: {
      id: CHANNEL_ID,
      title: channel.snippet.title,
      url: CHANNEL_URL,
      subscribers: channel.statistics.hiddenSubscriberCount ? null : Number(channel.statistics.subscriberCount)
    },
    videos
  };
}

function decode(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}
function tag(xml, name) {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(xml);
  return m ? decode(m[1]).trim() : "";
}
function attr(xml, name, a) {
  const m = new RegExp(`<${name}[^>]*\\s${a}="([^"]*)"`).exec(xml);
  return m ? decode(m[1]) : "";
}

function parseRss(xml) {
  const entries = xml.split("<entry>").slice(1).map(e => e.split("</entry>")[0]);
  return entries.map(e => {
    const views = attr(e, "media:statistics", "views");
    return {
      id: tag(e, "yt:videoId"),
      title: tag(e, "title"),
      description: tag(e, "media:description"),
      published: tag(e, "published"),
      duration: null,
      views: views ? Number(views) : null,
      thumbnail: attr(e, "media:thumbnail", "url") || null,
      tags: []
    };
  }).filter(v => v.id);
}

async function fromRss() {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching the channel RSS feed`);
  const xml = await res.text();
  return {
    source: "rss",
    channel: { id: CHANNEL_ID, title: tag(xml.split("<entry>")[0], "title") || "QuickFile Help Guides", url: CHANNEL_URL },
    videos: parseRss(xml)
  };
}

function merge(existing, fresh) {
  // API data is the full list, so it replaces what we had.
  if (fresh.source === "api" || !existing || existing.sample) return fresh.videos;
  const byId = new Map(existing.videos.map(v => [v.id, v]));
  for (const v of fresh.videos) {
    const old = byId.get(v.id) || {};
    byId.set(v.id, {
      ...old,
      ...v,
      duration: v.duration != null ? v.duration : old.duration != null ? old.duration : null,
      views: v.views != null ? v.views : old.views != null ? old.views : null,
      tags: v.tags && v.tags.length ? v.tags : old.tags || []
    });
  }
  return [...byId.values()];
}

async function main() {
  const key = apiKey();
  const existing = readExisting();
  let fresh;
  if (key) {
    console.log("Loading every video with the YouTube Data API...");
    fresh = await fromApi(key);
  } else {
    console.log("No API key found, so reading the latest 15 videos from the RSS feed...");
    fresh = await fromRss();
  }

  let videos = merge(existing, fresh);
  if (EXCLUDE_SHORTS) videos = videos.filter(v => v.duration == null || v.duration > 60);
  videos.sort((a, b) => String(b.published).localeCompare(String(a.published)));

  const data = {
    generated: new Date().toISOString(),
    source: fresh.source,
    channel: { ...(existing && !existing.sample ? existing.channel : {}), ...fresh.channel },
    count: videos.length,
    videos
  };

  const before = existing && !existing.sample ? existing.videos.length : 0;
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(OUT_JSON, json + "\n");
  fs.writeFileSync(OUT_JS, "/* Created by update-videos.js. Do not edit by hand. */\nwindow.QF_VIDEOS = " + json + ";\n");
  console.log(`Done. ${videos.length} videos saved (${videos.length - before >= 0 ? "+" : ""}${videos.length - before} since last run).`);
}

if (require.main === module) {
  main().catch(err => {
    console.error("Update failed: " + err.message);
    process.exit(1);
  });
}
module.exports = { parseRss, isoToSeconds, merge };
