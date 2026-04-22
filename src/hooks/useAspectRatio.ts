import { useState, useEffect } from "react";

interface AspectRatioResult {
  mode: "cover" | "contain";
}

export function useAspectRatio(
  imageWidth: number,
  imageHeight: number
): AspectRatioResult {
  const [mode, setMode] = useState<"cover" | "contain">("cover");

  useEffect(() => {
    function calculate() {
      const imageRatio = imageWidth / imageHeight;
      const viewportRatio = window.innerWidth / window.innerHeight;
      const mismatch = imageRatio / viewportRatio;
      setMode(mismatch >= 0.7 && mismatch <= 1.3 ? "cover" : "contain");
    }

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [imageWidth, imageHeight]);

  return { mode };
}
