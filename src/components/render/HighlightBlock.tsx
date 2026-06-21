"use client";
import React from "react";

interface HighlightBlockProps {
  text?: string;
  prefix?: string;
  color?: string;
  isEditable?: boolean;
  onChange?: (p: any) => void;
}

export function HighlightBlock({
  text = "",
  prefix = "",
  color = "#6366f1",
  isEditable,
  onChange,
}: HighlightBlockProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 16px",
        background: "var(--bg-input)",
        borderRadius: 8,
        border: "1px solid var(--border-color)",
      }}
    >
      {isEditable ? (
        <input
          value={prefix}
          onChange={(e) => onChange?.({ text, prefix: e.target.value, color })}
          style={{
            flexShrink: 0,
            width: 50,
            fontWeight: 700,
            fontSize: "0.85rem",
            textAlign: "center",
            color,
            background: "transparent",
            border: "none",
            borderBottom: "1px solid " + color,
            outline: "none",
          }}
          placeholder="📌"
        />
      ) : prefix ? (
        <span
          style={{ flexShrink: 0, fontWeight: 700, color, fontSize: "0.95rem" }}
        >
          {prefix}
        </span>
      ) : null}
      {isEditable ? (
        <textarea
          value={text}
          rows={2}
          onChange={(e) => onChange?.({ text: e.target.value, prefix, color })}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: "0.85rem",
            color: "var(--text-main)",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "var(--text-main)",
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          {text}
        </p>
      )}
      {isEditable && (
        <input
          type="color"
          value={color}
          onChange={(e) => onChange?.({ text, prefix, color: e.target.value })}
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            padding: 0,
          }}
          title="Accent color"
        />
      )}
    </div>
  );
}
