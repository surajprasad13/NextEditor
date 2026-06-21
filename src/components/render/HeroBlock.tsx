"use client";

import React, { useState } from "react";

type HeroVariant = "gradient" | "light" | "dark" | "minimal";

interface HeroBlockProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryText?: string;
  secondaryUrl?: string;
  variant?: HeroVariant;
  isEditable?: boolean;
  onChange?: (newProps: any) => void;
}

export function HeroBlock({
  title = "Build Something Amazing",
  subtitle = "A modern visual editor powered by Markdown and React.",
  badgeText = "✨ New Release",
  ctaText = "Get Started",
  ctaUrl = "#",
  secondaryText = "Learn More",
  secondaryUrl = "#",
  variant = "gradient",
  isEditable = false,
  onChange,
}: HeroBlockProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localSubtitle, setLocalSubtitle] = useState(subtitle);
  const [localBadge, setLocalBadge] = useState(badgeText);
  const [localCtaText, setLocalCtaText] = useState(ctaText);
  const [localCtaUrl, setLocalCtaUrl] = useState(ctaUrl);
  const [localSecText, setLocalSecText] = useState(secondaryText);
  const [localSecUrl, setLocalSecUrl] = useState(secondaryUrl);
  const [localVariant, setLocalVariant] = useState<HeroVariant>(variant);

  const handleApply = () => {
    onChange?.({
      title: localTitle,
      subtitle: localSubtitle,
      badgeText: localBadge,
      ctaText: localCtaText,
      ctaUrl: localCtaUrl,
      secondaryText: localSecText,
      secondaryUrl: localSecUrl,
      variant: localVariant,
    });
  };

  if (isEditable) {
    return (
      <div className="block-editor-form">
        <div className="block-editor-form-title">Hero Banner Settings</div>
        <div className="editor-form-field">
          <label>Style Variant</label>
          <div className="variant-picker">
            {(["gradient", "light", "dark", "minimal"] as HeroVariant[]).map(
              (v) => (
                <button
                  key={v}
                  type="button"
                  className={`variant-pick-btn ${
                    localVariant === v ? "active" : ""
                  }`}
                  onClick={() => setLocalVariant(v)}
                >
                  {v}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="editor-form-field">
          <label>Badge Text</label>
          <input
            value={localBadge}
            onChange={(e) => setLocalBadge(e.target.value)}
            className="editor-form-input"
            placeholder="✨ New Release"
          />
        </div>
        <div className="editor-form-field">
          <label>Hero Title</label>
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="editor-form-input"
            placeholder="Build Something Amazing"
          />
        </div>
        <div className="editor-form-field">
          <label>Subtitle / Description</label>
          <textarea
            value={localSubtitle}
            onChange={(e) => setLocalSubtitle(e.target.value)}
            className="editor-form-textarea"
            rows={2}
            placeholder="A short powerful description..."
          />
        </div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Primary CTA Text</label>
            <input
              value={localCtaText}
              onChange={(e) => setLocalCtaText(e.target.value)}
              className="editor-form-input"
              placeholder="Get Started"
            />
          </div>
          <div className="editor-form-field">
            <label>Primary CTA URL</label>
            <input
              value={localCtaUrl}
              onChange={(e) => setLocalCtaUrl(e.target.value)}
              className="editor-form-input"
              placeholder="/page or https://..."
            />
          </div>
        </div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Secondary CTA Text</label>
            <input
              value={localSecText}
              onChange={(e) => setLocalSecText(e.target.value)}
              className="editor-form-input"
              placeholder="Learn More"
            />
          </div>
          <div className="editor-form-field">
            <label>Secondary CTA URL</label>
            <input
              value={localSecUrl}
              onChange={(e) => setLocalSecUrl(e.target.value)}
              className="editor-form-input"
              placeholder="#"
            />
          </div>
        </div>
        <button
          type="button"
          className="block-form-apply-btn"
          onClick={handleApply}
        >
          ✓ Apply Changes
        </button>
      </div>
    );
  }

  return (
    <div className={`hero-block hero-block--${variant}`}>
      {badgeText && <div className="hero-block-badge">{badgeText}</div>}
      <h1 className="hero-block-title">{title}</h1>
      <p className="hero-block-subtitle">{subtitle}</p>
      <div className="hero-block-ctas">
        {ctaText && (
          <a href={ctaUrl} className="hero-cta-primary">
            {ctaText}
          </a>
        )}
        {secondaryText && (
          <a href={secondaryUrl} className="hero-cta-secondary">
            {secondaryText}
          </a>
        )}
      </div>
    </div>
  );
}
