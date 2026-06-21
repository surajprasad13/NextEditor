"use client";
import React from "react";

interface Step {
  title: string;
  content: string;
}

interface StepBlockProps {
  steps?: Step[];
  variant?: "number" | "bullet";
  isEditable?: boolean;
  onChange?: (p: any) => void;
}

export function StepBlock({ steps = [], variant = "number", isEditable, onChange }: StepBlockProps) {
  const safeSteps = steps.length ? steps : [{ title: "Step 1", content: "Describe what to do." }];

  const update = (i: number, field: "title" | "content", val: string) => {
    onChange?.({ steps: safeSteps.map((s, si) => si === i ? { ...s, [field]: val } : s), variant });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {safeSteps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
          {/* Connector line */}
          {i < safeSteps.length - 1 && (
            <div style={{ position: "absolute", left: 15, top: 32, width: 2, height: "calc(100% - 8px)", background: "var(--border-color)", zIndex: 0 }} />
          )}
          {/* Step badge */}
          <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, zIndex: 1, marginTop: 2 }}>
            {variant === "bullet" ? "•" : i + 1}
          </div>
          <div style={{ flex: 1, paddingBottom: 20 }}>
            {isEditable ? (
              <>
                <input value={step.title} onChange={e => update(i, "title", e.target.value)}
                  style={{ display: "block", width: "100%", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)", background: "transparent", border: "none", borderBottom: "1px solid var(--border-color)", outline: "none", marginBottom: 6, padding: "2px 0" }} />
                <textarea value={step.content} rows={2} onChange={e => update(i, "content", e.target.value)}
                  style={{ width: "100%", fontSize: "0.83rem", color: "var(--text-sub)", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 4, padding: "5px 8px", resize: "vertical", boxSizing: "border-box" }} />
                <button type="button" onClick={() => onChange?.({ steps: safeSteps.filter((_, si) => si !== i), variant })}
                  style={{ fontSize: "0.7rem", color: "var(--danger, #ef4444)", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>− Remove</button>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>{step.title}</p>
                <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-sub)", lineHeight: 1.6 }}>{step.content}</p>
              </>
            )}
          </div>
        </div>
      ))}
      {isEditable && (
        <button type="button" onClick={() => onChange?.({ steps: [...safeSteps, { title: `Step ${safeSteps.length + 1}`, content: "" }], variant })}
          style={{ alignSelf: "flex-start", marginLeft: 44, padding: "4px 12px", fontSize: "0.75rem", background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 6, cursor: "pointer" }}>
          + Add Step
        </button>
      )}
    </div>
  );
}
