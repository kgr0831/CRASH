"use client";

import { SPECTRUMS } from "@/lib/heat";

const SPECTRUM_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "infrared", label: "Infrared" },
  { value: "coolhot", label: "Cool→Hot" },
  { value: "bipolar", label: "Blue↔Red" },
  { value: "night", label: "Night" },
];

interface SettingsBarProps {
  spectrumKey: string;
  dark: boolean;
  onSpectrumChange: (key: string) => void;
  onDarkChange: (dark: boolean) => void;
}

export default function SettingsBar({
  spectrumKey,
  dark,
  onSpectrumChange,
  onDarkChange,
}: SettingsBarProps) {
  const spectrum = SPECTRUMS[spectrumKey] || SPECTRUMS.classic;

  return (
    <div className="settings-bar">
      <div className="settings-group">
        <span className="settings-label">스펙트럼</span>
        <div className="spectrum-options">
          {SPECTRUM_OPTIONS.map((opt) => {
            const sp = SPECTRUMS[opt.value];
            return (
              <button
                key={opt.value}
                className={
                  "spectrum-chip" +
                  (spectrumKey === opt.value ? " active" : "")
                }
                onClick={() => onSpectrumChange(opt.value)}
                title={opt.label}
              >
                <span
                  className="spectrum-preview"
                  style={{
                    background: `linear-gradient(90deg, ${sp.join(", ")})`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="spectrum-bar-preview"
        style={{
          background: `linear-gradient(90deg, ${spectrum.join(", ")})`,
        }}
      />

      <div className="settings-group">
        <span className="settings-label">테마</span>
        <button
          className="theme-toggle"
          onClick={() => onDarkChange(!dark)}
          aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          <span className="theme-icon">{dark ? "☀️" : "🌙"}</span>
          <span className="theme-text">{dark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </div>
  );
}
