'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';

interface LinkItem {
  label: string;
  url: string;
}

interface NavBlockProps {
  logoText: string;
  logoUrl?: string;
  links: LinkItem[];
  ctaLabel?: string;
  ctaUrl?: string;
  sticky?: boolean;
  isEditable?: boolean;
  onChange?: (props: {
    logoText: string;
    logoUrl?: string;
    links: LinkItem[];
    ctaLabel?: string;
    ctaUrl?: string;
    sticky?: boolean;
  }) => void;
}

export function NavBlock({
  logoText = 'NextEditor',
  logoUrl = '/',
  links = [],
  ctaLabel,
  ctaUrl,
  sticky = false,
  isEditable = false,
  onChange,
}: NavBlockProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const update = (patch: Partial<NavBlockProps>) => {
    if (!onChange) return;
    onChange({
      logoText,
      logoUrl,
      links,
      ctaLabel,
      ctaUrl,
      sticky,
      ...patch,
    } as any);
  };

  return (
    <header className={`builder-nav-header ${sticky ? 'nav-sticky' : ''} ${isEditable ? 'nav-editable' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          {isEditable ? (
            <input
              type="text"
              value={logoText}
              onChange={(e) => update({ logoText: e.target.value })}
              className="nav-logo-input"
              placeholder="Site Logo text"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <a href={logoUrl} className="nav-logo-link">
              <span>{logoText}</span>
            </a>
          )}
        </div>

        {/* Links */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          {links.map((link, idx) => (
            <span key={idx} className="nav-item-wrap">
              {isEditable ? (
                <div className="nav-item-inline-edit" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[idx] = { ...link, label: e.target.value };
                      update({ links: newLinks });
                    }}
                    className="nav-item-input"
                    placeholder="Link Label"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[idx] = { ...link, url: e.target.value };
                      update({ links: newLinks });
                    }}
                    className="nav-item-input-url"
                    placeholder="URL (#)"
                  />
                </div>
              ) : (
                <a href={link.url} className="nav-link">
                  {link.label}
                </a>
              )}
            </span>
          ))}

          {/* CTA */}
          {(ctaLabel || isEditable) && (
            <div className="nav-cta-wrap" onClick={(e) => e.stopPropagation()}>
              {isEditable ? (
                <div className="nav-cta-inline-edit">
                  <input
                    type="text"
                    value={ctaLabel || ''}
                    onChange={(e) => update({ ctaLabel: e.target.value || undefined })}
                    className="nav-cta-input"
                    placeholder="CTA Button Label"
                  />
                  <input
                    type="text"
                    value={ctaUrl || ''}
                    onChange={(e) => update({ ctaUrl: e.target.value || undefined })}
                    className="nav-cta-input-url"
                    placeholder="CTA URL"
                  />
                </div>
              ) : (
                <a href={ctaUrl || '#'} className="nav-cta-btn">
                  {ctaLabel}
                </a>
              )}
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
