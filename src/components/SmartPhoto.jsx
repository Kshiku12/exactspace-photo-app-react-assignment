import React, { useState, useEffect, useRef } from "react";
import {
  getInstantPhotoUrl,
  getPhotographerMeta,
} from "../data/picsumFallbackPages";

export function createOfflineSvgFallback(photo, meta) {
  const safeAuthor = String(photo?.author || "Photographer").replace(
    /[&<>'"]/g,
    ""
  );
  const safeLocation = String(meta?.location || "Studio").replace(
    /[&<>'"]/g,
    ""
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${meta?.avatarColor || "#4f46e5"}"/>
        <stop offset="55%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="900" height="650" fill="url(#g)"/>
    <circle cx="720" cy="160" r="95" fill="#ffffff" fill-opacity="0.1"/>
    <path d="M0 490 L260 310 L470 450 L680 260 L900 430 L900 650 L0 650 Z" fill="#0f172a" fill-opacity="0.45"/>
    <text x="54" y="535" fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="700">${safeAuthor}</text>
    <text x="54" y="575" fill="#cbd5e1" font-family="Inter, system-ui, sans-serif" font-size="17">${safeLocation}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function SmartPhoto({ photo, className = "", alt = "" }) {
  const meta = getPhotographerMeta(photo.author, photo.id);
  const primarySrc = getInstantPhotoUrl(photo) || photo.download_url;
  const svgFallback = createOfflineSvgFallback(photo, meta);

  const [useFallbackSvg, setUseFallbackSvg] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setUseFallbackSvg(false);
    setLoaded(false);
  }, [photo.id, photo.download_url]);

  useEffect(() => {
    if (
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth > 0
    ) {
      setLoaded(true);
    }
  });

  const activeSrc = useFallbackSvg ? svgFallback : primarySrc;

  return (
    <div
      className={`smart-photo-wrapper ${loaded ? "is-loaded" : "is-loading"}`}
      style={{
        backgroundImage: `url("${svgFallback}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        ref={imgRef}
        src={activeSrc}
        alt={alt || `Photograph by ${photo.author}`}
        className={`${className} ${loaded ? "visible" : ""}`}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!useFallbackSvg) {
            setUseFallbackSvg(true);
            setLoaded(true);
          }
        }}
      />
    </div>
  );
}
