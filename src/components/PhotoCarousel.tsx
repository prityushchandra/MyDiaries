"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAspectRatio } from "@/hooks/useAspectRatio";
import type { MockImage } from "@/types/property";
import styles from "./PhotoCarousel.module.css";

interface PhotoCarouselProps {
  photos: MockImage[];
  propertyTitle: string;
}

function CarouselImage({
  photo,
  propertyTitle,
}: {
  photo: MockImage;
  propertyTitle: string;
}) {
  const { mode } = useAspectRatio(photo.width, photo.height);

  return (
    <div className={styles.imageWrapper}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={propertyTitle}
        className={styles.image}
        style={{
          objectFit: mode,
          objectPosition: "center center",
        }}
      />
    </div>
  );
}

export default function PhotoCarousel({
  photos,
  propertyTitle,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  function handleClick() {
    if (lightboxOpen) return;
    setLightboxOpen(true);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (lightboxOpen) return;
    touchStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (lightboxOpen || touchStartX.current === null) return;
    if (Math.abs(touchStartX.current - e.touches[0].clientX) > 20) didSwipe.current = true;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (lightboxOpen || touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      didSwipe.current = true;
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    if (didSwipe.current) e.preventDefault();
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  return (
    <div
      className={styles.carousel}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.progressBars}>
        {photos.map((_, index) => (
          <div key={index} className={styles.progressSegment}>
            <div
              className={styles.progressFill}
              style={{
                transform: `scaleX(${index <= currentIndex ? 1 : 0})`,
                transition: index === currentIndex ? "transform 0.3s ease-out" : "transform 0.15s ease-out",
              }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          className={styles.photoContainer}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0.5 }),
            center: { x: "0%", opacity: 1 },
            exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0.5 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        >
          <CarouselImage photo={photos[currentIndex]} propertyTitle={propertyTitle} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev(); }
                touchStartX.current = null;
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={photos[currentIndex].url}
                  alt={propertyTitle}
                  className={styles.lightboxImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
            </motion.div>
            <button
              className={styles.lightboxClose}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              aria-label="Close"
            >
              ✕
            </button>
            <p className={styles.lightboxCounter}>
              {currentIndex + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
