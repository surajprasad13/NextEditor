"use client";

import React, { useState, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical,
  Edit,
  Copy,
  Code,
  Layers,
  X,
  Rocket,
  Package,
  SeparatorHorizontal,
  Megaphone,
  MousePointerClick,
  Code2,
  Image,
  LayoutList,
  MessageSquare,
  BarChart3,
  Navigation,
  PanelBottom,
  Columns2,
  CreditCard,
  AlignLeft,
  Braces,
  Lightbulb,
  Rows3,
  Zap,
  Box,
  BookOpen,
  Pencil,
} from "lucide-react";
import { Accordion } from "../render/Accordion";
import { Card } from "../render/Card";
import { ImageBlock } from "../render/ImageBlock";
import { TestimonialRow } from "../render/TestimonialRow";
import { HeroBlock } from "../render/HeroBlock";
import { CalloutBlock } from "../render/CalloutBlock";
import { StatsBlock } from "../render/StatsBlock";
import { CodeBlock } from "../render/CodeBlock";
import { ButtonBlock } from "../render/ButtonBlock";
import { DividerBlock } from "../render/DividerBlock";
import { NavBlock } from "../render/NavBlock";
import { FooterBlock } from "../render/FooterBlock";
import { ColumnsBlock } from "../render/ColumnsBlock";
import { PricingBlock } from "../render/PricingBlock";
import { TextBlock } from "../render/TextBlock";
import { EmbedBlock } from "../render/EmbedBlock";
import { AdmonitionBlock } from "../render/AdmonitionBlock";
import { TabsBlock } from "../render/TabsBlock";
import { StepBlock } from "../render/StepBlock";
import { HighlightBlock } from "../render/HighlightBlock";
import { ContainerBlock } from "../render/ContainerBlock";

interface DraggableBlockProps {
  id: string;
  type: string;
  props: any;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onUpdateProps: (newProps: any) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isPreviewMode?: boolean;
}

const mkI = (C: React.ElementType) =>
  React.createElement(C, { size: 14, strokeWidth: 1.8 });

const BLOCK_META: Record<string, { icon: React.ReactNode; color: string }> = {
  HeroBlock: { icon: mkI(Rocket), color: "#2563eb" },
  Card: { icon: mkI(Package), color: "#0ea5e9" },
  DividerBlock: { icon: mkI(SeparatorHorizontal), color: "#94a3b8" },
  CalloutBlock: { icon: mkI(Megaphone), color: "#f59e0b" },
  ButtonBlock: { icon: mkI(MousePointerClick), color: "#10b981" },
  CodeBlock: { icon: mkI(Code2), color: "#7c3aed" },
  ImageBlock: { icon: mkI(Image), color: "#ec4899" },
  Accordion: { icon: mkI(LayoutList), color: "#06b6d4" },
  TestimonialRow: { icon: mkI(MessageSquare), color: "#84cc16" },
  StatsBlock: { icon: mkI(BarChart3), color: "#f97316" },
  NavBlock: { icon: mkI(Navigation), color: "#0ea5e9" },
  FooterBlock: { icon: mkI(PanelBottom), color: "#475569" },
  ColumnsBlock: { icon: mkI(Columns2), color: "#7c3aed" },
  PricingBlock: { icon: mkI(CreditCard), color: "#10b981" },
  TextBlock: { icon: mkI(AlignLeft), color: "#2563eb" },
  EmbedBlock: { icon: mkI(Braces), color: "#f43f5e" },
  AdmonitionBlock: { icon: mkI(Lightbulb), color: "#10b981" },
  TabsBlock: { icon: mkI(BookOpen), color: "#0ea5e9" },
  StepBlock: { icon: mkI(Rows3), color: "#7c3aed" },
  HighlightBlock: { icon: mkI(Zap), color: "#f59e0b" },
  ContainerBlock: { icon: mkI(Box), color: "#64748b" },
};

const parseSpacing = (val: any) => {
  if (val === undefined || val === "") return undefined;
  if (/^\d+$/.test(val.toString().trim())) return `${val}px`;
  return val;
};

export function DraggableBlock({
  id,
  type,
  props,
  index,
  total,
  isSelected,
  onSelect,
  onMove,
  onDelete,
  onDuplicate,
  onUpdateProps,
  onDragStart,
  onDragOver,
  onDrop,
  isPreviewMode = false,
}: DraggableBlockProps) {
  const [viewMode, setViewMode] = useState<"preview" | "edit" | "json">(
    "preview",
  );
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const meta = BLOCK_META[type] || { icon: mkI(Box), color: "#2563eb" };

  // ── JSON editor ─────────────────────────────────────────────────────────────
  const openJsonEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJsonText(JSON.stringify(props, null, 2));
    setJsonError(null);
    setViewMode("json");
  };

  const handleJsonSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onUpdateProps(parsed);
      setViewMode("preview");
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON format");
    }
  };

  // ── Edit toggle ─────────────────────────────────────────────────────────────
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode(viewMode === "edit" ? "preview" : "edit");
    onSelect();
  };

  // ── Drag-over highlight ──────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e, index);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, index);
  };

  // ── Component renderer ──────────────────────────────────────────────────────
  const renderComponent = (editable: boolean) => {
    const commonProps = {
      ...props,
      isEditable: editable,
      onChange: (p: any) => {
        onUpdateProps(p);
        // Don't auto-close edit mode for Card/Accordion (they have inline panels)
        if (
          !["Card", "Accordion", "StatsBlock", "TestimonialRow"].includes(type)
        ) {
          setViewMode("preview");
        }
      },
    };

    switch (type) {
      case "HeroBlock":
        return <HeroBlock {...commonProps} />;
      case "Card":
        return <Card {...commonProps} />;
      case "ImageBlock":
        return <ImageBlock {...commonProps} />;
      case "TestimonialRow":
        return <TestimonialRow {...commonProps} />;
      case "Accordion":
        return <Accordion {...commonProps} />;
      case "CalloutBlock":
        return <CalloutBlock {...commonProps} />;
      case "StatsBlock":
        return <StatsBlock {...commonProps} />;
      case "CodeBlock":
        return <CodeBlock {...commonProps} />;
      case "ButtonBlock":
        return <ButtonBlock {...commonProps} />;
      case "DividerBlock":
        return <DividerBlock {...commonProps} />;
      case "NavBlock":
        return <NavBlock {...commonProps} />;
      case "FooterBlock":
        return <FooterBlock {...commonProps} />;
      case "ColumnsBlock":
        return <ColumnsBlock {...commonProps} />;
      case "PricingBlock":
        return <PricingBlock {...commonProps} />;
      case "TextBlock":
        return <TextBlock {...commonProps} />;
      case "EmbedBlock":
        return <EmbedBlock {...commonProps} isEditable={editable} />;
      case "AdmonitionBlock":
        return <AdmonitionBlock {...commonProps} />;
      case "TabsBlock":
        return <TabsBlock {...commonProps} />;
      case "StepBlock":
        return <StepBlock {...commonProps} />;
      case "HighlightBlock":
        return <HighlightBlock {...commonProps} />;
      case "ContainerBlock":
        return <ContainerBlock {...commonProps} />;
      default:
        return (
          <div className="unknown-block-type">
            Unknown block type: <code>{type}</code>
          </div>
        );
    }
  };

  const styleSettings = props?.customStyles || {};

  const compileContainerStyle = (): React.CSSProperties => {
    const styleObj: React.CSSProperties = {};
    if (styleSettings.bgColor) styleObj.backgroundColor = styleSettings.bgColor;
    if (styleSettings.textColor) styleObj.color = styleSettings.textColor;
    if (styleSettings.contentAlign)
      styleObj.textAlign = styleSettings.contentAlign;

    if (
      styleSettings.paddingTop !== undefined &&
      styleSettings.paddingTop !== ""
    )
      styleObj.paddingTop = parseSpacing(styleSettings.paddingTop);
    if (
      styleSettings.paddingBottom !== undefined &&
      styleSettings.paddingBottom !== ""
    )
      styleObj.paddingBottom = parseSpacing(styleSettings.paddingBottom);
    if (
      styleSettings.paddingLeft !== undefined &&
      styleSettings.paddingLeft !== ""
    )
      styleObj.paddingLeft = parseSpacing(styleSettings.paddingLeft);
    if (
      styleSettings.paddingRight !== undefined &&
      styleSettings.paddingRight !== ""
    )
      styleObj.paddingRight = parseSpacing(styleSettings.paddingRight);

    if (styleSettings.marginTop !== undefined && styleSettings.marginTop !== "")
      styleObj.marginTop = parseSpacing(styleSettings.marginTop);
    if (
      styleSettings.marginBottom !== undefined &&
      styleSettings.marginBottom !== ""
    )
      styleObj.marginBottom = parseSpacing(styleSettings.marginBottom);
    if (
      styleSettings.marginLeft !== undefined &&
      styleSettings.marginLeft !== ""
    )
      styleObj.marginLeft = parseSpacing(styleSettings.marginLeft);
    if (
      styleSettings.marginRight !== undefined &&
      styleSettings.marginRight !== ""
    )
      styleObj.marginRight = parseSpacing(styleSettings.marginRight);

    if (styleSettings.borderRadius !== undefined && styleSettings.borderRadius !== "")
      styleObj.borderRadius = parseSpacing(styleSettings.borderRadius);
    if (styleSettings.borderWidth !== undefined && styleSettings.borderWidth !== "") {
      styleObj.borderWidth = parseSpacing(styleSettings.borderWidth);
      styleObj.borderStyle = (styleSettings.borderStyle || "solid") as any;
      if (styleSettings.borderColor) styleObj.borderColor = styleSettings.borderColor;
    } else if (styleSettings.borderColor) {
      styleObj.borderStyle = (styleSettings.borderStyle || "solid") as any;
      styleObj.borderColor = styleSettings.borderColor;
    }
    if (styleSettings.opacity !== undefined && styleSettings.opacity !== "")
      styleObj.opacity = parseFloat(styleSettings.opacity);
    if (styleSettings.lineHeight !== undefined && styleSettings.lineHeight !== "")
      styleObj.lineHeight = parseFloat(styleSettings.lineHeight);
    if (styleSettings.textTransform)
      styleObj.textTransform = styleSettings.textTransform as any;
    if (styleSettings.overflow)
      styleObj.overflow = styleSettings.overflow as any;

    if (styleSettings.boxShadow === "sm") {
      styleObj.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    } else if (styleSettings.boxShadow === "md") {
      styleObj.boxShadow =
        "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)";
    } else if (styleSettings.boxShadow === "lg") {
      styleObj.boxShadow =
        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)";
    }

    if (styleSettings.fontFamily) {
      if (styleSettings.fontFamily === "sans")
        styleObj.fontFamily = "var(--font-sans, inherit)";
      else if (styleSettings.fontFamily === "serif")
        styleObj.fontFamily = 'var(--font-serif, "Playfair Display", serif)';
      else if (styleSettings.fontFamily === "mono")
        styleObj.fontFamily = "var(--font-mono, monospace)";
      else if (styleSettings.fontFamily === "system")
        styleObj.fontFamily = "system-ui, -apple-system, sans-serif";
    }
    if (styleSettings.fontSize !== undefined && styleSettings.fontSize !== "")
      styleObj.fontSize = parseSpacing(styleSettings.fontSize);
    if (styleSettings.fontWeight)
      styleObj.fontWeight = styleSettings.fontWeight;
    if (
      styleSettings.letterSpacing !== undefined &&
      styleSettings.letterSpacing !== ""
    )
      styleObj.letterSpacing = parseSpacing(styleSettings.letterSpacing);

    if (styleSettings.bgGradient) {
      styleObj.backgroundImage = `linear-gradient(${styleSettings.bgGradient})`;
    }
    if (styleSettings.bgImage) {
      const overlay =
        styleSettings.bgOverlay !== undefined && styleSettings.bgOverlay !== ""
          ? parseFloat(styleSettings.bgOverlay)
          : 0;
      if (overlay > 0) {
        styleObj.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url(${styleSettings.bgImage})`;
      } else {
        styleObj.backgroundImage = `url(${styleSettings.bgImage})`;
      }
      styleObj.backgroundSize = "cover";
      styleObj.backgroundPosition = "center";
      styleObj.backgroundRepeat = "no-repeat";
    }

    if (styleSettings.maxWidth === "wide") {
      styleObj.maxWidth = "1200px";
      styleObj.marginLeft = "auto";
      styleObj.marginRight = "auto";
    } else if (styleSettings.maxWidth === "narrow") {
      styleObj.maxWidth = "600px";
      styleObj.marginLeft = "auto";
      styleObj.marginRight = "auto";
    } else if (
      styleSettings.maxWidth === "custom" &&
      styleSettings.customMaxWidth !== undefined &&
      styleSettings.customMaxWidth !== ""
    ) {
      styleObj.maxWidth = `${styleSettings.customMaxWidth}px`;
      styleObj.marginLeft = "auto";
      styleObj.marginRight = "auto";
    }

    return styleObj;
  };

  const hasCustomStyles =
    styleSettings.customCss ||
    (styleSettings.hoverEffect && styleSettings.hoverEffect !== "none");
  const customCssBlock = hasCustomStyles ? (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        #canvas-node-inner-${id} {
          ${
            styleSettings.hoverEffect && styleSettings.hoverEffect !== "none"
              ? `transition: all ${
                  styleSettings.transitionSpeed || "0.3s"
                } ease-in-out;`
              : ""
          }
          ${styleSettings.customCss || ""}
        }
        ${
          styleSettings.hoverEffect === "scale"
            ? `#canvas-node-inner-${id}:hover { transform: scale(1.03); }`
            : ""
        }
        ${
          styleSettings.hoverEffect === "float"
            ? `#canvas-node-inner-${id}:hover { transform: translateY(-6px); }`
            : ""
        }
        ${
          styleSettings.hoverEffect === "shadow"
            ? `#canvas-node-inner-${id}:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important; }`
            : ""
        }
        ${
          styleSettings.hoverEffect === "border-glow"
            ? `#canvas-node-inner-${id}:hover { border-color: var(--accent, #6366f1) !important; box-shadow: 0 0 12px rgba(99, 102, 241, 0.4) !important; }`
            : ""
        }
      `,
      }}
    />
  ) : null;

  return (
    <div
      ref={blockRef}
      className={
        isPreviewMode
          ? `block-style-wrapper-preview ${styleSettings.customClass || ""}`
          : [
              "editor-block-wrapper",
              isSelected ? "selected" : "",
              isDragOver ? "drag-target" : "",
              viewMode === "edit" ? "in-edit-mode" : "",
            ]
              .filter(Boolean)
              .join(" ")
      }
      onClick={
        isPreviewMode
          ? undefined
          : (e) => {
              e.stopPropagation();
              onSelect();
            }
      }
      draggable={!isPreviewMode && viewMode !== "edit"}
      onDragStart={isPreviewMode ? undefined : (e) => onDragStart(e, index)}
      onDragOver={isPreviewMode ? undefined : handleDragOver}
      onDragLeave={isPreviewMode ? undefined : handleDragLeave}
      onDrop={isPreviewMode ? undefined : handleDrop}
      data-block-type={type}
    >
      {/* ── Block toolbar ──────────────────────────────────────────────── */}
      {!isPreviewMode && (
        <div className="block-toolbar">
          <div className="block-drag-grip" title="Drag to reorder">
            <GripVertical size={13} />
            <span
              className="block-type-badge"
              style={{ "--badge-color": meta.color } as React.CSSProperties}
            >
              {meta.icon} {type}
            </span>
          </div>

          <div className="block-toolbar-actions">
            {/* Move up */}
            <button
              type="button"
              className="block-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (index > 0) onMove(index, index - 1);
              }}
              disabled={index === 0}
              title="Move Up"
            >
              <ArrowUp size={12} />
            </button>

            {/* Move down */}
            <button
              type="button"
              className="block-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (index < total - 1) onMove(index, index + 1);
              }}
              disabled={index === total - 1}
              title="Move Down"
            >
              <ArrowDown size={12} />
            </button>

            {/* Duplicate */}
            {onDuplicate && (
              <button
                type="button"
                className="block-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                title="Duplicate Block"
              >
                <Copy size={12} />
              </button>
            )}

            {/* Separator */}
            <div className="block-toolbar-sep" />

            {/* Edit / Preview toggle */}
            <button
              type="button"
              className={`block-action-btn ${
                viewMode === "edit" ? "active" : ""
              }`}
              onClick={handleEditClick}
              title={viewMode === "edit" ? "Close Editor" : "Inline Edit"}
            >
              {viewMode === "edit" ? <X size={12} /> : <Edit size={12} />}
            </button>

            {/* JSON editor */}
            <button
              type="button"
              className={`block-action-btn ${
                viewMode === "json" ? "active" : ""
              }`}
              onClick={
                viewMode === "json"
                  ? (e) => {
                      e.stopPropagation();
                      setViewMode("preview");
                    }
                  : openJsonEditor
              }
              title="Raw JSON Props"
            >
              <Code size={12} />
            </button>

            {/* Delete */}
            <button
              type="button"
              className="block-action-btn block-action-btn--danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete Block"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ── Edit mode indicator banner ──────────────────────────────────── */}
      {viewMode === "edit" && !isPreviewMode && (
        <div className="block-edit-banner">
          <Layers size={11} />
          <span>Inline editing active — changes apply instantly</span>
          <button
            type="button"
            className="block-edit-banner-close"
            onClick={() => setViewMode("preview")}
          >
            Done <X size={10} />
          </button>
        </div>
      )}

      {/* ── Block content ─────────────────────────────────────────────── */}
      <div className={isPreviewMode ? "" : "block-inner-content"}>
        {viewMode === "json" && !isPreviewMode ? (
          <div
            className="block-json-editor"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="json-editor-header">
              <span>
                {meta.icon} <strong>{type}</strong> — Raw JSON Props
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={handleJsonSave}
                  className="json-save-btn"
                >
                  ✓ Apply
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className="json-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
            <textarea
              className="json-textarea"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={12}
              spellCheck={false}
            />
            {jsonError && <div className="json-error-msg">⚠️ {jsonError}</div>}
          </div>
        ) : (
          <div
            id={`canvas-node-inner-${id}`}
            className={
              isPreviewMode
                ? styleSettings.customClass || ""
                : `block-style-wrapper ${styleSettings.customClass || ""}`
            }
            style={compileContainerStyle()}
          >
            {customCssBlock}
            {renderComponent(viewMode === "edit" && !isPreviewMode)}
          </div>
        )}
      </div>
    </div>
  );
}
