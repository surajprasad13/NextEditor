import React from 'react';
import { getPageBySlug } from '@/lib/db';
import { parseMarkdownToNodes } from '@/lib/parser';
import { Accordion } from '@/components/render/Accordion';
import { Card } from '@/components/render/Card';
import { ImageBlock } from '@/components/render/ImageBlock';
import { TestimonialRow } from '@/components/render/TestimonialRow';
import { HeroBlock } from '@/components/render/HeroBlock';
import { CalloutBlock } from '@/components/render/CalloutBlock';
import { StatsBlock } from '@/components/render/StatsBlock';
import { CodeBlock } from '@/components/render/CodeBlock';
import { ButtonBlock } from '@/components/render/ButtonBlock';
import { DividerBlock } from '@/components/render/DividerBlock';
import { NavBlock } from '@/components/render/NavBlock';
import { FooterBlock } from '@/components/render/FooterBlock';
import { ColumnsBlock } from '@/components/render/ColumnsBlock';
import { PricingBlock } from '@/components/render/PricingBlock';
import { TextBlock } from '@/components/render/TextBlock';
import { EmbedBlock } from '@/components/render/EmbedBlock';
import { MarkdownTextRenderer } from '@/components/render/MarkdownTextRenderer';
import { Sparkles, Edit, ArrowRight, Sliders, Database, Layout, Clock, Calendar, Tag, User } from 'lucide-react';
import LinkComponent from 'next/link';

const parseSpacing = (val: any) => {
  if (val === undefined || val === '') return undefined;
  if (/^\d+$/.test(val.toString().trim())) return `${val}px`;
  return val;
};

interface DynamicPageProps {
  params: Promise<{ path?: string[] }>;
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { path } = await params;
  const slug = '/' + (path?.join('/') || '');
  const page = await getPageBySlug(slug);

  if (!page && slug === '/') {
    return {
      title: 'NextEditor - Visual Markdown Blog & Page Builder',
      description: 'Design dynamic visual web layouts in Markdown with real-time drag-and-drop and inline editing.',
      openGraph: { title: 'NextEditor', type: 'website' as const },
    };
  }

  const isPublic = page && page.status !== 'draft';
  if (!isPublic) {
    return { title: 'Page Not Found' };
  }

  const description = page.excerpt || `${page.type === 'blog' ? 'Blog post' : 'Page'}: ${page.title}`;
  return {
    title: `${page.title}${page.type !== 'blog' ? ' — NextEditor' : ''}`,
    description,
    authors: page.author ? [{ name: page.author }] : undefined,
    openGraph: {
      title: page.title,
      description,
      type: page.type === 'blog' ? 'article' as const : 'website' as const,
      images: page.featuredImage ? [{ url: page.featuredImage }] : [],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Unified component renderer
// ─────────────────────────────────────────────────────────────────────────────
function renderNode(node: ReturnType<typeof parseMarkdownToNodes>[0]) {
  if (node.type === 'markdown') {
    return (
      <section 
        key={node.id} 
        className="static-section markdown-section"
        style={{ width: '100%', flex: '0 0 100%', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        <MarkdownTextRenderer content={node.content || ''} isEditable={false} />
      </section>
    );
  }

  const styleSettings = node.props?.customStyles || {};

  const compileContainerStyle = (): React.CSSProperties => {
    const styleObj: React.CSSProperties = {};
    if (styleSettings.bgColor) styleObj.backgroundColor = styleSettings.bgColor;
    if (styleSettings.textColor) styleObj.color = styleSettings.textColor;
    if (styleSettings.contentAlign) styleObj.textAlign = styleSettings.contentAlign;

    if (styleSettings.paddingTop !== undefined && styleSettings.paddingTop !== '') styleObj.paddingTop = parseSpacing(styleSettings.paddingTop);
    if (styleSettings.paddingBottom !== undefined && styleSettings.paddingBottom !== '') styleObj.paddingBottom = parseSpacing(styleSettings.paddingBottom);
    if (styleSettings.paddingLeft !== undefined && styleSettings.paddingLeft !== '') styleObj.paddingLeft = parseSpacing(styleSettings.paddingLeft);
    if (styleSettings.paddingRight !== undefined && styleSettings.paddingRight !== '') styleObj.paddingRight = parseSpacing(styleSettings.paddingRight);

    if (styleSettings.marginTop !== undefined && styleSettings.marginTop !== '') styleObj.marginTop = parseSpacing(styleSettings.marginTop);
    if (styleSettings.marginBottom !== undefined && styleSettings.marginBottom !== '') styleObj.marginBottom = parseSpacing(styleSettings.marginBottom);
    if (styleSettings.marginLeft !== undefined && styleSettings.marginLeft !== '') styleObj.marginLeft = parseSpacing(styleSettings.marginLeft);
    if (styleSettings.marginRight !== undefined && styleSettings.marginRight !== '') styleObj.marginRight = parseSpacing(styleSettings.marginRight);

    if (styleSettings.borderRadius !== undefined && styleSettings.borderRadius !== '') styleObj.borderRadius = parseSpacing(styleSettings.borderRadius);
    if (styleSettings.borderWidth !== undefined && styleSettings.borderWidth !== '') {
      styleObj.borderWidth = parseSpacing(styleSettings.borderWidth);
      styleObj.borderStyle = styleSettings.borderStyle || 'solid';
      if (styleSettings.borderColor) styleObj.borderColor = styleSettings.borderColor;
    }

    if (styleSettings.boxShadow === 'sm') {
      styleObj.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    } else if (styleSettings.boxShadow === 'md') {
      styleObj.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)';
    } else if (styleSettings.boxShadow === 'lg') {
      styleObj.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
    }

    if (styleSettings.fontFamily) {
      if (styleSettings.fontFamily === 'sans') styleObj.fontFamily = 'var(--font-sans, inherit)';
      else if (styleSettings.fontFamily === 'serif') styleObj.fontFamily = 'var(--font-serif, "Playfair Display", serif)';
      else if (styleSettings.fontFamily === 'mono') styleObj.fontFamily = 'var(--font-mono, monospace)';
      else if (styleSettings.fontFamily === 'system') styleObj.fontFamily = 'system-ui, -apple-system, sans-serif';
    }
    if (styleSettings.fontSize !== undefined && styleSettings.fontSize !== '') styleObj.fontSize = parseSpacing(styleSettings.fontSize);
    if (styleSettings.fontWeight) styleObj.fontWeight = styleSettings.fontWeight;
    if (styleSettings.letterSpacing !== undefined && styleSettings.letterSpacing !== '') styleObj.letterSpacing = parseSpacing(styleSettings.letterSpacing);

    if (styleSettings.bgGradient) {
      styleObj.backgroundImage = `linear-gradient(${styleSettings.bgGradient})`;
    }
    if (styleSettings.bgImage) {
      const overlay = styleSettings.bgOverlay !== undefined && styleSettings.bgOverlay !== '' ? parseFloat(styleSettings.bgOverlay) : 0;
      if (overlay > 0) {
        styleObj.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url(${styleSettings.bgImage})`;
      } else {
        styleObj.backgroundImage = `url(${styleSettings.bgImage})`;
      }
      styleObj.backgroundSize = 'cover';
      styleObj.backgroundPosition = 'center';
      styleObj.backgroundRepeat = 'no-repeat';
    }

    if (styleSettings.maxWidth === 'wide') {
      styleObj.maxWidth = '1200px';
      styleObj.marginLeft = 'auto';
      styleObj.marginRight = 'auto';
    } else if (styleSettings.maxWidth === 'narrow') {
      styleObj.maxWidth = '600px';
      styleObj.marginLeft = 'auto';
      styleObj.marginRight = 'auto';
    } else if (styleSettings.maxWidth === 'custom' && styleSettings.customMaxWidth !== undefined && styleSettings.customMaxWidth !== '') {
      styleObj.maxWidth = `${styleSettings.customMaxWidth}px`;
      styleObj.marginLeft = 'auto';
      styleObj.marginRight = 'auto';
    }

    return styleObj;
  };

  const hasCustomStyles = styleSettings.customCss || (styleSettings.hoverEffect && styleSettings.hoverEffect !== 'none');
  const customCssBlock = hasCustomStyles ? (
    <style dangerouslySetInnerHTML={{
      __html: `
        #static-node-inner-${node.id} {
          ${styleSettings.hoverEffect && styleSettings.hoverEffect !== 'none' ? `transition: all ${styleSettings.transitionSpeed || '0.3s'} ease-in-out;` : ''}
          ${styleSettings.customCss || ''}
        }
        ${styleSettings.hoverEffect === 'scale' ? `#static-node-inner-${node.id}:hover { transform: scale(1.03); }` : ''}
        ${styleSettings.hoverEffect === 'float' ? `#static-node-inner-${node.id}:hover { transform: translateY(-6px); }` : ''}
        ${styleSettings.hoverEffect === 'shadow' ? `#static-node-inner-${node.id}:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important; }` : ''}
        ${styleSettings.hoverEffect === 'border-glow' ? `#static-node-inner-${node.id}:hover { border-color: var(--accent, #6366f1) !important; box-shadow: 0 0 12px rgba(99, 102, 241, 0.4) !important; }` : ''}
      `
    }} />
  ) : null;

  const blockWidth = styleSettings.blockWidth || '100';
  const verticalAlign = styleSettings.verticalAlign || 'stretch';
  
  const outerStyle: React.CSSProperties = {
    width: `${blockWidth}%`,
    flex: `0 0 ${blockWidth}%`,
    maxWidth: `${blockWidth}%`,
    boxSizing: 'border-box',
    alignSelf: verticalAlign === 'stretch' ? 'stretch' : verticalAlign,
  };
  if (blockWidth !== '100') {
    outerStyle.padding = '8px';
  }

  return (
    <section key={node.id} className="static-section component-section" style={outerStyle}>
      <div 
        id={`static-node-inner-${node.id}`}
        className={`block-style-wrapper ${styleSettings.customClass || ''}`}
        style={compileContainerStyle()}
      >
        {customCssBlock}
        {node.componentType === 'Accordion' && (
          <Accordion items={node.props.items} isEditable={false} />
        )}
        {node.componentType === 'Card' && (
          <Card
            title={node.props.title}
            description={node.props.description}
            image={node.props.image}
            isEditable={false}
          />
        )}
        {node.componentType === 'ImageBlock' && (
          <ImageBlock
            src={node.props.src}
            alt={node.props.alt}
            caption={node.props.caption}
            isEditable={false}
          />
        )}
        {node.componentType === 'TestimonialRow' && (
          <TestimonialRow testimonials={node.props.testimonials} isEditable={false} />
        )}
        {node.componentType === 'HeroBlock' && (
          <HeroBlock
            title={node.props.title}
            subtitle={node.props.subtitle}
            badgeText={node.props.badgeText}
            ctaText={node.props.ctaText}
            ctaUrl={node.props.ctaUrl}
            secondaryText={node.props.secondaryText}
            secondaryUrl={node.props.secondaryUrl}
            variant={node.props.variant}
            isEditable={false}
          />
        )}
        {node.componentType === 'CalloutBlock' && (
          <CalloutBlock
            variant={node.props.variant}
            title={node.props.title}
            message={node.props.message}
            isEditable={false}
          />
        )}
        {node.componentType === 'StatsBlock' && (
          <StatsBlock
            title={node.props.title}
            subtitle={node.props.subtitle}
            stats={node.props.stats}
            isEditable={false}
          />
        )}
        {node.componentType === 'CodeBlock' && (
          <CodeBlock
            language={node.props.language}
            code={node.props.code}
            filename={node.props.filename}
            showLineNumbers={node.props.showLineNumbers}
            isEditable={false}
          />
        )}
        {node.componentType === 'ButtonBlock' && (
          <ButtonBlock
            label={node.props.label}
            url={node.props.url}
            variant={node.props.variant}
            size={node.props.size}
            align={node.props.align}
            icon={node.props.icon}
            openNewTab={node.props.openNewTab}
            isEditable={false}
          />
        )}
        {node.componentType === 'DividerBlock' && (
          <DividerBlock
            style={node.props.style}
            weight={node.props.weight}
            text={node.props.text}
            spacing={node.props.spacing}
            isEditable={false}
          />
        )}
        {node.componentType === 'NavBlock' && (
          <NavBlock
            logoText={node.props.logoText}
            logoUrl={node.props.logoUrl}
            links={node.props.links}
            ctaLabel={node.props.ctaLabel}
            ctaUrl={node.props.ctaUrl}
            sticky={node.props.sticky}
            isEditable={false}
          />
        )}
        {node.componentType === 'FooterBlock' && (
          <FooterBlock
            logoText={node.props.logoText}
            copyrightText={node.props.copyrightText}
            socials={node.props.socials}
            columns={node.props.columns}
            isEditable={false}
          />
        )}
        {node.componentType === 'ColumnsBlock' && (
          <ColumnsBlock
            layout={node.props.layout}
            gap={node.props.gap}
            align={node.props.align}
            columns={node.props.columns}
            isEditable={false}
          />
        )}
        {node.componentType === 'PricingBlock' && (
          <PricingBlock
            title={node.props.title}
            subtitle={node.props.subtitle}
            plans={node.props.plans}
            isEditable={false}
          />
        )}
        {node.componentType === 'TextBlock' && (
          <TextBlock
            content={node.props.content}
            isEditable={false}
          />
        )}
        {node.componentType === 'EmbedBlock' && (
          <EmbedBlock
            html={node.props.html}
            isEditable={false}
          />
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page component
// ─────────────────────────────────────────────────────────────────────────────
export default async function Page({ params }: DynamicPageProps) {
  const { path } = await params;
  const slug = '/' + (path?.join('/') || '');
  const page = await getPageBySlug(slug);
  const isPublic = page && page.status !== 'draft';

  // ── Homepage landing ───────────────────────────────────────────────────────
  if (!isPublic && slug === '/') {
    return (
      <div className="landing-page-wrapper">
        <header className="landing-header">
          <div className="landing-header-inner">
            <div className="landing-logo">
              <Sparkles size={20} className="logo-spark sparkles-icon" />
              <span>NextEditor</span>
            </div>
            <nav className="landing-nav">
              <LinkComponent href="/docs" className="landing-nav-btn">Launch Editor</LinkComponent>
            </nav>
          </div>
        </header>

        <section className="landing-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={12} />
              <span>Visual Markdown CMS + Blog Engine</span>
            </div>
            <h1>A Visual Page Builder<br />Designed for Blogs.</h1>
            <p>
              Write in Markdown, design with drag-and-drop component blocks, publish with full
              SEO metadata. NextEditor combines a real markdown editor with a blog CMS.
            </p>
            <div className="hero-ctas">
              <LinkComponent href="/docs" className="btn-hero-primary">
                Open Editor <ArrowRight size={16} />
              </LinkComponent>
              <LinkComponent href="/welcome" className="btn-hero-secondary">
                View Demo
              </LinkComponent>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="section-header">
            <h2>Everything a blog needs</h2>
            <p>From markdown authoring to full blog post metadata — all in one editor.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: <Layout size={20} />, title: '10+ Visual Blocks', desc: 'Hero, Accordion, Stats, Code, Button, Callout, Divider and more.' },
              { icon: <Edit size={20} />, title: 'Rich Markdown Parser', desc: '**bold**, *italic*, ==highlight==, ^sup^, tables, alerts, task lists and footnotes.' },
              { icon: <Sliders size={20} />, title: 'Full Blog Metadata', desc: 'Author, date, tags, category, featured image, excerpt — all managed in the editor.' },
              { icon: <Database size={20} />, title: 'Zero-Config DB', desc: 'File-based JSON database. No servers, no migrations, no setup.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrapper">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="landing-footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} NextEditor. Built with Next.js & Vanilla CSS.</p>
            <LinkComponent href="/docs" className="footer-edit-link">Enter Visual Editor →</LinkComponent>
          </div>
        </footer>
      </div>
    );
  }

  // ── 404 ────────────────────────────────────────────────────────────────────
  if (!isPublic) {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <Sparkles className="icon-pulse" size={48} />
          <h1>404 — Page Not Found</h1>
          <p>The page at <code>{slug}</code> does not exist or hasn't been published.</p>
          <div className="not-found-actions">
            <LinkComponent href="/docs" className="btn-primary">
              <Edit size={16} /> Open Visual Editor
            </LinkComponent>
          </div>
        </div>
      </div>
    );
  }

  const nodes = parseMarkdownToNodes(page.markdown);
  const isBlog = page.type === 'blog';

  const formattedDate = page.date
    ? new Date(page.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  if (!isBlog) {
    return (
      <div className="static-page-layout custom-page-layout" style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh' }}>
        <main className="static-page-content custom-page-content" style={{ padding: 0 }}>
          <div 
            className="static-content-container custom-content-container" 
            style={{ 
              maxWidth: '100%', 
              margin: 0, 
              padding: 0,
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {nodes.map((node) => renderNode(node))}
          </div>
        </main>

        {/* Premium Glassmorphic Floating Edit Button */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
          <LinkComponent 
            href="/docs" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px', 
              borderRadius: '30px', 
              backgroundColor: 'rgba(15, 23, 42, 0.85)', 
              backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: '#ffffff', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              textDecoration: 'none', 
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="floating-edit-pill"
          >
            <Edit size={14} style={{ color: 'var(--accent, #6366f1)' }} />
            <span>Edit Layout</span>
          </LinkComponent>
        </div>
      </div>
    );
  }

  return (
    <div className={`static-page-layout blog-layout`}>
      <header className="static-page-header">
        <div className="header-inner">
          <div className="brand-logo">
            <Sparkles size={16} className="logo-spark" />
            <span className="brand-text">NextEditor</span>
          </div>
          <nav className="header-nav">
            <LinkComponent href="/docs" className="nav-edit-link">
              <Edit size={14} /> Editor
            </LinkComponent>
          </nav>
        </div>
      </header>

      <main className="static-page-content">
        <div className={`static-content-container blog-content-container`}>

          {/* Blog post header */}
          <div className="blog-post-header">
            {/* Category badge */}
            {page.category && (
              <span className="blog-category-badge">{page.category}</span>
            )}

            {/* Featured image */}
            {page.featuredImage && (
              <div className="blog-featured-img-wrap">
                <img
                  src={page.featuredImage}
                  alt={page.title}
                  className="blog-featured-img"
                  loading="eager"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="blog-post-title">{page.title}</h1>

            {/* Excerpt */}
            {page.excerpt && (
              <p className="blog-post-excerpt">{page.excerpt}</p>
            )}

            {/* Meta row: author + date + reading time */}
            <div className="blog-meta-row">
              {page.author && (
                <div className="blog-author-chip">
                  {page.authorImage ? (
                    <img src={page.authorImage} alt={page.author} className="blog-author-avatar" />
                  ) : (
                    <span className="blog-author-avatar-placeholder">
                      <User size={14} />
                    </span>
                  )}
                  <span className="blog-author-name">{page.author}</span>
                </div>
              )}
              {formattedDate && (
                <div className="blog-meta-item">
                  <Calendar size={13} />
                  <span>{formattedDate}</span>
                </div>
              )}
              {page.readingTime && (
                <div className="blog-meta-item">
                  <Clock size={13} />
                  <span>{page.readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {page.tags && page.tags.length > 0 && (
              <div className="blog-tags-row">
                <Tag size={13} />
                {page.tags.map((tag) => (
                  <span key={tag} className="blog-tag-chip">{tag}</span>
                ))}
              </div>
            )}

            <div className="blog-header-divider" />
          </div>

          {/* Page/post content */}
          {nodes.map((node) => renderNode(node))}

          {/* Blog author card at bottom */}
          {page.author && (
            <div className="blog-author-card">
              {page.authorImage ? (
                <img src={page.authorImage} alt={page.author} className="blog-author-card-avatar" />
              ) : (
                <div className="blog-author-card-placeholder"><User size={28} /></div>
              )}
              <div className="blog-author-card-body">
                <div className="blog-author-card-name">Written by {page.author}</div>
                {page.authorBio && (
                  <p className="blog-author-card-bio">{page.authorBio}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="static-page-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} NextEditor</p>
          <LinkComponent href="/docs" className="footer-edit-link">
            Visual Builder Dashboard
          </LinkComponent>
        </div>
      </footer>
    </div>
  );
}
