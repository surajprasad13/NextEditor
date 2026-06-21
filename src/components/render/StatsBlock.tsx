"use client";

import React, { useState } from "react";

interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatsBlockProps {
  title?: string;
  subtitle?: string;
  stats?: StatItem[];
  isEditable?: boolean;
  onChange?: (props: any) => void;
}

export function StatsBlock({
  title = "",
  subtitle = "",
  stats = [
    { value: "10K", label: "Happy Customers", suffix: "+" },
    { value: "99.9", label: "Uptime Guarantee", suffix: "%" },
    { value: "24", label: "Support Hours", suffix: "/7" },
  ],
  isEditable = false,
  onChange,
}: StatsBlockProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localSubtitle, setLocalSubtitle] = useState(subtitle);
  const [localStats, setLocalStats] = useState<StatItem[]>(stats);

  const updateStat = (idx: number, field: keyof StatItem, value: string) => {
    const updated = localStats.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s,
    );
    setLocalStats(updated);
  };

  const addStat = () =>
    setLocalStats([
      ...localStats,
      { value: "100", label: "New Metric", suffix: "+" },
    ]);

  const removeStat = (idx: number) =>
    setLocalStats(localStats.filter((_, i) => i !== idx));

  if (isEditable) {
    return (
      <div className="block-editor-form">
        <div className="block-editor-form-title">Stats Block Settings</div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Section Title</label>
            <input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="editor-form-input"
              placeholder="Our Numbers"
            />
          </div>
          <div className="editor-form-field">
            <label>Subtitle</label>
            <input
              value={localSubtitle}
              onChange={(e) => setLocalSubtitle(e.target.value)}
              className="editor-form-input"
              placeholder="Trusted by thousands"
            />
          </div>
        </div>
        <div className="stats-editor-list">
          {localStats.map((stat, idx) => (
            <div key={idx} className="stat-editor-row">
              <div className="stat-editor-row-label">Stat {idx + 1}</div>
              <div className="stat-editor-fields">
                <input
                  value={stat.prefix || ""}
                  onChange={(e) => updateStat(idx, "prefix", e.target.value)}
                  className="editor-form-input"
                  placeholder="$"
                  style={{ width: "56px" }}
                  title="Prefix"
                />
                <input
                  value={stat.value}
                  onChange={(e) => updateStat(idx, "value", e.target.value)}
                  className="editor-form-input"
                  placeholder="100"
                  style={{ flex: 1 }}
                  title="Value"
                />
                <input
                  value={stat.suffix || ""}
                  onChange={(e) => updateStat(idx, "suffix", e.target.value)}
                  className="editor-form-input"
                  placeholder="+%"
                  style={{ width: "56px" }}
                  title="Suffix"
                />
                <input
                  value={stat.label}
                  onChange={(e) => updateStat(idx, "label", e.target.value)}
                  className="editor-form-input"
                  placeholder="Label"
                  style={{ flex: 2 }}
                  title="Label"
                />
                <button
                  type="button"
                  onClick={() => removeStat(idx)}
                  className="stat-remove-btn"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addStat} className="stat-add-btn">
          + Add Stat
        </button>
        <button
          type="button"
          className="block-form-apply-btn"
          onClick={() =>
            onChange?.({
              title: localTitle,
              subtitle: localSubtitle,
              stats: localStats,
            })
          }
        >
          ✓ Apply Changes
        </button>
      </div>
    );
  }

  return (
    <div className="stats-block">
      {(title || subtitle) && (
        <div className="stats-block-header">
          {title && <h3 className="stats-block-title">{title}</h3>}
          {subtitle && <p className="stats-block-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-item">
            <div className="stat-value">
              {stat.prefix && <span className="stat-affix">{stat.prefix}</span>}
              <span className="stat-number">{stat.value}</span>
              {stat.suffix && <span className="stat-affix">{stat.suffix}</span>}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
