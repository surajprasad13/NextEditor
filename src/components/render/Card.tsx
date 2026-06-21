'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, AlignLeft, AlignRight, AlignJustify, X, Trash2, ExternalLink } from 'lucide-react';
import { parseInlineMarkdown } from '@/lib/parser';

type ImageLayout = 'top' | 'left' | 'right' | 'none';

interface CardProps {
  title: string;
  description: string;
  image?: string;
  imageLayout?: ImageLayout;
  tag?: string;
  linkUrl?: string;
  linkLabel?: string;
  isEditable?: boolean;
  onChange?: (props: {
    title: string;
    description: string;
    image?: string;
    imageLayout?: ImageLayout;
    tag?: string;
    linkUrl?: string;
    linkLabel?: string;
  }) => void;
}

export function Card({
  title,
  description,
  image,
  imageLayout = 'top',
  tag,
  linkUrl,
  linkLabel,
  isEditable = false,
  onChange,
}: CardProps) {
  const [imgInput, setImgInput] = useState(image || '');
  const [showImgPanel, setShowImgPanel] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<CardProps>) => {
    if (!onChange) return;
    onChange({
      title,
      description,
      image,
      imageLayout,
      tag,
      linkUrl,
      linkLabel,
      ...patch,
    } as any);
  };

  const applyImage = () => {
    update({ image: imgInput || undefined });
    setShowImgPanel(false);
  };

  const removeImage = () => {
    setImgInput('');
    update({ image: undefined });
    setShowImgPanel(false);
  };

  // ── Layout helpers ──────────────────────────────────────────────────────────
  const isHorizontal = imageLayout === 'left' || imageLayout === 'right';
  const effectiveLayout = image ? imageLayout : 'none';

  const cardClass = [
    'enhanced-card',
    `card-img-${effectiveLayout}`,
    isEditable ? 'card-editable' : '',
  ].filter(Boolean).join(' ');

  const imgEl = image ? (
    <div className="card-img-wrap">
      <img src={image} alt={title} className="card-img" loading="lazy" />
      {isEditable && (
        <button
          type="button"
          className="card-img-overlay-btn"
          onClick={() => setShowImgPanel(true)}
          title="Change image"
        >
          <ImageIcon size={14} /> Change
        </button>
      )}
    </div>
  ) : null;

  const noImgPlaceholder = isEditable ? (
    <button
      type="button"
      className="card-add-img-btn"
      onClick={() => { setShowImgPanel(true); setTimeout(() => imgInputRef.current?.focus(), 80); }}
    >
      <ImageIcon size={16} />
      <span>Add Image</span>
    </button>
  ) : null;

  return (
    <div className={cardClass}>
      {/* ── Top image ────────────────────────────────────────────────────── */}
      {effectiveLayout === 'top' && (image ? imgEl : noImgPlaceholder)}

      {/* ── Horizontal layout (left/right) ───────────────────────────────── */}
      {isHorizontal && (
        <div className="card-horizontal-inner">
          {effectiveLayout === 'left' && (image ? imgEl : noImgPlaceholder)}
          <div className="card-body-inner">
            <CardBody
              title={title}
              description={description}
              tag={tag}
              linkUrl={linkUrl}
              linkLabel={linkLabel}
              isEditable={isEditable}
              update={update}
            />
          </div>
          {effectiveLayout === 'right' && (image ? imgEl : noImgPlaceholder)}
        </div>
      )}

      {/* ── Vertical layout (top/none) ────────────────────────────────────── */}
      {!isHorizontal && (
        <CardBody
          title={title}
          description={description}
          tag={tag}
          linkUrl={linkUrl}
          linkLabel={linkLabel}
          isEditable={isEditable}
          update={update}
        />
      )}

      {/* ── Image control panel ───────────────────────────────────────────── */}
      {isEditable && (
        <div className="card-editor-controls">
          {/* Image layout picker */}
          <div className="card-layout-row">
            <span className="card-ctrl-label">Image</span>
            {([
              { key: 'none', icon: <X size={11} />, label: 'None' },
              { key: 'top', icon: <AlignJustify size={11} />, label: 'Top' },
              { key: 'left', icon: <AlignLeft size={11} />, label: 'Left' },
              { key: 'right', icon: <AlignRight size={11} />, label: 'Right' },
            ] as { key: ImageLayout; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                className={`card-layout-btn ${imageLayout === key ? 'active' : ''}`}
                onClick={() => update({ imageLayout: key })}
                title={label}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
            <button
              type="button"
              className="card-ctrl-img-url-btn"
              onClick={() => { setShowImgPanel(!showImgPanel); setTimeout(() => imgInputRef.current?.focus(), 80); }}
            >
              <ImageIcon size={11} /> URL
            </button>
          </div>

          {/* Image URL input panel */}
          {showImgPanel && (
            <div className="card-img-panel">
              <div className="card-img-panel-row">
                <input
                  ref={imgInputRef}
                  type="text"
                  value={imgInput}
                  onChange={(e) => setImgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyImage()}
                  placeholder="https://images.unsplash.com/..."
                  className="card-img-url-input"
                />
                <button type="button" className="card-img-apply-btn" onClick={applyImage}>Apply</button>
                {image && (
                  <button type="button" className="card-img-remove-btn" onClick={removeImage} title="Remove image">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              {imgInput && (
                <img
                  src={imgInput}
                  alt="preview"
                  className="card-img-preview-thumb"
                  onError={(e) => (e.currentTarget.style.opacity = '0.3')}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Card body – title, description, tag, link (inline editable)
// ─────────────────────────────────────────────────────────────────────────────
function CardBody({
  title,
  description,
  tag,
  linkUrl,
  linkLabel,
  isEditable,
  update,
}: {
  title: string;
  description: string;
  tag?: string;
  linkUrl?: string;
  linkLabel?: string;
  isEditable: boolean;
  update: (p: any) => void;
}) {
  if (!isEditable) {
    return (
      <div className="card-body">
        {tag && <span className="card-tag">{tag}</span>}
        <h3 className="card-title">{parseInlineMarkdown(title)}</h3>
        <p className="card-desc">{parseInlineMarkdown(description)}</p>
        {linkUrl && (
          <a href={linkUrl} className="card-link" target="_blank" rel="noopener noreferrer">
            {linkLabel || 'Read more'} <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="card-body">
      {/* Tag pill */}
      <div className="card-inline-field">
        <input
          type="text"
          value={tag || ''}
          onChange={(e) => update({ tag: e.target.value || undefined })}
          placeholder="+ Tag"
          className="card-tag-input"
        />
      </div>

      {/* Title – contenteditable for truly inline feel */}
      <div
        contentEditable
        suppressContentEditableWarning
        className="card-title card-title-editable"
        onBlur={(e) => update({ title: e.currentTarget.textContent || '' })}
        data-placeholder="Card Title"
      >
        {title}
      </div>

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => update({ description: e.target.value })}
        className="card-desc card-desc-editable"
        placeholder="Card description — supports **markdown**"
        rows={3}
      />

      {/* Link fields */}
      <div className="card-link-row">
        <input
          type="url"
          value={linkUrl || ''}
          onChange={(e) => update({ linkUrl: e.target.value || undefined })}
          placeholder="Link URL (optional)"
          className="card-link-input"
        />
        <input
          type="text"
          value={linkLabel || ''}
          onChange={(e) => update({ linkLabel: e.target.value || undefined })}
          placeholder="Label"
          className="card-link-label-input"
        />
      </div>
    </div>
  );
}
