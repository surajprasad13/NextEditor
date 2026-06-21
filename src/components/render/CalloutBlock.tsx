'use client';

import React, { useState } from 'react';

type CalloutVariant = 'info' | 'success' | 'warning' | 'danger' | 'tip';

interface CalloutBlockProps {
  variant?: CalloutVariant;
  title?: string;
  message?: string;
  isEditable?: boolean;
  onChange?: (props: any) => void;
}

const CALLOUT_ICONS: Record<CalloutVariant, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  danger: '🚨',
  tip: '💡',
};

const CALLOUT_LABELS: Record<CalloutVariant, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  tip: 'Tip',
};

export function CalloutBlock({
  variant = 'info',
  title = '',
  message = 'Your callout message here.',
  isEditable = false,
  onChange,
}: CalloutBlockProps) {
  const [localVariant, setLocalVariant] = useState<CalloutVariant>(variant);
  const [localTitle, setLocalTitle] = useState(title);
  const [localMessage, setLocalMessage] = useState(message);

  if (isEditable) {
    return (
      <div className="block-editor-form">
        <div className="block-editor-form-title">Callout Block Settings</div>
        <div className="editor-form-field">
          <label>Callout Type</label>
          <div className="callout-type-picker">
            {(['info', 'success', 'warning', 'danger', 'tip'] as CalloutVariant[]).map((v) => (
              <button
                key={v}
                type="button"
                className={`callout-type-btn callout-type-btn--${v} ${localVariant === v ? 'active' : ''}`}
                onClick={() => setLocalVariant(v)}
              >
                <span>{CALLOUT_ICONS[v]}</span>
                <span>{CALLOUT_LABELS[v]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="editor-form-field">
          <label>Title (optional)</label>
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="editor-form-input"
            placeholder="Note:"
          />
        </div>
        <div className="editor-form-field">
          <label>Message (supports **bold** and *italic*)</label>
          <textarea
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            className="editor-form-textarea"
            rows={3}
            placeholder="Your callout message here..."
          />
        </div>
        <button
          type="button"
          className="block-form-apply-btn"
          onClick={() => onChange?.({ variant: localVariant, title: localTitle, message: localMessage })}
        >
          ✓ Apply Changes
        </button>
      </div>
    );
  }

  return (
    <div className={`callout-block callout-block--${variant}`}>
      <div className="callout-icon">{CALLOUT_ICONS[variant]}</div>
      <div className="callout-content">
        {title && <div className="callout-title">{title}</div>}
        <div className="callout-message">{message}</div>
      </div>
    </div>
  );
}
