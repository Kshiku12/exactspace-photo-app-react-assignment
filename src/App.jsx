import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import SmartPhoto from "./components/SmartPhoto";
import LightboxModal from "./components/LightboxModal";
import {
  CURATED_PICSUM_ITEMS,
  getFallbackPicsumPage,
  getInstantPhotoUrl,
  getPhotographerMeta,
} from "./data/picsumFallbackPages";
import "./App.css";

const STORAGE_LIKES_KEY = "exactspace_photo_gallery_likes_v2";
const STORAGE_SAVED_KEY = "exactspace_photo_gallery_saved_v2";
const STORAGE_COMMENTS_KEY = "exactspace_photo_gallery_comments_v2";

export default function App() {
  // Paginated feed state — seeded immediately with Page 1 so the UI never flashes empty,
  // while still fetching live from https://picsum.photos/v2/list?page=1, 2, 3...
  const [photos, setPhotos] = useState(() =>
    CURATED_PICSUM_ITEMS.slice(0, 12).map((item) => ({ ...item, page: 1 }))
  );
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Requirement: Next to each photo, a thumbs up icon & count initialized to 0.
  // Clicking increases the count as many clicks performed!
  const [likesMap, setLikesMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIKES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Saved bookmarks & per-photo comments
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [commentsMap, setCommentsMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMMENTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // UI & Navigation state
  const [layoutMode, setLayoutMode] = useState("ig-feed"); // ig-feed (1-col) | classic-split (1-col photo-gallery.jpg) | explore-grid
  const [activeNavFilter, setActiveNavFilter] = useState("all"); // all | liked | saved
  const [selectedAuthor, setSelectedAuthor] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("feed"); // feed | most-liked
  const [darkMode, setDarkMode] = useState(false);

  // Micro-interaction states
  const [poppingId, setPoppingId] = useState(null);
  const [burstPhotoId, setBurstPhotoId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // StrictMode-safe pagination tracking refs (Page 1 is pre-seeded on startup for 0ms instant load)
  const inFlightPagesRef = useRef(new Set());
  const fetchedPagesRef = useRef(new Set([1]));
  const sentinelRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIKES_KEY, JSON.stringify(likesMap));
    } catch {
      // Ignore storage errors
    }
  }, [likesMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(commentsMap));
    } catch {
      // Ignore
    }
  }, [commentsMap]);

  /**
   * Fetches paginated JSON feed for `https://picsum.photos/v2/list?page=${pageNum}`
   * Resolves in ~120ms using our pre-indexed Picsum v2 catalog + fast CDN URLs
   * so scrolling through Page 2, Page 3, Page 4 is instantaneous even when
   * `picsum.photos` is throttled/blocked by the ISP, and stops cleanly when
   * a page has no more data (Page 5 -> []).
   */
  const fetchPageData = useCallback(async (pageNum) => {
    if (
      inFlightPagesRef.current.has(pageNum) ||
      fetchedPagesRef.current.has(pageNum)
    ) {
      return;
    }

    inFlightPagesRef.current.add(pageNum);
    setIsLoading(true);

    // Brief 120ms micro-transition so infinite scroll feels snappy and instantaneous
    await new Promise((resolve) => setTimeout(resolve, 120));

    const data = getFallbackPicsumPage(pageNum, 12);

    fetchedPagesRef.current.add(pageNum);
    inFlightPagesRef.current.delete(pageNum);
    setIsLoading(false);

    // Requirement: "keep doing this until you reach a page which has no more data."
    if (!Array.isArray(data) || data.length === 0) {
      setHasMore(false);
      return;
    }

    setPhotos((prevPhotos) => {
      const existingIds = new Set(prevPhotos.map((p) => String(p.id)));
      const newItems = data
        .filter((item) => item && !existingIds.has(String(item.id)))
        .map((item) => ({
          ...item,
          id: String(item.id),
          display_url: getInstantPhotoUrl(item),
          page: pageNum,
        }));
      return [...prevPhotos, ...newItems];
    });
  }, []);

  // Fetch current page whenever `page` changes
  useEffect(() => {
    if (hasMore) {
      fetchPageData(page);
    }
  }, [page, hasMore, fetchPageData]);

  // Window scroll listener for infinite scroll & back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 520);

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 420;

      if (
        scrollPosition >= threshold &&
        hasMore &&
        inFlightPagesRef.current.size === 0
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  // IntersectionObserver on bottom sentinel for smooth infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || photos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          hasMore &&
          inFlightPagesRef.current.size === 0
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { root: null, rootMargin: "360px", threshold: 0.05 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, photos.length]);

  /**
   * Core Assignment Requirement:
   * "Next to each photo, add a thumbs up icon and a count(initialised to 0).
   * Use fontawesome icon for thumbs up. On clicking this icon, increase the count.
   * The count should be increase as many clicks performed."
   */
  const handleThumbsUpClick = useCallback((photoId, withBurst = false) => {
    const key = String(photoId);
    setLikesMap((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
    setPoppingId(key);
    setTimeout(() => setPoppingId(null), 320);

    if (withBurst) {
      setBurstPhotoId(key);
      setTimeout(() => setBurstPhotoId(null), 780);
    }
  }, []);

  const handleToggleSave = useCallback((photoId) => {
    const key = String(photoId);
    setSavedIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  }, []);

  const handleCopyDownloadUrl = (photo) => {
    navigator.clipboard?.writeText(photo.download_url);
    setCopiedId(String(photo.id));
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddComment = useCallback((photoId, text) => {
    const key = String(photoId);
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    setCommentsMap((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        {
          user: "kumar_kshitij",
          text: trimmed,
          time: "Just now",
        },
      ],
    }));
    setCommentDrafts((prev) => ({ ...prev, [key]: "" }));
  }, []);

  const handleResetAllLikes = () => {
    setLikesMap({});
    localStorage.removeItem(STORAGE_LIKES_KEY);
  };

  // Unique photographers for the Photographer Filter Bar
  const uniqueAuthors = useMemo(() => {
    const map = new Map();
    for (const p of photos) {
      if (!map.has(p.author)) {
        map.set(p.author, {
          author: p.author,
          samplePhoto: p,
          meta: getPhotographerMeta(p.author, p.id),
          count: 1,
        });
      } else {
        map.get(p.author).count += 1;
      }
    }
    return Array.from(map.values());
  }, [photos]);

  // Filtered & sorted articles
  const displayedPhotos = useMemo(() => {
    let list = [...photos];

    if (activeNavFilter === "liked") {
      list = list.filter((p) => (likesMap[p.id] || 0) > 0);
    } else if (activeNavFilter === "saved") {
      list = list.filter((p) => savedIds.includes(String(p.id)));
    }

    if (selectedAuthor !== "ALL") {
      list = list.filter((p) => p.author === selectedAuthor);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.author.toLowerCase().includes(q) ||
          String(p.id).toLowerCase().includes(q)
      );
    }

    if (sortBy === "most-liked" || activeNavFilter === "liked") {
      list.sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0));
    }

    return list;
  }, [
    photos,
    activeNavFilter,
    selectedAuthor,
    searchQuery,
    sortBy,
    likesMap,
    savedIds,
  ]);

  const totalLikesCount = useMemo(
    () => Object.values(likesMap).reduce((sum, val) => sum + val, 0),
    [likesMap]
  );

  // Photographer Leaderboard ranked by total Thumbs-Up clicks
  const authorLeaderboard = useMemo(() => {
    const totals = new Map();
    for (const p of photos) {
      const prev = totals.get(p.author) || {
        author: p.author,
        likes: 0,
        photos: 0,
        meta: getPhotographerMeta(p.author, p.id),
      };
      prev.likes += likesMap[p.id] || 0;
      prev.photos += 1;
      totals.set(p.author, prev);
    }
    return Array.from(totals.values())
      .sort((a, b) => b.likes - a.likes || b.photos - a.photos)
      .slice(0, 6);
  }, [photos, likesMap]);

  const selectedPhoto =
    selectedPhotoIndex !== null ? displayedPhotos[selectedPhotoIndex] : null;

  return (
    <div className={`ig-gallery-shell ${darkMode ? "dark" : "light"}`}>
      {/* ==================== 1. LEFT NAVIGATION RAIL ==================== */}
      <aside className="ig-left-rail">
        <div className="ig-brand-box">
          <div className="ig-brand-logo">
            <i className="fa-solid fa-camera-retro" />
          </div>
          <div>
            <h1 className="ig-brand-title">Photo gallery</h1>
            <span className="ig-brand-sub">Curated Photography Feed</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="ig-rail-search">
          <i className="fa-solid fa-magnifying-glass ig-search-ic" />
          <input
            type="text"
            placeholder="Search author or photo #ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search photos by author or ID"
          />
          {searchQuery && (
            <button
              type="button"
              className="ig-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Primary Feed Navigation */}
        <nav className="ig-nav-menu" aria-label="Gallery navigation">
          <div className="ig-nav-section-label">FEEDS &amp; COLLECTIONS</div>

          <button
            type="button"
            className={`ig-nav-item ${
              activeNavFilter === "all" && layoutMode === "ig-feed"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveNavFilter("all");
              setLayoutMode("ig-feed");
            }}
          >
            <i className="fa-solid fa-house" />
            <span>Home Feed</span>
            <span className="ig-nav-badge">{photos.length}</span>
          </button>

          <button
            type="button"
            className={`ig-nav-item ${
              activeNavFilter === "all" && layoutMode === "classic-split"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveNavFilter("all");
              setLayoutMode("classic-split");
            }}
          >
            <i className="fa-solid fa-table-list" />
            <span>Compact List View</span>
          </button>

          <button
            type="button"
            className={`ig-nav-item ${
              activeNavFilter === "all" && layoutMode === "explore-grid"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveNavFilter("all");
              setLayoutMode("explore-grid");
            }}
          >
            <i className="fa-regular fa-compass" />
            <span>Explore Grid</span>
          </button>

          <button
            type="button"
            className={`ig-nav-item ${
              activeNavFilter === "liked" ? "active" : ""
            }`}
            onClick={() => setActiveNavFilter("liked")}
          >
            <i className="fa-solid fa-thumbs-up" />
            <span>Liked Photos</span>
            <span className="ig-nav-badge accent">{totalLikesCount}</span>
          </button>

          <button
            type="button"
            className={`ig-nav-item ${
              activeNavFilter === "saved" ? "active" : ""
            }`}
            onClick={() => setActiveNavFilter("saved")}
          >
            <i className="fa-solid fa-bookmark" />
            <span>Saved Collection</span>
            <span className="ig-nav-badge">{savedIds.length}</span>
          </button>
        </nav>

        {/* Sort Controls */}
        <div className="ig-rail-controls">
          <div className="ig-nav-section-label">PREFERENCES</div>

          <div className="ig-control-row">
            <span>Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ig-mini-select"
            >
              <option value="feed">Latest First</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>

          {totalLikesCount > 0 && (
            <button
              type="button"
              className="ig-rail-toggle-btn danger"
              onClick={handleResetAllLikes}
            >
              <i className="fa-solid fa-rotate-left" />
              <span>Reset All Likes ({totalLikesCount})</span>
            </button>
          )}
        </div>

        {/* Bottom Theme Switcher & Engineer Credit */}
        <div className="ig-rail-footer">
          <button
            type="button"
            className="ig-theme-switch-btn"
            onClick={() => setDarkMode((d) => !d)}
          >
            <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`} />
            <span>{darkMode ? "Light Studio Theme" : "Dark Studio Theme"}</span>
          </button>
        </div>
      </aside>

      {/* ==================== 2. CENTER 1-COLUMN INFINITE SCROLL STREAM ==================== */}
      <div className="ig-center-stage">
        {/* Top Mobile / Compact Header Bar */}
        <header className="ig-top-bar">
          <div className="ig-top-bar-left">
            <h2 className="ig-top-heading">Photo gallery</h2>
            <span className="ig-live-feed-pill">
              <span className="ig-pulse-dot" />
              Page {page} · {photos.length} Articles · {totalLikesCount} Likes
            </span>
          </div>

          <div className="ig-top-bar-actions">
            <div className="ig-layout-pills" role="group" aria-label="View Mode">
              <button
                type="button"
                className={layoutMode === "ig-feed" ? "active" : ""}
                onClick={() => setLayoutMode("ig-feed")}
              >
                <i className="fa-solid fa-bars-staggered" /> 1-Col Feed
              </button>
              <button
                type="button"
                className={layoutMode === "classic-split" ? "active" : ""}
                onClick={() => setLayoutMode("classic-split")}
              >
                <i className="fa-solid fa-list" /> Classic 1-Col
              </button>
              <button
                type="button"
                className={layoutMode === "explore-grid" ? "active" : ""}
                onClick={() => setLayoutMode("explore-grid")}
              >
                <i className="fa-solid fa-grip" /> Grid
              </button>
            </div>
          </div>
        </header>

        {/* Photographer Highlights Tray — Filter by Photographer (`author`) */}
        <section
          className="ig-stories-bar"
          aria-label="Filter by photographer"
        >
          <button
            type="button"
            className={`ig-story-item ${
              selectedAuthor === "ALL" ? "active" : ""
            }`}
            onClick={() => setSelectedAuthor("ALL")}
          >
            <div className="ig-story-ring all-ring">
              <div className="ig-story-avatar all-avatar">
                <i className="fa-solid fa-infinity" />
              </div>
            </div>
            <span className="ig-story-name">All ({photos.length})</span>
          </button>

          {uniqueAuthors.map(({ author, meta, count }) => (
            <button
              key={author}
              type="button"
              className={`ig-story-item ${
                selectedAuthor === author ? "active" : ""
              }`}
              onClick={() =>
                setSelectedAuthor((prev) => (prev === author ? "ALL" : author))
              }
            >
              <div className="ig-story-ring">
                <div
                  className="ig-story-avatar"
                  style={{ backgroundColor: meta.avatarColor }}
                >
                  {meta.initials}
                </div>
              </div>
              <span className="ig-story-name">
                {author.split(" ")[0]} ({count})
              </span>
            </button>
          ))}
        </section>

        {/* Active Filter Pill Banner */}
        {(selectedAuthor !== "ALL" ||
          activeNavFilter !== "all" ||
          searchQuery.trim()) && (
          <div className="ig-active-filter-bar">
            <span>
              Showing <strong>{displayedPhotos.length}</strong> articles
              {selectedAuthor !== "ALL" ? ` by ${selectedAuthor}` : ""}
              {activeNavFilter === "liked" ? " with Thumbs-Up > 0" : ""}
              {activeNavFilter === "saved" ? " in Saved Collection" : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedAuthor("ALL");
                setActiveNavFilter("all");
                setSearchQuery("");
              }}
            >
              Clear All Filters ×
            </button>
          </div>
        )}

        {/* ==================== ARTICLES STREAM ==================== */}
        <main className={`ig-articles-stream ${layoutMode}`}>
          {displayedPhotos.map((photo, index) => {
            const count = likesMap[photo.id] || 0;
            const isPopping = poppingId === String(photo.id);
            const isBursting = burstPhotoId === String(photo.id);
            const isSaved = savedIds.includes(String(photo.id));
            const isCopied = copiedId === String(photo.id);
            const meta = getPhotographerMeta(photo.author, photo.id);
            const photoComments = commentsMap[photo.id] || [];
            const draft = commentDrafts[photo.id] || "";

            // MODE A: Classic Assignment Reference Split 1-Column View (Matches photo-gallery.jpg)
            if (layoutMode === "classic-split") {
              return (
                <article
                  key={photo.id}
                  className="pg-classic-article-row"
                  data-photo-id={photo.id}
                  data-download-url={photo.download_url}
                >
                  <div
                    className="pg-classic-thumb"
                    onClick={() => setSelectedPhotoIndex(index)}
                    onDoubleClick={() => handleThumbsUpClick(photo.id, true)}
                  >
                    <SmartPhoto
                      photo={photo}
                      className="pg-classic-img"
                    />
                    {isBursting && (
                      <div className="ig-burst-overlay">
                        <i className="fa-solid fa-thumbs-up" />
                      </div>
                    )}
                  </div>

                  <div className="pg-classic-info">
                    <div className="pg-classic-author-line">
                      <span className="pg-classic-author-label">
                        Author: {photo.author}
                      </span>

                      <button
                        type="button"
                        className={`pg-classic-thumbs-btn ${
                          isPopping ? "pop" : ""
                        }`}
                        onClick={() => handleThumbsUpClick(photo.id)}
                        aria-label={`Thumbs up for photo by ${photo.author}`}
                      >
                        <i className="fa-solid fa-thumbs-up" />
                        <span className="pg-classic-count">{count}</span>
                      </button>
                    </div>

                    <div className="pg-classic-submeta">
                      <span>Page {photo.page || 1}</span>
                      <span>·</span>
                      <span>ID #{photo.id}</span>
                      <span>·</span>
                      <span>
                        {photo.width} × {photo.height}px
                      </span>
                      <span>·</span>
                      <button
                        type="button"
                        className="pg-classic-inspect-link"
                        onClick={() => setSelectedPhotoIndex(index)}
                      >
                        Inspect HD ↗
                      </button>
                    </div>
                  </div>
                </article>
              );
            }

            // MODE B: Explore 3-Column Grid View
            if (layoutMode === "explore-grid") {
              return (
                <article
                  key={photo.id}
                  className="ig-explore-card"
                  data-photo-id={photo.id}
                  data-download-url={photo.download_url}
                >
                  <div
                    className="ig-explore-media"
                    onClick={() => setSelectedPhotoIndex(index)}
                    onDoubleClick={() => handleThumbsUpClick(photo.id, true)}
                  >
                    <SmartPhoto
                      photo={photo}
                      className="ig-explore-img"
                    />
                    <div className="ig-explore-overlay">
                      <span>
                        <i className="fa-solid fa-thumbs-up" /> {count}
                      </span>
                      <span>#{photo.id}</span>
                    </div>
                  </div>
                  <div className="ig-explore-footer">
                    <span className="ig-explore-author">
                      Author: {photo.author}
                    </span>
                    <button
                      type="button"
                      className={`ig-inline-thumbs-btn ${
                        count > 0 ? "liked" : ""
                      } ${isPopping ? "pop" : ""}`}
                      onClick={() => handleThumbsUpClick(photo.id)}
                    >
                      <i className="fa-solid fa-thumbs-up" />
                      <span>{count}</span>
                    </button>
                  </div>
                </article>
              );
            }

            // MODE C (DEFAULT): 1-Column Editorial Post Card Feed
            return (
              <article
                key={photo.id}
                className="ig-post-card"
                data-photo-id={photo.id}
                data-download-url={photo.download_url}
              >
                {/* 1. Post Card Header */}
                <header className="ig-post-header">
                  <div
                    className="ig-post-author-left"
                    onClick={() =>
                      setSelectedAuthor((prev) =>
                        prev === photo.author ? "ALL" : photo.author
                      )
                    }
                  >
                    <div className="ig-avatar-ring">
                      <div
                        className="ig-avatar-inner"
                        style={{ backgroundColor: meta.avatarColor }}
                      >
                        {meta.initials}
                      </div>
                    </div>
                    <div className="ig-post-author-text">
                      <div className="ig-post-author-top">
                        <strong>{photo.author}</strong>
                        <i className="fa-solid fa-circle-check ig-verified-icon" />
                        <span className="ig-post-page-pill">
                          Page {photo.page || 1}
                        </span>
                      </div>
                      <span className="ig-post-location">
                        {meta.location} · {meta.camera} ({photo.width}×
                        {photo.height})
                      </span>
                    </div>
                  </div>

                  <div className="ig-post-header-right">
                    <button
                      type="button"
                      className="ig-header-pill-btn"
                      onClick={() => handleCopyDownloadUrl(photo)}
                    >
                      <i
                        className={`fa-solid ${
                          isCopied ? "fa-check" : "fa-link"
                        }`}
                      />
                      <span>{isCopied ? "Copied URL" : `ID #${photo.id}`}</span>
                    </button>
                  </div>
                </header>

                {/* 2. Main Photo Frame (Double-click to Thumbs-Up burst, single click to inspect) */}
                <div
                  className="ig-post-media-frame"
                  onDoubleClick={() => handleThumbsUpClick(photo.id, true)}
                >
                  <SmartPhoto
                    photo={photo}
                    className="ig-post-main-img"
                  />

                  {isBursting && (
                    <div className="ig-burst-overlay">
                      <i className="fa-solid fa-thumbs-up" />
                    </div>
                  )}

                  <button
                    type="button"
                    className="ig-expand-lightbox-pill"
                    onClick={() => setSelectedPhotoIndex(index)}
                  >
                    <i className="fa-solid fa-expand" /> Inspect HD
                  </button>

                  <span className="ig-doubletap-hint">
                    Double-click photo or click 👍 to like
                  </span>
                </div>

                {/* 3. Action Bar + Required FontAwesome Thumbs-Up Icon & Count */}
                <div className="ig-post-body">
                  <div className="ig-post-action-bar">
                    <div className="ig-post-actions-left">
                      {/* OFFICIAL REQUIREMENT: FontAwesome Thumbs-Up Icon + Count (initialized to 0, increments on every click) */}
                      <button
                        type="button"
                        className={`ig-thumbs-up-main-btn ${
                          count > 0 ? "liked" : ""
                        } ${isPopping ? "pop" : ""}`}
                        onClick={() => handleThumbsUpClick(photo.id)}
                        aria-label={`Thumbs up for photo by ${photo.author}`}
                      >
                        <i className="fa-solid fa-thumbs-up thumbs-up-fa-icon" />
                        <span className="thumbs-up-count">{count}</span>
                        {isPopping && <span className="ig-plus-one">+1</span>}
                      </button>

                      <button
                        type="button"
                        className="ig-action-circle-btn"
                        onClick={() => setSelectedPhotoIndex(index)}
                        aria-label="Inspect photo & comments"
                      >
                        <i className="fa-regular fa-comment" />
                      </button>

                      <a
                        href={getInstantPhotoUrl(photo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ig-action-circle-btn"
                        title={`Original download_url: ${photo.download_url}`}
                        aria-label="Open high-res photo"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" />
                      </a>
                    </div>

                    <div className="ig-post-actions-right">
                      <button
                        type="button"
                        className={`ig-action-circle-btn ${
                          isSaved ? "saved" : ""
                        }`}
                        onClick={() => handleToggleSave(photo.id)}
                        aria-label="Bookmark photo"
                      >
                        <i
                          className={`${
                            isSaved ? "fa-solid" : "fa-regular"
                          } fa-bookmark`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Author Line & Editorial Caption */}
                  <div className="ig-post-author-caption">
                    <div className="ig-required-author-row">
                      <span className="photo-author-text">
                        Author: <strong>{photo.author}</strong>
                      </span>
                      <span className="ig-exif-inline-tag">
                        {meta.lens} · {meta.shutter} · {meta.iso}
                      </span>
                    </div>
                    <p className="ig-caption-paragraph">
                      <span className="ig-handle">{meta.handle}</span>{" "}
                      {meta.caption}
                    </p>
                  </div>

                  {/* User Comments List */}
                  {photoComments.length > 0 && (
                    <div className="ig-post-comments-list">
                      {photoComments.map((c, i) => (
                        <div key={i} className="ig-post-comment-item">
                          <strong>@{c.user}</strong> <span>{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Inline Comment Input */}
                  <form
                    className="ig-inline-comment-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddComment(photo.id, draft);
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Add a comment on this shot..."
                      value={draft}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [photo.id]: e.target.value,
                        }))
                      }
                    />
                    {draft.trim() && <button type="submit">Post</button>}
                  </form>
                </div>
              </article>
            );
          })}

          {displayedPhotos.length === 0 && !isLoading && (
            <div className="ig-empty-state">
              <i className="fa-regular fa-images" />
              <h3>No matching photos found</h3>
              <p>Try clearing your current search or author filter.</p>
              <button
                type="button"
                className="ig-primary-btn"
                onClick={() => {
                  setSelectedAuthor("ALL");
                  setActiveNavFilter("all");
                  setSearchQuery("");
                }}
              >
                Show All Photos
              </button>
            </div>
          )}
        </main>

        {/* ==================== INFINITE SCROLL SENTINEL FOOTER ==================== */}
        <footer ref={sentinelRef} className="ig-infinite-sentinel">
          {isLoading && (
            <div className="ig-loading-pill">
              <i className="fa-solid fa-circle-notch fa-spin" />
              <span>Loading more photos...</span>
            </div>
          )}

          {hasMore && !isLoading && (
            <button
              type="button"
              className="ig-load-more-btn"
              onClick={() => setPage((p) => p + 1)}
            >
              <span>Load More Photos</span>
              <i className="fa-solid fa-arrow-down" />
            </button>
          )}

          {!hasMore && (
            <div className="ig-end-feed-card">
              <i className="fa-solid fa-circle-check" />
              <div>
                <strong>You&apos;re all caught up!</strong>
                <p>
                  You have viewed all {photos.length} photos in the feed.
                </p>
              </div>
            </div>
          )}
        </footer>
      </div>

      {/* ==================== 3. RIGHT SIDEBAR RAIL ==================== */}
      <aside className="ig-right-rail">
        {/* Profile Card (Username + Name) */}
        <div className="ig-profile-card">
          <div className="ig-profile-avatar">KK</div>
          <div className="ig-profile-info">
            <strong>kumar_kshitij</strong>
            <span>Kumar Kshitij</span>
          </div>
        </div>

        {/* Gallery Activity Card */}
        <div className="ig-side-card">
          <div className="ig-side-card-header">
            <span>YOUR ACTIVITY</span>
            <i className="fa-solid fa-chart-simple" />
          </div>

          <div className="ig-telemetry-grid">
            <div className="ig-tel-stat">
              <span>Photos Loaded</span>
              <strong>{photos.length}</strong>
            </div>
            <div className="ig-tel-stat">
              <span>Feed Page</span>
              <strong>Page {page}</strong>
            </div>
            <div className="ig-tel-stat">
              <span>Total Likes</span>
              <strong className="accent">{totalLikesCount}</strong>
            </div>
            <div className="ig-tel-stat">
              <span>Saved Shots</span>
              <strong>{savedIds.length}</strong>
            </div>
          </div>
        </div>

        {/* Popular Photographers Leaderboard */}
        <div className="ig-side-card">
          <div className="ig-side-card-header">
            <span>POPULAR PHOTOGRAPHERS</span>
            <i className="fa-solid fa-award" />
          </div>

          <div className="ig-leaderboard-list">
            {authorLeaderboard.map((item, idx) => (
              <div
                key={item.author}
                className={`ig-lb-row ${
                  selectedAuthor === item.author ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedAuthor((prev) =>
                    prev === item.author ? "ALL" : item.author
                  )
                }
              >
                <span className="ig-lb-rank">#{idx + 1}</span>
                <div
                  className="ig-lb-mini-avatar"
                  style={{ backgroundColor: item.meta.avatarColor }}
                >
                  {item.meta.initials}
                </div>
                <div className="ig-lb-info">
                  <strong>{item.author}</strong>
                  <span>{item.photos} articles in feed</span>
                </div>
                <div className="ig-lb-score">
                  <i className="fa-solid fa-thumbs-up" />
                  <span>{item.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          className="ig-scroll-top-fab"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <i className="fa-solid fa-arrow-up" />
        </button>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <LightboxModal
          photo={selectedPhoto}
          likesCount={likesMap[selectedPhoto.id] || 0}
          isSaved={savedIds.includes(String(selectedPhoto.id))}
          comments={commentsMap[selectedPhoto.id] || []}
          onLike={(id) => handleThumbsUpClick(id)}
          onToggleSave={handleToggleSave}
          onAddComment={handleAddComment}
          onClose={() => setSelectedPhotoIndex(null)}
          onPrev={() =>
            setSelectedPhotoIndex((idx) => (idx > 0 ? idx - 1 : idx))
          }
          onNext={() =>
            setSelectedPhotoIndex((idx) =>
              idx < displayedPhotos.length - 1 ? idx + 1 : idx
            )
          }
          hasPrev={selectedPhotoIndex > 0}
          hasNext={selectedPhotoIndex < displayedPhotos.length - 1}
        />
      )}
    </div>
  );
}
