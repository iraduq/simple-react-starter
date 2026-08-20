import { useEffect, useState } from "react";
import { isPreviewEnv } from "../lib/preview";

/** Hydration-safe: false la SSR, apoi valoarea reală după montare. */
export function usePreviewMode() {
  const [preview, setPreview] = useState(false);
  useEffect(() => setPreview(isPreviewEnv()), []);
  return preview;
}
