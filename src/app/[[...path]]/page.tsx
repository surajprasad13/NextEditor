import React from "react";
import { getPageBySlug } from "@/lib/db";
import { parseMarkdownToNodes } from "@/lib/parser";
import { Accordion } from "@/components/render/Accordion";
import { Card } from "@/components/render/Card";
import { ImageBlock } from "@/components/render/ImageBlock";
import { TestimonialRow } from "@/components/render/TestimonialRow";
import { HeroBlock } from "@/components/render/HeroBlock";
import { CalloutBlock } from "@/components/render/CalloutBlock";
import { StatsBlock } from "@/components/render/StatsBlock";
import { CodeBlock } from "@/components/render/CodeBlock";
import { ButtonBlock } from "@/components/render/ButtonBlock";
import { DividerBlock } from "@/components/render/DividerBlock";
import { NavBlock } from "@/components/render/NavBlock";
import { FooterBlock } from "@/components/render/FooterBlock";
import { ColumnsBlock } from "@/components/render/ColumnsBlock";
import { PricingBlock } from "@/components/render/PricingBlock";
import { TextBlock } from "@/components/render/TextBlock";
import { EmbedBlock } from "@/components/render/EmbedBlock";
import { AdmonitionBlock } from "@/components/render/AdmonitionBlock";
import { TabsBlock } from "@/components/render/TabsBlock";
import { StepBlock } from "@/components/render/StepBlock";
import { HighlightBlock } from "@/components/render/HighlightBlock";
import { ContainerBlock } from "@/components/render/ContainerBlock";
import { MarkdownTextRenderer } from "@/components/render/MarkdownTextRenderer";
import {
  Edit,
  ArrowRight,
  Calendar,
  Tag,
  User,
  Clock,
  Zap,
  Layers,
  Code2,
  Globe,
  FileText,
  Sparkles,
} from "lucide-react";
import LinkComponent from "next/link";

const parseSpacing = (val: any) => {
  if (val === undefined || val === "") return undefined;
  if (/^\d+$/.test(val.toString().trim())) return `${val}px`;
  return val;
};

interface DynamicPageProps {
  params: Promise<{ path?: string[] }>;
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { path } = await params;
  const slug = "/" + (path?.join("/") || "");
  const page = await getPageBySlug(slug);

  if (!page && slug === "/") {
    return {
      title: "NextEditor — Visual Markdown Page Builder",
      description:
        "Design dynamic visual web layouts in Markdown with real-time drag-and-drop and inline editing.",
      openGraph: { title: "NextEditor", type: "website" as const },
    };
  }

  const isPublic = page && page.status !== "draft";
  if (!isPublic) return { title: "Page Not Found" };

  const description =
    page.excerpt || `${page.type === "blog" ? "Blog post" : "Page"}: ${page.title}`;
  return {
    title: `${page.title}${page.type !== "blog" ? " — NextEditor" : ""}`,
    description,
    authors: page.author ? [{ name: page.author }] : undefined,
    openGraph: {
      title: page.title,
      description,
      type: page.type === "blog" ? ("article" as const) : ("website" as const),
      images: page.featuredImage ? [{ url: page.featuredImage }] : [],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Unified component renderer (static output)
// ─────────────────────────────────────────────────────────────────────────────
function renderNode(node: ReturnType<typeof parseMarkdownToNodes>[0]) {
  if (node.type === "markdown") {
    return (
      <section
        key={node.id}
        className="static-section markdown-section"
        style={{ width: "100%", flex: "0 0 100%", maxWidth: "100%", boxSizing: "border-box" }}
      >
        <MarkdownTextRenderer content={node.content || ""} isEditable={false} />
      </section>
    );
  }

  const s = node.props?.customStyles || {};
  const blockWidth = s.blockWidth || "100";
  const verticalAlign = s.verticalAlign || "stretch";

  const outerStyle: React.CSSProperties = {
    width: `${blockWidth}%`,
    flex: `0 0 ${blockWidth}%`,
    maxWidth: `${blockWidth}%`,
    boxSizing: "border-box",
    alignSelf: verticalAlign === "stretch" ? "stretch" : verticalAlign,
  };
  if (blockWidth !== "100") outerStyle.padding = "8px";

  const innerStyle: React.CSSProperties = {};
  if (s.bgColor) innerStyle.backgroundColor = s.bgColor;
  if (s.textColor) innerStyle.color = s.textColor;
  if (s.contentAlign) innerStyle.textAlign = s.contentAlign as any;
  if (s.paddingTop !== undefined && s.paddingTop !== "") innerStyle.paddingTop = parseSpacing(s.paddingTop);
  if (s.paddingBottom !== undefined && s.paddingBottom !== "") innerStyle.paddingBottom = parseSpacing(s.paddingBottom);
  if (s.paddingLeft !== undefined && s.paddingLeft !== "") innerStyle.paddingLeft = parseSpacing(s.paddingLeft);
  if (s.paddingRight !== undefined && s.paddingRight !== "") innerStyle.paddingRight = parseSpacing(s.paddingRight);
  if (s.marginTop !== undefined && s.marginTop !== "") innerStyle.marginTop = parseSpacing(s.marginTop);
  if (s.marginBottom !== undefined && s.marginBottom !== "") innerStyle.marginBottom = parseSpacing(s.marginBottom);
  if (s.marginLeft !== undefined && s.marginLeft !== "") innerStyle.marginLeft = parseSpacing(s.marginLeft);
  if (s.marginRight !== undefined && s.marginRight !== "") innerStyle.marginRight = parseSpacing(s.marginRight);
  if (s.borderRadius !== undefined && s.borderRadius !== "") innerStyle.borderRadius = parseSpacing(s.borderRadius);
  if (s.borderWidth !== undefined && s.borderWidth !== "") {
    innerStyle.borderWidth = parseSpacing(s.borderWidth);
    innerStyle.borderStyle = s.borderStyle || "solid";
    if (s.borderColor) innerStyle.borderColor = s.borderColor;
  }
  if (s.boxShadow === "sm") innerStyle.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
  else if (s.boxShadow === "md") innerStyle.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.08)";
  else if (s.boxShadow === "lg") innerStyle.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
  if (s.fontFamily === "sans") innerStyle.fontFamily = "var(--font-sans, inherit)";
  else if (s.fontFamily === "serif") innerStyle.fontFamily = 'var(--font-serif, "Playfair Display", serif)';
  else if (s.fontFamily === "mono") innerStyle.fontFamily = "var(--font-mono, monospace)";
  if (s.fontSize !== undefined && s.fontSize !== "") innerStyle.fontSize = parseSpacing(s.fontSize);
  if (s.fontWeight) innerStyle.fontWeight = s.fontWeight;
  if (s.bgGradient) innerStyle.backgroundImage = `linear-gradient(${s.bgGradient})`;
  if (s.bgImage) {
    const ov = s.bgOverlay !== undefined && s.bgOverlay !== "" ? parseFloat(s.bgOverlay) : 0;
    innerStyle.backgroundImage = ov > 0
      ? `linear-gradient(rgba(0,0,0,${ov}),rgba(0,0,0,${ov})),url(${s.bgImage})`
      : `url(${s.bgImage})`;
    innerStyle.backgroundSize = "cover";
    innerStyle.backgroundPosition = "center";
    innerStyle.backgroundRepeat = "no-repeat";
  }
  if (s.maxWidth === "wide") { innerStyle.maxWidth = "1200px"; innerStyle.marginLeft = "auto"; innerStyle.marginRight = "auto"; }
  else if (s.maxWidth === "narrow") { innerStyle.maxWidth = "600px"; innerStyle.marginLeft = "auto"; innerStyle.marginRight = "auto"; }
  else if (s.maxWidth === "custom" && s.customMaxWidth) { innerStyle.maxWidth = `${s.customMaxWidth}px`; innerStyle.marginLeft = "auto"; innerStyle.marginRight = "auto"; }

  const hasCss = s.customCss || (s.hoverEffect && s.hoverEffect !== "none");
  const cssTag = hasCss ? (
    <style dangerouslySetInnerHTML={{ __html: `
      #sni-${node.id} { ${s.hoverEffect && s.hoverEffect !== "none" ? `transition: all ${s.transitionSpeed || "0.3s"} ease-in-out;` : ""} ${s.customCss || ""} }
      ${s.hoverEffect === "scale" ? `#sni-${node.id}:hover { transform: scale(1.03); }` : ""}
      ${s.hoverEffect === "float" ? `#sni-${node.id}:hover { transform: translateY(-6px); }` : ""}
      ${s.hoverEffect === "shadow" ? `#sni-${node.id}:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important; }` : ""}
      ${s.hoverEffect === "border-glow" ? `#sni-${node.id}:hover { border-color: var(--accent) !important; box-shadow: 0 0 12px rgba(37,99,235,0.4) !important; }` : ""}
    ` }} />
  ) : null;

  const p = node.props || {};
  return (
    <section key={node.id} className="static-section component-section" style={outerStyle}>
      <div id={`sni-${node.id}`} className={`block-style-wrapper ${s.customClass || ""}`} style={innerStyle}>
        {cssTag}
        {node.componentType === "Accordion" && <Accordion {...p} isEditable={false} />}
        {node.componentType === "Card" && <Card {...p} isEditable={false} />}
        {node.componentType === "ImageBlock" && <ImageBlock {...p} isEditable={false} />}
        {node.componentType === "TestimonialRow" && <TestimonialRow {...p} isEditable={false} />}
        {node.componentType === "HeroBlock" && <HeroBlock {...p} isEditable={false} />}
        {node.componentType === "CalloutBlock" && <CalloutBlock {...p} isEditable={false} />}
        {node.componentType === "StatsBlock" && <StatsBlock {...p} isEditable={false} />}
        {node.componentType === "CodeBlock" && <CodeBlock {...p} isEditable={false} />}
        {node.componentType === "ButtonBlock" && <ButtonBlock {...p} isEditable={false} />}
        {node.componentType === "DividerBlock" && <DividerBlock {...p} isEditable={false} />}
        {node.componentType === "NavBlock" && <NavBlock {...p} isEditable={false} />}
        {node.componentType === "FooterBlock" && <FooterBlock {...p} isEditable={false} />}
        {node.componentType === "ColumnsBlock" && <ColumnsBlock {...p} isEditable={false} />}
        {node.componentType === "PricingBlock" && <PricingBlock {...p} isEditable={false} />}
        {node.componentType === "TextBlock" && <TextBlock {...p} isEditable={false} />}
        {node.componentType === "EmbedBlock" && <EmbedBlock {...p} isEditable={false} />}
        {node.componentType === "AdmonitionBlock" && <AdmonitionBlock {...p} isEditable={false} />}
        {node.componentType === "TabsBlock" && <TabsBlock {...p} isEditable={false} />}
        {node.componentType === "StepBlock" && <StepBlock {...p} isEditable={false} />}
        {node.componentType === "HighlightBlock" && <HighlightBlock {...p} isEditable={false} />}
        {node.componentType === "ContainerBlock" && <ContainerBlock {...p} isEditable={false} />}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page component
// ─────────────────────────────────────────────────────────────────────────────
export default async function Page({ params }: DynamicPageProps) {
  const { path } = await params;
  const slug = "/" + (path?.join("/") || "");
  const page = await getPageBySlug(slug);
  const isPublic = page && page.status !== "draft";

  // ── Homepage ──────────────────────────────────────────────────────────────
  if (!isPublic && slug === "/") {
    return (
      <div className="lp-root">
        {/* ── Nav ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <div className="lp-logo">
              <Sparkles size={18} />
              <span>NextEditor</span>
            </div>
            <div className="lp-nav-links">
              <LinkComponent href="/welcome" className="lp-nav-link">Demo</LinkComponent>
              <LinkComponent href="/docs" className="lp-nav-link">Docs</LinkComponent>
              <LinkComponent href="/docs" className="lp-nav-cta">Open Editor →</LinkComponent>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="lp-hero-grid-bg" aria-hidden />
          <div className="lp-hero-inner">
            <div className="lp-hero-badge">
              <Zap size={11} />
              <span>Visual Markdown CMS + Blog Engine</span>
            </div>
            <h1 className="lp-hero-title">
              Build pages with<br />
              <span className="lp-hero-gradient">Markdown &amp; Blocks</span>
            </h1>
            <p className="lp-hero-sub">
              Write in Markdown, design with drag-and-drop component blocks,
              publish instantly. The editor that stays out of your way.
            </p>
            <div className="lp-hero-actions">
              <LinkComponent href="/docs" className="lp-btn-primary">
                Open Editor <ArrowRight size={15} />
              </LinkComponent>
              <LinkComponent href="/welcome" className="lp-btn-ghost">
                View Demo
              </LinkComponent>
            </div>
            <div className="lp-hero-proof">
              <span>20+ block types</span>
              <span className="lp-proof-dot" />
              <span>Zero-config DB</span>
              <span className="lp-proof-dot" />
              <span>Next.js export</span>
            </div>
          </div>
        </section>

        {/* ── Bento Features ── */}
        <section className="lp-bento-section">
          <div className="lp-section-inner">
            <div className="lp-section-label">Features</div>
            <h2 className="lp-section-title">Everything in one editor</h2>
            <p className="lp-section-sub">From drag-and-drop blocks to full blog metadata — no plugins, no config.</p>

            <div className="lp-bento-grid">
              <div className="lp-bento-card lp-bento-wide">
                <div className="lp-bento-icon" style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb" }}><Layers size={22} /></div>
                <h3>20+ Visual Block Types</h3>
                <p>Hero, Accordion, Tabs, Steps, Code, Callout, Admonition, Stats, Pricing, Embed, Columns, and more. Insert any block in one click.</p>
                <div className="lp-bento-tag-row">
                  {["Hero","Tabs","Steps","Admonition","Code","Pricing","Embed"].map(t => (
                    <span key={t} className="lp-bento-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="lp-bento-card">
                <div className="lp-bento-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}><FileText size={22} /></div>
                <h3>Rich Markdown Parser</h3>
                <p>**bold**, *italic*, ==highlight==, tables, task lists, footnotes, inline code and block quotes — all rendered live.</p>
              </div>
              <div className="lp-bento-card">
                <div className="lp-bento-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}><Zap size={22} /></div>
                <h3>Inline Edit &amp; Drag-Drop</h3>
                <p>Click any block to edit in-place. Drag to reorder. Undo / redo with full 100-step history.</p>
              </div>
              <div className="lp-bento-card">
                <div className="lp-bento-icon" style={{ background: "rgba(14,165,233,0.12)", color: "#0ea5e9" }}><Code2 size={22} /></div>
                <h3>Next.js Code Export</h3>
                <p>Click &quot;Get Code&quot; to copy a fully-resolved Next.js page component with imports — ready to paste and deploy.</p>
              </div>
              <div className="lp-bento-card">
                <div className="lp-bento-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}><Globe size={22} /></div>
                <h3>Blog + Page CMS</h3>
                <p>Author, date, tags, category, featured image, excerpt, SEO metadata — full blog post management built in.</p>
              </div>
              <div className="lp-bento-card lp-bento-accent">
                <div className="lp-bento-icon" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}><Edit size={22} /></div>
                <h3>Zero-Config Database</h3>
                <p>File-based JSON store. No servers, no migrations. Works out of the box on any Next.js deployment.</p>
                <LinkComponent href="/docs" className="lp-bento-link">Start building →</LinkComponent>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="lp-how-section">
          <div className="lp-section-inner">
            <div className="lp-section-label">Workflow</div>
            <h2 className="lp-section-title">How it works</h2>
            <div className="lp-steps-row">
              {[
                { n: "01", title: "Open the Editor", desc: "Navigate to /docs to launch the 3-column visual editor. Your pages load instantly." },
                { n: "02", title: "Build with Blocks", desc: "Insert blocks from the sidebar or toolbar. Click any block to edit inline — no forms." },
                { n: "03", title: "Save & Publish", desc: "Hit Ctrl+S or the Save button. Pages go live at their slug immediately." },
                { n: "04", title: "Export Code", desc: "Copy the generated Next.js component code to move any page into your own codebase." },
              ].map(step => (
                <div key={step.n} className="lp-step">
                  <div className="lp-step-num">{step.n}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA band ── */}
        <section className="lp-cta-band">
          <div className="lp-cta-inner">
            <Sparkles size={28} className="lp-cta-spark" />
            <h2>Ready to build?</h2>
            <p>Open the editor, create your first page, and publish in minutes.</p>
            <LinkComponent href="/docs" className="lp-btn-primary lp-btn-lg">
              Open Editor <ArrowRight size={16} />
            </LinkComponent>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-logo">
              <Sparkles size={15} />
              <span>NextEditor</span>
            </div>
            <p className="lp-footer-copy">© {new Date().getFullYear()} NextEditor. Built with Next.js.</p>
            <LinkComponent href="/docs" className="lp-footer-link">Enter Editor →</LinkComponent>
          </div>
        </footer>
      </div>
    );
  }

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (!isPublic) {
    return (
      <div className="lp-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 32, textAlign: "center" }}>
        <div className="lp-hero-badge"><Sparkles size={12} /><span>404</span></div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Page not found</h1>
        <p style={{ color: "var(--text-sub)", maxWidth: 400 }}>
          The page at <code style={{ background: "var(--bg-input)", padding: "2px 6px", borderRadius: 4 }}>{slug}</code> doesn&apos;t exist or hasn&apos;t been published.
        </p>
        <LinkComponent href="/docs" className="lp-btn-primary">
          <Edit size={14} /> Open Editor
        </LinkComponent>
      </div>
    );
  }

  // ── Rendered page / blog ───────────────────────────────────────────────────
  const nodes = parseMarkdownToNodes(page.markdown);
  const isBlog = page.type === "blog";
  const formattedDate = page.date
    ? new Date(page.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  if (!isBlog) {
    return (
      <div className="static-page-layout custom-page-layout" style={{ backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
        <main className="static-page-content custom-page-content" style={{ padding: 0 }}>
          <div className="static-content-container custom-content-container" style={{ maxWidth: "100%", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignContent: "flex-start", width: "100%", boxSizing: "border-box" }}>
            {nodes.map(node => renderNode(node))}
          </div>
        </main>
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
          <LinkComponent href="/docs" className="floating-edit-pill" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 30, backgroundColor: "rgba(15,23,42,0.85)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
            <Edit size={14} style={{ color: "var(--accent, #2563eb)" }} />
            <span>Edit</span>
          </LinkComponent>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page-layout blog-layout">
      <header className="static-page-header">
        <div className="header-inner">
          <div className="brand-logo"><Sparkles size={16} className="logo-spark" /><span className="brand-text">NextEditor</span></div>
          <nav className="header-nav"><LinkComponent href="/docs" className="nav-edit-link"><Edit size={14} /> Editor</LinkComponent></nav>
        </div>
      </header>

      <main className="static-page-content">
        <div className="static-content-container blog-content-container">
          <div className="blog-post-header">
            {page.category && <span className="blog-category-badge">{page.category}</span>}
            {page.featuredImage && (
              <div className="blog-featured-img-wrap">
                <img src={page.featuredImage} alt={page.title} className="blog-featured-img" loading="eager" />
              </div>
            )}
            <h1 className="blog-post-title">{page.title}</h1>
            {page.excerpt && <p className="blog-post-excerpt">{page.excerpt}</p>}
            <div className="blog-meta-row">
              {page.author && (
                <div className="blog-author-chip">
                  {page.authorImage
                    ? <img src={page.authorImage} alt={page.author} className="blog-author-avatar" />
                    : <span className="blog-author-avatar-placeholder"><User size={14} /></span>}
                  <span className="blog-author-name">{page.author}</span>
                </div>
              )}
              {formattedDate && <div className="blog-meta-item"><Calendar size={13} /><span>{formattedDate}</span></div>}
              {page.readingTime && <div className="blog-meta-item"><Clock size={13} /><span>{page.readingTime} min read</span></div>}
            </div>
            {page.tags && page.tags.length > 0 && (
              <div className="blog-tags-row">
                <Tag size={13} />
                {page.tags.map(tag => <span key={tag} className="blog-tag-chip">{tag}</span>)}
              </div>
            )}
            <div className="blog-header-divider" />
          </div>

          {nodes.map(node => renderNode(node))}

          {page.author && (
            <div className="blog-author-card">
              {page.authorImage
                ? <img src={page.authorImage} alt={page.author} className="blog-author-card-avatar" />
                : <div className="blog-author-card-placeholder"><User size={28} /></div>}
              <div className="blog-author-card-body">
                <div className="blog-author-card-name">Written by {page.author}</div>
                {page.authorBio && <p className="blog-author-card-bio">{page.authorBio}</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="static-page-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} NextEditor</p>
          <LinkComponent href="/docs" className="footer-edit-link">Visual Builder →</LinkComponent>
        </div>
      </footer>
    </div>
  );
}
