"use client";
import React from "react";

interface ContainerBlockProps {
  title?: string;
  content?: string;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  isEditable?: boolean;
  onChange?: (p: any) => void;
}

export function ContainerBlock({
  title = "",
  content = "",
  bgColor = "var(--bg-card)",
  borderColor = "var(--border-color)",
  borderRadius = 8,
  padding = 20,
  isEditable,
  onChange,
}: ContainerBlockProps) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding,
        boxSizing: "border-box",
      }}
    >
      {isEditable ? (
        <input
          value={title}
          placeholder="Container title (optional)"
          onChange={(e) =>
            onChange?.({
              title: e.target.value,
              content,
              bgColor,
              borderColor,
              borderRadius,
              padding,
            })
          }
          style={{
            display: "block",
            width: "100%",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-main)",
            background: "transparent",
            border: "none",
            borderBottom: "1px dashed var(--border-color)",
            outline: "none",
            marginBottom: 12,
            padding: "2px 0",
          }}
        />
      ) : title ? (
        <p
          style={{
            margin: "0 0 12px",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-main)",
          }}
        >
          {title}
        </p>
      ) : null}
      {isEditable ? (
        <textarea
          value={content}
          rows={5}
          onChange={(e) =>
            onChange?.({
              title,
              content: e.target.value,
              bgColor,
              borderColor,
              borderRadius,
              padding,
            })
          }
          placeholder="Add markdown content, or use this as a wrapper block..."
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            padding: "8px 10px",
            fontSize: "0.85rem",
            color: "var(--text-main)",
            resize: "vertical",
            boxSizing: "border-box",
            lineHeight: 1.6,
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "0.88rem",
            color: "var(--text-sub)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>
      )}
      {isEditable && (
        <div
          style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}
        >
          <label
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Bg{" "}
            <input
              type="color"
              value={bgColor.startsWith("#") ? bgColor : "#111827"}
              onChange={(e) =>
                onChange?.({
                  title,
                  content,
                  bgColor: e.target.value,
                  borderColor,
                  borderRadius,
                  padding,
                })
              }
              style={{
                width: 22,
                height: 22,
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
              }}
            />
          </label>
          <label
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Border{" "}
            <input
              type="color"
              value={borderColor.startsWith("#") ? borderColor : "#374151"}
              onChange={(e) =>
                onChange?.({
                  title,
                  content,
                  bgColor,
                  borderColor: e.target.value,
                  borderRadius,
                  padding,
                })
              }
              style={{
                width: 22,
                height: 22,
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
              }}
            />
          </label>
          <label
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Radius{" "}
            <input
              type="number"
              value={borderRadius}
              min={0}
              max={32}
              onChange={(e) =>
                onChange?.({
                  title,
                  content,
                  bgColor,
                  borderColor,
                  borderRadius: parseInt(e.target.value) || 0,
                  padding,
                })
              }
              style={{
                width: 40,
                padding: "1px 4px",
                fontSize: "0.72rem",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: 3,
                color: "var(--text-main)",
              }}
            />
          </label>
          <label
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Pad{" "}
            <input
              type="number"
              value={padding}
              min={0}
              max={80}
              onChange={(e) =>
                onChange?.({
                  title,
                  content,
                  bgColor,
                  borderColor,
                  borderRadius,
                  padding: parseInt(e.target.value) || 0,
                })
              }
              style={{
                width: 40,
                padding: "1px 4px",
                fontSize: "0.72rem",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: 3,
                color: "var(--text-main)",
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
