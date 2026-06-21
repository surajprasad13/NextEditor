"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { parseInlineMarkdown } from "@/lib/parser";

interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  isEditable?: boolean;
  onChange?: (props: { src: string; alt: string; caption?: string }) => void;
}

export function ImageBlock({
  src,
  alt,
  caption,
  isEditable = false,
  onChange,
}: ImageBlockProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleFieldChange = (
    field: "src" | "alt" | "caption",
    value: string,
  ) => {
    if (!onChange) return;
    onChange({
      src: field === "src" ? value : src,
      alt: field === "alt" ? value : alt,
      caption: field === "caption" ? value : caption,
    });
  };

  return (
    <div className="custom-image-block">
      {isEditable ? (
        <div className="image-block-editable-wrapper">
          {src ? (
            <img src={src} alt={alt} className="image-block-img" />
          ) : (
            <div className="image-block-placeholder">
              <ImageIcon size={32} />
              <span>No image source specified</span>
            </div>
          )}
          <button
            type="button"
            className="image-block-change-btn"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            Edit Image & Alt Info
          </button>

          {showPrompt && (
            <div className="image-block-prompt">
              <div className="prompt-field">
                <label>Image Source URL</label>
                <input
                  type="text"
                  placeholder="Paste URL"
                  value={src}
                  onChange={(e) => handleFieldChange("src", e.target.value)}
                />
              </div>
              <div className="prompt-field">
                <label>Alt Text (Accessibility)</label>
                <input
                  type="text"
                  placeholder="Alt text"
                  value={alt}
                  onChange={(e) => handleFieldChange("alt", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="image-block-prompt-close"
              >
                Close
              </button>
            </div>
          )}
        </div>
      ) : (
        src && <img src={src} alt={alt} className="image-block-img" />
      )}

      {isEditable ? (
        <input
          type="text"
          value={caption || ""}
          onChange={(e) => handleFieldChange("caption", e.target.value)}
          className="image-block-caption-input"
          placeholder="Add an optional caption..."
        />
      ) : (
        caption && (
          <figcaption className="image-block-caption">
            {parseInlineMarkdown(caption)}
          </figcaption>
        )
      )}
    </div>
  );
}
