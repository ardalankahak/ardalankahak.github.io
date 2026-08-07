# Your Portfolio Site

A free, self-editable portfolio site — no backend, no hosting cost, works on GitHub Pages.

## How it works

All your content lives in plain JSON files inside the `data/` folder. The page
(`index.html`) reads those files with JavaScript and builds the site automatically.
**You never need to touch HTML or CSS to update your content** — just edit the JSON.

| File | Controls |
|---|---|
| `data/profile.json` | Your name, title, bio, resume link, experience, education, skills, contact links |
| `data/projects.json` | Project cards (click-to-expand with description, tags, images/video, links) |
| `data/papers.json` | Publications (abstract + full text, click-to-expand, optional PDF download) |
| `data/books.json` | Reading list (status, notes, rating, cover image) |

## Editing content (no code needed)

1. Go to your GitHub repo in the browser.
2. Open the file you want to change (e.g. `data/projects.json`).
3. Click the pencil icon ("Edit this file").
4. Copy an existing entry (the `{ ... }` block), paste it, and change the values.
   Keep the commas and quotes — it's just a list of `{ }` entries inside `[ ]`.
5. Commit the change. Your live site updates within a minute or two.

To add a new project/paper/book, just duplicate one of the existing entries in the
JSON array and edit the text. There's no limit to how many you add.

## Adding images and videos

1. Put image files in `assets/images/` and video files in `assets/videos/`
   (drag-and-drop upload works directly on GitHub's web UI, or use git).
2. Reference them in the JSON by path, e.g.:
   ```json
   "images": ["assets/images/my-photo.png"],
   "video": "assets/videos/demo.mp4"
   ```
3. Keep videos short/compressed (under ~20MB) since GitHub Pages has a soft
   repo size limit — for longer videos, upload to YouTube/Vimeo and link out instead
   (add it under `"links"` rather than `"video"`).

## Adding your resume PDF

Put your resume PDF at `assets/resume.pdf` (create the file with that exact name),
and it will automatically power the "Download Resume" button. You can change the
path in `data/profile.json` under `"resumeFile"` if you name it differently.

## Adding full paper text

In `data/papers.json`, put the complete text in the `"fullText"` field as a single
string. Use `\n\n` to create paragraph breaks. If you'd rather link a PDF instead
of pasting all the text, put the file at `assets/papers/yourpaper.pdf` and set
`"pdfFile": "assets/papers/yourpaper.pdf"`.

## Deploying on GitHub Pages (free, no domain cost)

1. Push this whole folder to your GitHub repo (e.g. `yourusername.github.io`,
   or any repo name — GitHub Pages supports both).
2. In the repo: **Settings → Pages → Source** → choose the branch (usually `main`)
   and root folder → Save.
3. Your site will be live at `https://yourusername.github.io/` (or
   `https://yourusername.github.io/repo-name/` for a project repo) within a
   minute or two.
4. Every time you edit a JSON file or push new files, the live site updates
   automatically — no rebuild step needed.

## Local preview before pushing

Since the site loads JSON with `fetch()`, opening `index.html` directly in a
browser (via `file://`) will block those requests. To preview locally, run a
tiny local server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Customizing design

- Colors, fonts, and spacing are all defined as CSS variables at the top of
  `css/style.css` (under `:root`) — change a value there and it updates
  everywhere.
- The layout uses a "catalog record" pattern (rows that expand on click) for
  Projects, Papers, and Books — this is in `js/script.js` under `makeRecord()`
  if you want to change how it behaves.
