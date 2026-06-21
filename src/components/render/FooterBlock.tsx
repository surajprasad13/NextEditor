'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkItem {
  label: string;
  url: string;
}

interface ColumnItem {
  title: string;
  links: LinkItem[];
}

interface SocialItem {
  platform: 'twitter' | 'github' | 'linkedin' | 'facebook' | 'instagram';
  url: string;
}

interface FooterBlockProps {
  logoText: string;
  copyrightText?: string;
  socials?: SocialItem[];
  columns?: ColumnItem[];
  isEditable?: boolean;
  onChange?: (props: {
    logoText: string;
    copyrightText?: string;
    socials?: SocialItem[];
    columns?: ColumnItem[];
  }) => void;
}

export function FooterBlock({
  logoText = 'NextEditor',
  copyrightText = '© 2026 NextEditor. All rights reserved.',
  socials = [],
  columns = [],
  isEditable = false,
  onChange,
}: FooterBlockProps) {
  const update = (patch: Partial<FooterBlockProps>) => {
    if (!onChange) return;
    onChange({
      logoText,
      copyrightText,
      socials,
      columns,
      ...patch,
    } as any);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          </svg>
        );
      case 'github':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      default:
        return <ExternalLink size={14} />;
    }
  };

  return (
    <footer className={`builder-footer ${isEditable ? 'footer-editable' : ''}`}>
      <div className="footer-container">
        {/* Left Column: Logo & Socials */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            {isEditable ? (
              <input
                type="text"
                value={logoText}
                onChange={(e) => update({ logoText: e.target.value })}
                className="footer-logo-input"
                placeholder="Logo text"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{logoText}</span>
            )}
          </div>
          <p className="footer-copyright-text">{copyrightText}</p>
          <div className="footer-social-row">
            {socials.map((soc, idx) => (
              <a
                key={idx}
                href={soc.url}
                className="footer-social-link"
                target="_blank"
                rel="noopener noreferrer"
                title={soc.platform}
              >
                {getSocialIcon(soc.platform)}
              </a>
            ))}
          </div>
        </div>

        {/* Dynamic Columns */}
        <div className="footer-links-cols">
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="footer-link-col">
              <h5 className="footer-col-title">
                {isEditable ? (
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => {
                      const newCols = [...columns];
                      newCols[cIdx] = { ...col, title: e.target.value };
                      update({ columns: newCols });
                    }}
                    className="footer-col-title-input"
                    placeholder="Column Title"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  col.title
                )}
              </h5>
              <ul className="footer-col-links-list">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {isEditable ? (
                      <div className="footer-link-inline-edit" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newCols = [...columns];
                            const newLinks = [...col.links];
                            newLinks[lIdx] = { ...link, label: e.target.value };
                            newCols[cIdx] = { ...col, links: newLinks };
                            update({ columns: newCols });
                          }}
                          className="footer-link-input"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const newCols = [...columns];
                            const newLinks = [...col.links];
                            newLinks[lIdx] = { ...link, url: e.target.value };
                            newCols[cIdx] = { ...col, links: newLinks };
                            update({ columns: newCols });
                          }}
                          className="footer-link-input-url"
                          placeholder="URL"
                        />
                      </div>
                    ) : (
                      <a href={link.url} className="footer-link">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
