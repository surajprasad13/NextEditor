'use client';

import React, { useState } from 'react';

type DividerStyle = 'solid' | 'dashed' | 'dotted' | 'gradient' | 'ornamental';
type DividerWeight = 'thin' | 'normal' | 'thick';

interface DividerBlockProps {
  style?: DividerStyle;
  weight?: DividerWeight;
  text?: string;
  spacing?: 'sm' | 'md' | 'lg';
  isEditable?: boolean;
  onChange?: (props: any) => void;
}

export function DividerBlock({
  style = 'gradient',
  weight = 'normal',
  text = '',
  spacing = 'md',
  isEditable = false,
  onChange,
}: DividerBlockProps) {
  const [localStyle, setLocalStyle] = useState<DividerStyle>(style);
  const [localWeight, setLocalWeight] = useState<DividerWeight>(weight);
  const [localText, setLocalText] = useState(text);
  const [localSpacing, setLocalSpacing] = useState<'sm' | 'md' | 'lg'>(spacing);

  if (isEditable) {
    return (
      <div className="block-editor-form">
        <div className="block-editor-form-title">Divider Block Settings</div>
        <div className="editor-form-field">
          <label>Divider Style</label>
          <div className="divider-style-picker">
            {(['solid', 'dashed', 'dotted', 'gradient', 'ornamental'] as DividerStyle[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`divider-style-btn ${localStyle === s ? 'active' : ''}`}
                onClick={() => setLocalStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Thickness</label>
            <select
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value as DividerWeight)}
              className="editor-form-select"
            >
              {['thin', 'normal', 'thick'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div className="editor-form-field">
            <label>Spacing</label>
            <select
              value={localSpacing}
              onChange={(e) => setLocalSpacing(e.target.value as 'sm' | 'md' | 'lg')}
              className="editor-form-select"
            >
              {['sm', 'md', 'lg'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="editor-form-field">
          <label>Center Label Text (optional)</label>
          <input
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            className="editor-form-input"
            placeholder="◆ or Section Break"
          />
        </div>
        <button
          type="button"
          className="block-form-apply-btn"
          onClick={() =>
            onChange?.({
              style: localStyle,
              weight: localWeight,
              text: localText,
              spacing: localSpacing,
            })
          }
        >
          ✓ Apply Changes
        </button>
      </div>
    );
  }

  const displayText = text;
  const weightMap = { thin: '1px', normal: '2px', thick: '4px' };
  const spacingMap = { sm: '16px', md: '28px', lg: '48px' };
  const lineHeight = weightMap[weight] || '2px';
  const verticalSpacing = spacingMap[spacing] || '28px';

  if (displayText) {
    return (
      <div
        className={`divider-block divider-block--${style} divider-block--${spacing}`}
        style={{ '--div-space': verticalSpacing } as any}
      >
        <div className="divider-line" style={{ height: lineHeight }} />
        <span className="divider-text">{displayText}</span>
        <div className="divider-line" style={{ height: lineHeight }} />
      </div>
    );
  }

  return (
    <div
      className={`divider-block divider-block--simple divider-block--${style} divider-block--${spacing}`}
      style={{ '--div-space': verticalSpacing } as any}
    >
      <div className="divider-line" style={{ height: lineHeight }} />
    </div>
  );
}
