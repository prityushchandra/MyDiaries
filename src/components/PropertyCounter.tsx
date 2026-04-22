"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from "./PropertyCounter.module.css";

interface PropertyCounterProps {
  current: number;
  total: number;
}

export default function PropertyCounter({
  current,
  total,
}: PropertyCounterProps) {
  const padded = String(current).padStart(2, "0");
  const totalPadded = String(total).padStart(2, "0");

  return (
    <div className={styles.counter}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={styles.current}
        >
          {padded}
        </motion.span>
      </AnimatePresence>
      <span className={styles.separator}>/</span>
      <span className={styles.total}>{totalPadded}</span>
    </div>
  );
}
