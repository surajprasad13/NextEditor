'use client';

import React from 'react';
import { MarkdownTextRenderer } from './MarkdownTextRenderer';

interface TextBlockProps {
  content: string;
  isEditable?: boolean;
  onChange?: (props: { content: string }) => void;
}

export function TextBlock({ content, isEditable = false, onChange }: TextBlockProps) {
  return (
    <div className={`enhanced-text-block ${isEditable ? 'text-block-editable' : ''}`}>
      {isEditable ? (
        <textarea
          className="text-block-inline-textarea"
          value={content}
          onChange={(e) => onChange && onChange({ content: e.target.value })}
          placeholder="Write your markdown here..."
          rows={6}
        />
      ) : (
        <MarkdownTextRenderer content={content} isEditable={false} />
      )}
    </div>
  );
}
