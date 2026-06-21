"use client";
import React, { useState } from "react";

interface Tab {
  label: string;
  content: string;
}

interface TabsBlockProps {
  tabs?: Tab[];
  isEditable?: boolean;
  onChange?: (p: any) => void;
}

export function TabsBlock({ tabs = [], isEditable, onChange }: TabsBlockProps) {
  const [active, setActive] = useState(0);
  const safeTabs = tabs.length ? tabs : [{ label: "Tab 1", content: "Content here." }];
  const idx = active < safeTabs.length ? active : 0;

  return (
    <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", background: "var(--bg-input)", overflowX: "auto" }}>
        {safeTabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            style={{
              padding: "9px 18px", fontSize: "0.82rem", fontWeight: i === idx ? 700 : 400,
              background: "none", border: "none", borderBottom: i === idx ? "2px solid var(--accent)" : "2px solid transparent",
              color: i === idx ? "var(--accent)" : "var(--text-sub)", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s"
            }}
          >
            {isEditable ? (
              <input
                value={tab.label}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  const next = safeTabs.map((t, ti) => ti === i ? { ...t, label: e.target.value } : t);
                  onChange?.({ tabs: next });
                }}
                style={{ background: "transparent", border: "none", outline: "none", fontWeight: "inherit", color: "inherit", fontSize: "inherit", width: Math.max(40, tab.label.length * 8) + "px" }}
              />
            ) : tab.label}
          </button>
        ))}
        {isEditable && (
          <button type="button" onClick={() => onChange?.({ tabs: [...safeTabs, { label: "New Tab", content: "" }] })}
            style={{ padding: "9px 12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}>+</button>
        )}
      </div>
      <div style={{ padding: "16px 18px", background: "var(--bg-card)", minHeight: 60 }}>
        {isEditable ? (
          <textarea
            value={safeTabs[idx]?.content || ""}
            rows={4}
            onChange={e => {
              const next = safeTabs.map((t, ti) => ti === idx ? { ...t, content: e.target.value } : t);
              onChange?.({ tabs: next });
            }}
            style={{ width: "100%", background: "transparent", border: "1px solid var(--border-color)", borderRadius: 4, padding: "6px 8px", fontSize: "0.85rem", color: "var(--text-main)", resize: "vertical", boxSizing: "border-box" }}
          />
        ) : (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-sub)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{safeTabs[idx]?.content}</p>
        )}
        {isEditable && safeTabs.length > 1 && (
          <button type="button" onClick={() => { const next = safeTabs.filter((_, ti) => ti !== idx); setActive(Math.max(0, idx - 1)); onChange?.({ tabs: next }); }}
            style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--danger, #ef4444)", background: "none", border: "none", cursor: "pointer" }}>
            — Remove this tab
          </button>
        )}
      </div>
    </div>
  );
}
