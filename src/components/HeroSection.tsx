"use client";

import { motion } from "framer-motion";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <motion.div
        className={styles.brandRow}
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 1.2,
          delay: 0.1,
          type: "spring",
          stiffness: 60,
          damping: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/feather.png"
          alt=""
          className={styles.featherImg}
        />
        <h1 className={styles.brand}>MyDiaries</h1>
      </motion.div>

      <motion.div
        className={styles.rule}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 1.0,
          delay: 0.6,
          type: "spring",
          stiffness: 80,
          damping: 16,
        }}
      />

      <motion.p
        className={styles.tagline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.8,
          type: "spring",
          stiffness: 70,
          damping: 14,
        }}
      >
        Every Stay is a Story
      </motion.p>

      <motion.p
        className={styles.values}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 1.1,
          type: "spring",
          stiffness: 70,
          damping: 14,
        }}
      >
        Rest &nbsp;·&nbsp; Relax &nbsp;·&nbsp; Refresh
      </motion.p>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.8, delay: 1.8 }}
      >
        <span className={styles.scrollText}>Explore</span>
        <motion.div
          className={styles.scrollLine}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{
            duration: 2.0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </section>
  );
}
