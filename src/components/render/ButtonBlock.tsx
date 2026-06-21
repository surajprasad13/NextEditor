'use client';

import React, { useState } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonAlign = 'left' | 'center' | 'right' | 'full';

interface ButtonBlockProps {
  label?: string;
  url?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  align?: ButtonAlign;
  icon?: string;
  openNewTab?: boolean;
  isEditable?: boolean;
  onChange?: (props: any) => void;
}

export function ButtonBlock({
  label = 'Click Here',
  url = '#',
  variant = 'primary',
  size = 'md',
  align = 'center',
  icon = '',
  openNewTab = false,
  isEditable = false,
  onChange,
}: ButtonBlockProps) {
  const [localLabel, setLocalLabel] = useState(label);
  const [localUrl, setLocalUrl] = useState(url);
  const [localVariant, setLocalVariant] = useState<ButtonVariant>(variant);
  const [localSize, setLocalSize] = useState<ButtonSize>(size);
  const [localAlign, setLocalAlign] = useState<ButtonAlign>(align);
  const [localIcon, setLocalIcon] = useState(icon);
  const [localNewTab, setLocalNewTab] = useState(openNewTab);

  if (isEditable) {
    return (
      <div className="block-editor-form">
        <div className="block-editor-form-title">Button / CTA Settings</div>
        <div className="editor-form-field">
          <label>Button Label</label>
          <input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            className="editor-form-input"
            placeholder="Click Here"
          />
        </div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Destination URL</label>
            <input
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              className="editor-form-input"
              placeholder="/page or https://..."
            />
          </div>
          <div className="editor-form-field" style={{ maxWidth: '80px' }}>
            <label>Icon / Emoji</label>
            <input
              value={localIcon}
              onChange={(e) => setLocalIcon(e.target.value)}
              className="editor-form-input"
              placeholder="🚀"
              maxLength={4}
            />
          </div>
        </div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Variant</label>
            <select
              value={localVariant}
              onChange={(e) => setLocalVariant(e.target.value as ButtonVariant)}
              className="editor-form-select"
            >
              {['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="editor-form-field">
            <label>Size</label>
            <select
              value={localSize}
              onChange={(e) => setLocalSize(e.target.value as ButtonSize)}
              className="editor-form-select"
            >
              {['sm', 'md', 'lg', 'xl'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="editor-form-field">
            <label>Alignment</label>
            <select
              value={localAlign}
              onChange={(e) => setLocalAlign(e.target.value as ButtonAlign)}
              className="editor-form-select"
            >
              {['left', 'center', 'right', 'full'].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="editor-checkbox-row">
          <input
            type="checkbox"
            checked={localNewTab}
            onChange={(e) => setLocalNewTab(e.target.checked)}
          />
          Open in new tab
        </label>
        <button
          type="button"
          className="block-form-apply-btn"
          onClick={() =>
            onChange?.({
              label: localLabel,
              url: localUrl,
              variant: localVariant,
              size: localSize,
              align: localAlign,
              icon: localIcon,
              openNewTab: localNewTab,
            })
          }
        >
          ✓ Apply Changes
        </button>
      </div>
    );
  }

  return (
    <div className={`button-block button-block--align-${align}`}>
      <a
        href={url}
        className={`btn-block btn-block--${variant} btn-block--${size}`}
        target={openNewTab ? '_blank' : undefined}
        rel={openNewTab ? 'noopener noreferrer' : undefined}
      >
        {icon && <span className="btn-block-icon">{icon}</span>}
        {label}
      </a>
    </div>
  );
}
