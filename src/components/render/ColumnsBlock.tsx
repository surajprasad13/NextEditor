'use client';

import React from 'react';
import { MarkdownTextRenderer } from './MarkdownTextRenderer';

export interface ColumnItem {
  type: 'markdown' | 'image' | 'custom';
  content?: string;
  src?: string;
  alt?: string;
  iconEmoji?: string;
  title?: string;
  btnLabel?: string;
  btnUrl?: string;
  btnVariant?: 'primary' | 'secondary' | 'outline';
  
  // Custom column styles
  bgColor?: string;
  textColor?: string;
  padding?: string | number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
}

interface ColumnsBlockProps {
  layout: '1' | '1-1' | '1-1-1' | '1-1-1-1' | '1-2' | '2-1';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'top' | 'center' | 'bottom' | 'stretch';
  columns: ColumnItem[];
  isEditable?: boolean;
  onChange?: (props: {
    layout: '1' | '1-1' | '1-1-1' | '1-1-1-1' | '1-2' | '2-1';
    gap?: 'sm' | 'md' | 'lg' | 'xl';
    align?: 'top' | 'center' | 'bottom' | 'stretch';
    columns: ColumnItem[];
  }) => void;
}

export function ColumnsBlock({
  layout = '1-1',
  gap = 'md',
  align = 'stretch',
  columns = [],
  isEditable = false,
  onChange,
}: ColumnsBlockProps) {
  const updateColumn = (index: number, patch: Partial<ColumnItem>) => {
    if (!onChange) return;
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], ...patch };
    onChange({ layout, gap, align, columns: newCols });
  };

  const getColFlexBasis = (index: number) => {
    if (layout === '1') return '100%';
    if (layout === '1-1-1') return '33.333%';
    if (layout === '1-1-1-1') return '25%';
    if (layout === '1-2') return index === 0 ? '33.333%' : '66.666%';
    if (layout === '2-1') return index === 0 ? '66.666%' : '33.333%';
    return '50%'; // 1-1 layout default
  };

  return (
    <div
      className={`builder-columns-row gap-${gap} align-${align} layout-${layout} ${isEditable ? 'columns-editable' : ''}`}
      style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}
    >
      {columns.map((col, idx) => {
        const basis = getColFlexBasis(idx);
        
        // Compile column-level styling
        const colStyle: React.CSSProperties = {
          flex: `1 1 ${basis}`,
          maxWidth: layout === '1' ? '100%' : basis,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        };
        
        if (col.bgColor) colStyle.backgroundColor = col.bgColor;
        if (col.textColor) colStyle.color = col.textColor;
        
        if (col.padding !== undefined && col.padding !== '') {
          colStyle.padding = typeof col.padding === 'number' ? `${col.padding}px` : col.padding;
        } else {
          // Default column padding to prevent content from touching when styled with background
          if (col.bgColor || col.boxShadow || col.borderWidth) {
            colStyle.padding = '20px';
          }
        }
        
        if (col.borderRadius !== undefined) colStyle.borderRadius = `${col.borderRadius}px`;
        if (col.borderWidth !== undefined) {
          colStyle.borderWidth = `${col.borderWidth}px`;
          colStyle.borderStyle = 'solid';
          colStyle.borderColor = col.borderColor || 'var(--border-color)';
        }
        
        if (col.boxShadow === 'sm') colStyle.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        else if (col.boxShadow === 'md') colStyle.boxShadow = '0 4px 6px rgba(0,0,0,0.08)';
        else if (col.boxShadow === 'lg') colStyle.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';

        return (
          <div
            key={idx}
            className="builder-column-item"
            style={colStyle}
          >
            {col.type === 'custom' ? (
              <div className="col-custom-rich-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', width: '100%' }}>
                {col.iconEmoji && (
                  <div className="col-icon-badge" style={{ fontSize: '2rem', lineHeight: '1.2' }}>
                    {col.iconEmoji}
                  </div>
                )}
                {col.src && (
                  <div className="col-image-wrap" style={{ overflow: 'hidden', borderRadius: '6px', width: '100%' }}>
                    <img src={col.src} alt={col.alt || ''} className="col-image" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
                {col.title && (
                  <h4 className="col-heading" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'inherit', lineHeight: '1.3' }}>
                    {col.title}
                  </h4>
                )}
                {col.content && (
                  <div className="col-markdown-wrap" style={{ flex: 1, fontSize: '0.92rem', opacity: 0.95 }}>
                    <MarkdownTextRenderer content={col.content} isEditable={false} />
                  </div>
                )}
                {col.btnLabel && (
                  <div className="col-btn-wrap" style={{ marginTop: '12px' }}>
                    <a
                      href={col.btnUrl || '#'}
                      className={`btn btn-${col.btnVariant || 'primary'}`}
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        backgroundColor: col.btnVariant === 'secondary' ? 'var(--bg-card-hover)' : col.btnVariant === 'outline' ? 'transparent' : 'var(--accent)',
                        color: col.btnVariant === 'outline' ? 'var(--accent)' : '#ffffff',
                        border: col.btnVariant === 'outline' ? '1px solid var(--accent)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {col.btnLabel}
                    </a>
                  </div>
                )}
              </div>
            ) : col.type === 'image' ? (
              <div className="col-image-wrapper" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {col.src ? (
                  <img src={col.src} alt={col.alt || ''} className="col-image" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
                ) : (
                  <div className="col-image-placeholder" style={{ padding: '30px', background: 'var(--bg-app)', textAlign: 'center', borderRadius: '4px', border: '1px dashed var(--border-color)', color: 'var(--text-sub)' }}>🖼️ No Image Selected</div>
                )}
                {isEditable && (
                  <div className="col-image-input-panel" onClick={(e) => e.stopPropagation()} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input
                      type="text"
                      className="col-input"
                      value={col.src || ''}
                      onChange={(e) => updateColumn(idx, { src: e.target.value })}
                      placeholder="Image URL"
                      style={{ fontSize: '0.75rem', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                    />
                    <input
                      type="text"
                      className="col-input"
                      value={col.alt || ''}
                      onChange={(e) => updateColumn(idx, { alt: e.target.value })}
                      placeholder="Alt Text"
                      style={{ fontSize: '0.75rem', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="col-markdown-wrapper" style={{ width: '100%' }}>
                {isEditable ? (
                  <textarea
                    className="col-inline-textarea"
                    value={col.content || ''}
                    onChange={(e) => updateColumn(idx, { content: e.target.value })}
                    placeholder="Markdown content..."
                    rows={6}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                ) : (
                  <MarkdownTextRenderer content={col.content || ''} isEditable={false} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
