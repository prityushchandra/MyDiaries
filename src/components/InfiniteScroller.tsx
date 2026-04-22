"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Property } from "@/types/property";
import HeroSection from "./HeroSection";
import PropertySection from "./PropertySection";
import styles from "./InfiniteScroller.module.css";

interface InfiniteScrollerProps {
  properties: Property[];
}

export default function InfiniteScroller({
  properties,
}: InfiniteScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePropertyIndex, setActivePropertyIndex] = useState(-1);
  const isResettingRef = useRef(false);
  const propertyCount = properties.length;

  // Layout: [hero] [clone of last N props] [original props] [clone of first N props]
  // We clone the full set on each side to allow seamless looping.
  const sections = [
    ...properties.map((p, i) => ({ ...p, _loopKey: `pre-${i}` })),
    ...properties.map((p, i) => ({ ...p, _loopKey: `main-${i}` })),
    ...properties.map((p, i) => ({ ...p, _loopKey: `post-${i}` })),
  ];

  // Hero is section 0, then pre-clones start at 1, main set starts at 1 + propertyCount
  const mainStartIndex = 1 + propertyCount; // index in the scroll container (including hero)

  const resetToMain = useCallback(() => {
    const container = containerRef.current;
    if (!container || isResettingRef.current) return;

    const sectionHeight = window.innerHeight;
    // Current scroll section index (0 = hero)
    const currentSection = Math.round(container.scrollTop / sectionHeight);

    // Skip if we're on the hero or within the main section
    const heroSections = 1;
    const scrollSection = currentSection - heroSections; // property index in the tripled list

    if (scrollSection < 0) return; // on hero

    if (scrollSection < propertyCount) {
      // In pre-clone zone — jump to same property in main zone
      isResettingRef.current = true;
      const mainSection = scrollSection + propertyCount;
      container.scrollTop = (mainSection + heroSections) * sectionHeight;
      isResettingRef.current = false;
    } else if (scrollSection >= propertyCount * 2) {
      // In post-clone zone — jump to same property in main zone
      isResettingRef.current = true;
      const mainSection = scrollSection - propertyCount * 2;
      container.scrollTop = (mainSection + heroSections + propertyCount) * sectionHeight;
      isResettingRef.current = false;
    }
  }, [propertyCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      if (isResettingRef.current) return;

      const sectionHeight = window.innerHeight;
      const currentSection = Math.round(container!.scrollTop / sectionHeight);

      if (currentSection === 0) {
        setActivePropertyIndex(-1); // hero
      } else {
        const propertyIdx = (currentSection - 1) % propertyCount;
        setActivePropertyIndex(propertyIdx);
      }
    }

    let scrollTimer: ReturnType<typeof setTimeout>;
    function handleScrollEnd() {
      resetToMain();
    }
    function handleScrollWithDebounce() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScrollEnd, 150);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scroll", handleScrollWithDebounce, { passive: true });
    container.addEventListener("scrollend", handleScrollEnd);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scroll", handleScrollWithDebounce);
      container.removeEventListener("scrollend", handleScrollEnd);
      clearTimeout(scrollTimer);
    };
  }, [propertyCount, mainStartIndex, resetToMain]);

  return (
    <div className={styles.container} ref={containerRef}>
      <HeroSection />
      {sections.map((property, index) => (
        <PropertySection
          key={property._loopKey}
          property={property}
          isActive={
            activePropertyIndex >= 0 &&
            index % propertyCount === activePropertyIndex
          }
        />
      ))}
    </div>
  );
}
