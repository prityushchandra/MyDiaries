"use client";

import { motion, type Variants } from "framer-motion";
import type { Property } from "@/types/property";
import styles from "./PropertyInfo.module.css";

interface PropertyInfoProps {
  property: Property;
  isActive: boolean;
}

const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function PropertyInfo({
  property,
  isActive,
}: PropertyInfoProps) {
  return (
    <motion.div
      className={styles.info}
      variants={staggerChildren}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
    >
      <motion.h2 className={styles.title} variants={fadeUp}>
        {property.title}
      </motion.h2>
      <motion.p className={styles.location} variants={fadeUp}>
        {property.location}
      </motion.p>
      <motion.p className={styles.details} variants={fadeUp}>
        {property.bedrooms} Bedroom{property.bedrooms !== 1 ? "s" : ""}
        {property.amenities?.length > 0 &&
          ` · ${property.amenities.join(" · ")}`}
      </motion.p>
      {property.tagline && (
        <motion.p className={styles.tagline} variants={fadeUp}>
          &ldquo;{property.tagline}&rdquo;
        </motion.p>
      )}
    </motion.div>
  );
}
