"use client";
import React from "react";

interface AdmonitionBlockProps {
  type?: "tip" | "note" | "warning" | "danger" | "info";
  title?: string;
  content?: string;
  isEditable?: boolean;
  onChange?: (p: any) => void;
}

const VARIANTS = {
  tip: {
    icon: "💡",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "#10b981",
    label: "Tip",
  },
  note: {
    icon: "📌",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "#6366f1",
    label: "Note",
  },
  warning: {
    icon: "⚠️",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "#f59e0b",
    label: "Warning",
  },
  danger: {
    icon: "🚨",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "#ef4444",
    label: "Danger",
  },
  info: {
    icon: "ℹ️",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
    border: "#0ea5e9",
    label: "Info",
  },
};

export function AdmonitionBlock({
  type = "note",
  title,
  content = "",
  isEditable,
  onChange,
}: AdmonitionBlockProps) {
  const v = VARIANTS[type] || VARIANTS.note;
  return (
    <div
      style={{
        borderLeft: `4px solid ${v.border}`,
        background: v.bg,
        borderRadius: "0 8px 8px 0",
        padding: "14px 18px",
        margin: "4px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: content ? "6px" : 0,
        }}
      >
        <span style={{ fontSize: "1rem" }}>{v.icon}</span>
        {isEditable ? (
          <input
            value={title ?? v.label}
            onChange={(e) =>
              onChange?.({ type, title: e.target.value, content })
            }
            style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: v.color,
              background: "transparent",
              border: "none",
              outline: "1px solid " + v.border,
              borderRadius: 4,
              padding: "1px 6px",
              flex: 1,
            }}
          />
        ) : (
          <strong style={{ fontSize: "0.85rem", color: v.color }}>
            {title || v.label}
          </strong>
        )}
      </div>
      {isEditable ? (
        <textarea
          value={content}
          onChange={(e) => onChange?.({ type, title, content: e.target.value })}
          rows={3}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid " + v.border,
            borderRadius: 4,
            padding: "6px 8px",
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
            fontSize: "0.85rem",
            color: "var(--text-sub)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </p>
      )}
    </div>
  );
}
