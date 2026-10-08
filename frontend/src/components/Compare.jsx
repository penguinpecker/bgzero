import { useState } from "react";

export default function Compare({
  original,
  result,
  label = "Background removal preview",
  background = "transparent",
}) {
  const [position, setPosition] = useState(48);
  return (
    <div className="compare checker" style={{ "--position": `${position}%` }}>
      <div
        className="compare-layer"
        style={{
          backgroundColor:
            background === "transparent" ? undefined : background,
        }}
      >
        <img
          src={result}
          alt={`${label}, background removed`}
          draggable="false"
        />
      </div>
      <div className="compare-layer compare-original">
        <img
          src={original}
          alt={`${label}, original image`}
          draggable="false"
        />
      </div>
      <div className="compare-labels">
        <span>Original</span>
        <span>Background removed</span>
      </div>
      <div className="compare-line">
        <span>
          ‹<i />›
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Compare original and background removed image"
        aria-valuetext={`${position}% original visible`}
      />
      <span className="compare-hint">Drag to see the difference</span>
    </div>
  );
}
