"use client";

import type { Property } from "@/types/property";
import PhotoCarousel from "./PhotoCarousel";
import PropertyInfo from "./PropertyInfo";
import styles from "./PropertySection.module.css";

interface PropertySectionProps {
  property: Property;
  isActive: boolean;
}

export default function PropertySection({
  property,
  isActive,
}: PropertySectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <PhotoCarousel photos={property.photos} propertyTitle={property.title} />
        <div className={styles.gradient} />
        <PropertyInfo property={property} isActive={isActive} />
      </div>
    </section>
  );
}
