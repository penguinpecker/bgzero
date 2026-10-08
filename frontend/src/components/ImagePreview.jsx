import { useEffect, useRef, useState } from "react";
import { drawImage, loadImage } from "../lib/image";

export default function ImagePreview({ src, settings, label, onError }) {
  const canvas = useRef(null);
  const [image, setImage] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setImage(null);
    loadImage(src)
      .then((value) => {
        if (!cancelled) setImage(value);
      })
      .catch((error) => {
        if (!cancelled) onError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [src, onError]);
  useEffect(() => {
    if (!image) return;
    const frame = requestAnimationFrame(() => {
      try {
        drawImage(canvas.current, image, settings, { preview: true });
      } catch (error) {
        onError(error.message);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [image, settings, onError]);
  return (
    <canvas
      ref={canvas}
      className="result-image"
      role="img"
      aria-label={label}
      aria-busy={!image}
    />
  );
}
