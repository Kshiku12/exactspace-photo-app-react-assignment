import React, { useState, useEffect } from "react";
import {
  getInstantPhotoUrl,
  getPhotographerMeta,
} from "../data/picsumFallbackPages";
import { createOfflineSvgFallback } from "./SmartPhoto";

export default function LightboxModal({
  photo,
  likesCount,
  isSaved = false,
  comments = [],
  onLike,
  onToggleSave,
  onAddComment,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  const [filterMode, setFilterMode] = useState("normal"); // normal | grayscale | blur
  const [zoomLevel, setZoomLevel] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [commentText, setCommentText] = useState("");
  const [doubleTapPop, setDoubleTapPop] = useState(false);

  const meta = photo ? getPhotographerMeta(photo.author, photo.id) : null;
  const instantUrl = photo ? getInstantPhotoUrl(photo) : "";
  const svgFallback =
    photo && meta ? createOfflineSvgFallback(photo, meta) : "";

  useEffect(() => {
    if (!photo) return;
    setFilterMode("normal");
    setZoomLevel(1);
    setImgSrc(getInstantPhotoUrl(photo));
  }, [photo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!photo || !meta) return null;

  const cssFilter =
    filterMode === "grayscale"
      ? "grayscale(100%) contrast(1.08)"
      : filterMode === "blur"
      ? "blur(5px) saturate(1.1)"
      : "none";

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(instantUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `picsum-${photo.id}-${photo.author
        .toLowerCase()
        .replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(instantUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const handleDoubleClickImage = () => {
    onLike(photo.id);
    setDoubleTapPop(true);
    setTimeout(() => setDoubleTapPop(false), 750);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment && onAddComment(photo.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div
      className="ig-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo by ${photo.author}`}
    >
      <button
        type="button"
        className="ig-lightbox-close-floating"
        onClick={onClose}
        aria-label="Close modal"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      {hasPrev && (
        <button
          type="button"
          className="ig-lb-arrow prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous photo"
        >
          <i className="fa-solid fa-chevron-left" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className="ig-lb-arrow next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next photo"
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}

      <div
        className="ig-lightbox-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: High-Res Interactive Image Stage */}
        <div
          className="ig-lightbox-media-stage"
          onDoubleClick={handleDoubleClickImage}
        >
          <img
            src={imgSrc || instantUrl}
            alt={`Photograph by ${photo.author}`}
            className="ig-lightbox-img"
            style={{
              transform: `scale(${zoomLevel})`,
              filter: cssFilter,
              transition: "transform 0.25s ease, filter 0.2s ease",
            }}
            onError={() => {
              if (imgSrc !== svgFallback) {
                setImgSrc(svgFallback);
              }
            }}
          />

          {doubleTapPop && (
            <div className="ig-burst-overlay">
              <i className="fa-solid fa-thumbs-up" />
            </div>
          )}

          {/* Top Floating Filter & Zoom Bar */}
          <div className="ig-stage-floating-tools">
            <div className="ig-filter-pills">
              <button
                type="button"
                className={filterMode === "normal" ? "active" : ""}
                onClick={() => setFilterMode("normal")}
              >
                Original
              </button>
              <button
                type="button"
                className={filterMode === "grayscale" ? "active" : ""}
                onClick={() => setFilterMode("grayscale")}
              >
                B&amp;W
              </button>
              <button
                type="button"
                className={filterMode === "blur" ? "active" : ""}
                onClick={() => setFilterMode("blur")}
              >
                Depth Blur
              </button>
            </div>

            <button
              type="button"
              className="ig-zoom-pill"
              onClick={() =>
                setZoomLevel((z) => (z === 1 ? 1.4 : z === 1.4 ? 1.85 : 1))
              }
            >
              <i className="fa-solid fa-magnifying-glass-plus" /> {zoomLevel}x
            </button>
          </div>
        </div>

        {/* Right: Post Details & Interactions Sidebar */}
        <div className="ig-lightbox-sidebar">
          <div className="ig-lb-header">
            <div className="ig-avatar-ring">
              <div
                className="ig-avatar-inner"
                style={{ backgroundColor: meta.avatarColor }}
              >
                {meta.initials}
              </div>
            </div>
            <div className="ig-lb-author-meta">
              <div className="ig-lb-author-row">
                <strong>{photo.author}</strong>
                <i className="fa-solid fa-circle-check ig-verified-icon" />
              </div>
              <span>
                {meta.location} · {meta.camera}
              </span>
            </div>
            <span className="ig-id-badge">ID #{photo.id}</span>
          </div>

          <div className="ig-lb-scroll-body">
            {/* Photographer Caption & Specs */}
            <div className="ig-lb-caption-block">
              <p className="ig-lb-caption-text">
                <strong>Author: {photo.author}</strong> {meta.caption}
              </p>
              <div className="ig-exif-grid">
                <div>
                  <span>Resolution</span>
                  <strong>
                    {photo.width} × {photo.height}
                  </strong>
                </div>
                <div>
                  <span>Camera</span>
                  <strong>{meta.camera}</strong>
                </div>
                <div>
                  <span>Lens</span>
                  <strong>{meta.lens}</strong>
                </div>
                <div>
                  <span>Exposure</span>
                  <strong>
                    {meta.shutter} · {meta.iso}
                  </strong>
                </div>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="ig-lb-comments">
              <div className="ig-comment-row">
                <strong>@visual_curator</strong>
                <span>
                  Incredible tonal range and framing on shot #{photo.id} 🔥
                </span>
              </div>
              {comments.map((c, idx) => (
                <div key={idx} className="ig-comment-row">
                  <strong>@{c.user}</strong>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Bar with FontAwesome Thumbs-Up Icon & Multi-Click Counter */}
          <div className="ig-lb-footer">
            <div className="ig-lb-action-row">
              <button
                type="button"
                className={`ig-thumbs-up-btn ${likesCount > 0 ? "liked" : ""}`}
                onClick={() => onLike(photo.id)}
              >
                <i className="fa-solid fa-thumbs-up" />
                <span>{likesCount}</span>
              </button>

              <button
                type="button"
                className="ig-icon-action-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                <i className="fa-solid fa-download" />
                <span>{downloading ? "Saving..." : "HD"}</span>
              </button>

              <button
                type="button"
                className={`ig-icon-action-btn ${isSaved ? "saved" : ""}`}
                onClick={() => onToggleSave && onToggleSave(photo.id)}
              >
                <i
                  className={`${
                    isSaved ? "fa-solid" : "fa-regular"
                  } fa-bookmark`}
                />
              </button>
            </div>

            <form onSubmit={handleCommentSubmit} className="ig-lb-comment-form">
              <input
                type="text"
                placeholder="Add a studio note or comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" disabled={!commentText.trim()}>
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
