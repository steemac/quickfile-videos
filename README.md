# QuickFile Video Guides site

This is a static support site that lists every video on the QuickFile Help Guides YouTube channel, sorted into topics and searchable. The site only stores titles and links. **Every video plays from YouTube**, so every play counts towards your YouTube views.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. The settings are at the top of the `<script>` block. |
| `topics.js` | Topics and their keywords. Edit this to change how videos are grouped. |
| `videos.js` / `videos.json` | The video list. `update-videos.js` creates these, so don't edit them by hand. |
| `update-videos.js` | Fetches the latest videos from YouTube. Needs Node.js 18 or newer. |
| `update-videos.bat` | Double-click this on Windows to run the updater. |
| `.github/workflows/update-videos.yml` | Runs the updater every day on GitHub. |

The site works if you open `index.html` straight from disk, and it works on any web host. It has no build step and no packages to install.

## 1. Load the real videos (first time)

The site comes with **sample videos** so you can see the layout. To replace them:

1. Get a free YouTube Data API key. In [Google Cloud Console](https://console.cloud.google.com/), create a project, enable **YouTube Data API v3**, then go to Credentials and choose **Create API key**. Restrict the key to the YouTube Data API.
2. Save the key in a file called `youtube-api-key.txt` next to `update-videos.js`. Git ignores this file.
3. Run `update-videos.bat`, or run `node update-videos.js`.

With a key, the updater loads **every** public video on the channel, including duration and view counts. Videos you delete or make private drop off the site.

**Without a key**, the updater reads the channel's RSS feed. That feed only lists the latest 15 uploads, so new videos are added and nothing is removed. This works for daily updates after the full list has been loaded once. Duration only appears for videos loaded with a key.

## 2. Keep it up to date automatically

### Option A: GitHub Pages and Actions (free)
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages** and choose *Deploy from a branch*, then `main` / root.
3. Go to **Settings > Secrets and variables > Actions** and add a secret named `YOUTUBE_API_KEY`.
4. The workflow runs every day at 05:15 UTC and commits any new videos. Pages then republishes the site. To run it straight away, open the **Actions** tab and choose *Run workflow*.

### Option B: Your own web server
Run the updater on a schedule in the folder the site is served from, or run it anywhere and upload the new `videos.js` and `videos.json`.
- **Windows Task Scheduler:** create a basic task that runs daily. For *Program* choose `update-videos.bat` and add the argument `auto`, which stops the window waiting for a key press.
- **Linux cron:** `15 5 * * * cd /var/www/videos && /usr/bin/node update-videos.js`

## 3. Change how videos are grouped

Open `topics.js`. Each video goes into the topic whose keywords match best. A match in the title counts 3 times as much as a match in the description.
- Add keywords to a topic, or add a new topic. The order sets the order of the sections on the page.
- `overrides` puts a particular video into a particular topic: `"VIDEO_ID": "vat-mtd"`.
- `hidden` removes a video from the site.

Refresh the page to see your changes. You don't need to run the updater again.

## 4. Settings in index.html

At the top of the script:
- `playMode`: `"embed"` plays videos in a pop-up using YouTube's own player, and these plays count as YouTube views. `"youtube"` opens each video on youtube.com instead.
- `newDays`: how long a video shows the NEW badge.
- `perSection`: how many videos each topic shows on the home page before *See all*.
- `nav`, `signUp`, `logIn`: header links. Check that these point at the right QuickFile URLs.

## Links you can share

- A topic: `index.html#topic=bank-feeds`
- A single video (opens the player): `index.html#v=VIDEO_ID`
- Press `/` on the page to jump to the search box.
