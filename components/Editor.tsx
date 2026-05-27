"use client";

import { useState } from "react";
import type { LineResult } from "@/lib/types";
import { heatColor } from "@/lib/heat";

interface EditorProps {
  lines: LineResult[];
  spectrum: string[];
  dark: boolean;
  analyzed: boolean;
  scanLine: number;
  selected: number | null;
  onSelect: (i: number) => void;
}

export default function Editor({
  lines,
  spectrum,
  dark,
  analyzed,
  scanLine,
  selected,
  onSelect,
}: EditorProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="editor">
      <div className="editor-inner">
        {lines.map((line, i) => {
          const revealed = analyzed || i < scanLine;
          const bg = revealed
            ? heatColor(line.score, spectrum, dark, 0.38)
            : "transparent";
          const isSel = selected === i;
          const isHover = hovered === i;

          return (
            <div
              key={i}
              className={
                "row" +
                (isSel ? " sel" : "") +
                (i === scanLine && !analyzed ? " scanning" : "")
              }
              style={{ background: bg }}
              onClick={() => onSelect(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="ln">{i + 1}</span>
              <span className="code">{line.code || " "}</span>
              {revealed && line.score >= 1 && (
                <span
                  className="score-chip"
                  style={{
                    color: heatColor(line.score, spectrum, dark, 1),
                    borderColor: heatColor(line.score, spectrum, dark, 0.5),
                  }}
                >
                  {line.score}
                </span>
              )}
              {isHover && line.advice && revealed && (
                <div className="tooltip">
                  <div className="tooltip-head">
                    <span
                      className="tooltip-score"
                      style={{
                        background: heatColor(line.score, spectrum, dark, 1),
                      }}
                    >
                      {line.score}
                    </span>
                    <span className="tooltip-tags">
                      {(line.tags || []).map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="tooltip-body">{line.advice}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
