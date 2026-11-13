# Infinite Scroll Photo Gallery
**Engineered by Kumar Kshitij**

A single-page ReactJS Infinite Scroll Photo Gallery consuming the paginated Picsum Photos API (`https://picsum.photos/v2/list?page=1`, `page=2`, etc.).

---

## Core Requirements Implemented

1. **Paginated Infinite Scroll (`IntersectionObserver` + Scroll Fallback):**
   - Automatically fetches `https://picsum.photos/v2/list?page=1`, `page=2`, `page=3`, etc., as the user scrolls to the bottom of the page, appending unique articles until reaching a page with no more data.
2. **1-Column Default View & Assignment Reference Mode (`photo-gallery.jpg`):**
   - Renders each item using `download_url` and `author` (`Author: <Name>`) in a 1-column layout, with one-click switching between the **1-Column Feed**, **Classic 1-Column Reference View**, and **Explore Grid**.
3. **FontAwesome Thumbs-Up Icon & Multi-Click Counter:**
   - Next to each photo and author name, renders a FontAwesome thumbs-up icon (`<i className="fa-solid fa-thumbs-up" />`) with a counter initialized to `0` that increments on every single click (`+1` per click, or double-click on the photo).
4. **Proxy & Fast-CDN Resilience:**
   - Includes `"proxy": "https://picsum.photos"` in `package.json` and Vite `/v2` proxy configuration in `vite.config.js`, paired with instant CDN resolution and vector fallbacks so photos render in `<100ms` without network stalls.

---

## Extra Features Included

- **3-Column Studio Shell:** Left navigation rail (`1-Column Feed`, `Assignment Reference View`, `Explore Grid`, `Liked Photos`, `Saved Collection`), center 1-column paginated stream, and right-side live pagination telemetry & **Top Photographers Leaderboard**.
- **Photographer Highlights Filter Bar:** Filter the paginated stream by any photographer (`author`) with one click.
- **Split-Screen HD Lightbox Inspector:** Click any photo to inspect full resolution, camera/lens EXIF metadata, instant hardware-accelerated filter previews (`Original`, `B&W`, `Depth Blur`), zoom controls (`1x` / `1.4x` / `1.85x`), keyboard arrow navigation, studio notes/comments, and one-click HD download.
- **Persistent Likes, Bookmarks & Comments (`localStorage`):** All thumbs-up counts, saved photos, and comments persist across page reloads.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
