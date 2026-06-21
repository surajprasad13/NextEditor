'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Save,
  FileText,
  Layout,
  AlertCircle,
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Table,
  Undo2,
  Redo2,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Activity,
  FileCode,
  HelpCircle,
  Search,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Layers,
  Settings,
  Files,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { parseMarkdownToNodes, nodesToMarkdown, EditorNode } from '@/lib/parser';
import { DraggableBlock } from './DraggableBlock';
import { componentDefinitions, componentCategories } from './ComponentDefinitions';
import { MarkdownTextRenderer } from '../render/MarkdownTextRenderer';
import { PageItem } from '@/lib/db';
import LinkComponent from 'next/link';

const BLOCK_META: Record<string, { icon: string; color: string }> = {
  HeroBlock:      { icon: '🚀', color: '#6366f1' },
  Card:           { icon: '📦', color: '#0ea5e9' },
  DividerBlock:   { icon: '〰️', color: '#94a3b8' },
  CalloutBlock:   { icon: '📢', color: '#f59e0b' },
  ButtonBlock:    { icon: '🔘', color: '#10b981' },
  CodeBlock:      { icon: '💻', color: '#8b5cf6' },
  ImageBlock:     { icon: '🖼️', color: '#ec4899' },
  Accordion:      { icon: '📋', color: '#06b6d4' },
  TestimonialRow: { icon: '💬', color: '#84cc16' },
  StatsBlock:     { icon: '📊', color: '#f97316' },
  NavBlock:       { icon: '🧭', color: '#0ea5e9' },
  FooterBlock:    { icon: '🚪', color: '#475569' },
  ColumnsBlock:   { icon: '🥞', color: '#8b5cf6' },
  PricingBlock:   { icon: '🏷️', color: '#10b981' },
  TextBlock:      { icon: '✍️', color: '#6366f1' },
};

const MAX_HISTORY = 100;

export function VisualEditor() {
  // ── Page State ─────────────────────────────────────────────────────────────
  const [slug, setSlug] = useState('/welcome');
  const [title, setTitle] = useState('Welcome to NextEditor');
  const [markdown, setMarkdown] = useState('');
  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Blog Metadata State ────────────────────────────────────────────────────
  const [pageType, setPageType] = useState<'page' | 'blog'>('page');
  const [author, setAuthor] = useState('');
  const [authorImage, setAuthorImage] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [postDate, setPostDate] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [excerpt, setExcerpt] = useState('');

  // ── UI State ───────────────────────────────────────────────────────────────
  const [activeLeftTab, setActiveLeftTab] = useState<'pages' | 'blocks' | 'seo' | 'markdown' | 'export'>('blocks');
  const [activeRightTab, setActiveRightTab] = useState<'inspector' | 'outline'>('inspector');
  const [canvasDevice, setCanvasDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [pagesFilter, setPagesFilter] = useState('');
  const [pageStatus, setPageStatus] = useState<'draft' | 'published' | 'scheduled'>('published');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Insert dropdown ────────────────────────────────────────────────────────
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [designStylesExpanded, setDesignStylesExpanded] = useState(false);
  const [activeColumnSubPanel, setActiveColumnSubPanel] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('layout');

  // ── New page modal ─────────────────────────────────────────────────────────
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // ── Export code modal ──────────────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Find & Replace ─────────────────────────────────────────────────────────
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // ── Drag and drop ──────────────────────────────────────────────────────────
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const skipHistoryPushRef = useRef(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const insertDropdownRef = useRef<HTMLDivElement>(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const lineCount = markdown.split('\n').length;
  const wordCount = markdown ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = markdown.length;

  // ── Load pages ─────────────────────────────────────────────────────────────
  const loadPages = async (slugToSelect?: string) => {
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data);

        if (data.length > 0) {
          let selected = data[0];
          if (slugToSelect) {
            selected = data.find((p: PageItem) => p.slug === slugToSelect) || selected;
          } else {
            selected = data.find((p: PageItem) => p.slug === slug) || selected;
          }

          setSlug(selected.slug);
          setTitle(selected.title);
          setMarkdown(selected.markdown);
          setPageStatus(selected.status || 'published');
          setNodes(parseMarkdownToNodes(selected.markdown));

          // Init history
          historyRef.current = [selected.markdown];
          historyIndexRef.current = 0;
        }
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPages(); }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        setSelectedId(null);
        setShowInsertDropdown(false);
        setShowFindReplace(false);
        return;
      }

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); return; }
      if (ctrl && e.key === 'y') { e.preventDefault(); handleRedo(); return; }
      if (ctrl && e.shiftKey && e.key === 'Z') { e.preventDefault(); handleRedo(); return; }

      if (ctrl && e.key === 's') { e.preventDefault(); handleSave(); return; }
      if (ctrl && e.key === 'f' && document.activeElement === textareaRef.current) {
        e.preventDefault();
        setShowFindReplace(true);
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [markdown]);

  // ── Close insert dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (insertDropdownRef.current && !insertDropdownRef.current.contains(e.target as Node)) {
        setShowInsertDropdown(false);
      }
    };
    if (showInsertDropdown) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showInsertDropdown]);

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const pushHistory = (val: string) => {
    if (skipHistoryPushRef.current) return;
    const hist = historyRef.current;
    const idx = historyIndexRef.current;
    // Truncate forward history
    if (idx < hist.length - 1) hist.splice(idx + 1);
    // Deduplicate
    if (hist[idx] === val) return;
    hist.push(val);
    if (hist.length > MAX_HISTORY) hist.shift();
    historyIndexRef.current = hist.length - 1;
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const val = historyRef.current[historyIndexRef.current];
      skipHistoryPushRef.current = true;
      setMarkdown(val);
      setNodes(parseMarkdownToNodes(val));
      skipHistoryPushRef.current = false;
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const val = historyRef.current[historyIndexRef.current];
      skipHistoryPushRef.current = true;
      setMarkdown(val);
      setNodes(parseMarkdownToNodes(val));
      skipHistoryPushRef.current = false;
    }
  };

  // ── Markdown update ────────────────────────────────────────────────────────
  const handleMarkdownChange = (val: string) => {
    pushHistory(val);
    setMarkdown(val);
    setNodes(parseMarkdownToNodes(val));
  };

  const syncNodesToMarkdown = useCallback((updatedNodes: EditorNode[]) => {
    setNodes(updatedNodes);
    const compiled = nodesToMarkdown(updatedNodes);
    pushHistory(compiled);
    setMarkdown(compiled);
  }, []);

  // ── Page selection ─────────────────────────────────────────────────────────
  const selectPage = (page: PageItem) => {
    setSlug(page.slug);
    setTitle(page.title);
    setMarkdown(page.markdown);
    setPageStatus(page.status || 'published');
    setPageType(page.type || 'page');
    setAuthor(page.author || '');
    setAuthorImage(page.authorImage || '');
    setAuthorBio(page.authorBio || '');
    setPostDate(page.date ? page.date.slice(0, 10) : '');
    setTags((page.tags || []).join(', '));
    setCategory(page.category || '');
    setFeaturedImage(page.featuredImage || '');
    setExcerpt(page.excerpt || '');
    setNodes(parseMarkdownToNodes(page.markdown));
    setSelectedId(null);
    setMessage(null);
    historyRef.current = [page.markdown];
    historyIndexRef.current = 0;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!slug.trim() || !title.trim()) {
      setMessage({ type: 'error', text: 'Slug and Title are required.' });
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          markdown,
          status: pageStatus,
          type: pageType,
          author: author || undefined,
          authorImage: authorImage || undefined,
          authorBio: authorBio || undefined,
          date: postDate ? new Date(postDate).toISOString() : undefined,
          tags: tagArray.length ? tagArray : undefined,
          category: category || undefined,
          featuredImage: featuredImage || undefined,
          excerpt: excerpt || undefined,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `${pageType === 'blog' ? 'Post' : 'Page'} saved successfully!` });
        await loadPages(slug.trim());
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete page ────────────────────────────────────────────────────────────
  const handleDeletePage = async () => {
    if (slug === '/welcome' || slug === '/') {
      alert('Core system pages cannot be deleted.');
      return;
    }
    if (!window.confirm(`Permanently delete "${title}" (${slug})?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Page deleted successfully.' });
        await loadPages('/welcome');
        setActiveLeftTab('blocks');
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to delete.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Create page ────────────────────────────────────────────────────────────
  const handleCreatePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageSlug.trim() || !newPageTitle.trim()) return;

    let formattedSlug = newPageSlug.trim();
    if (!formattedSlug.startsWith('/')) formattedSlug = '/' + formattedSlug;

    setIsSaving(true);
    try {
      let initMarkdown = `# ${newPageTitle.trim()}\n\nWrite your content here...`;
      if (selectedTemplate === 'landing') {
        initMarkdown = `:::NavBlock
{
  "logoText": "NextEditor",
  "logoUrl": "/",
  "links": [
    { "label": "Home", "url": "/" },
    { "label": "Services", "url": "#services" },
    { "label": "About", "url": "#about" }
  ],
  "ctaLabel": "Contact",
  "ctaUrl": "#contact",
  "sticky": true
}
:::

:::HeroBlock
{
  "title": "Stunning Visual Design Made Simple",
  "subtitle": "Create production-ready pages with custom grids, margins, background overlays, and smooth hover effects.",
  "badgeText": "⚡ Next-Gen Website Builder",
  "ctaText": "Explore Features",
  "ctaUrl": "#services",
  "secondaryText": "Get Started",
  "secondaryUrl": "#contact",
  "variant": "gradient"
}
:::

### 🎨 Showcase our features
Select any element on the right panel to customize its design. Adjust widths below to stack blocks side-by-side!

:::Card
{
  "title": "Flexible CSS Layout Engine",
  "description": "Align components side-by-side using grid row spans (e.g. 50% or 33%) and reorder them by dragging.",
  "tag": "Layouts",
  "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
  "imageLayout": "top",
  "customStyles": {
    "blockWidth": "50",
    "bgColor": "var(--bg-card)",
    "borderRadius": 12,
    "paddingTop": 24,
    "paddingBottom": 24,
    "paddingLeft": 24,
    "paddingRight": 24,
    "boxShadow": "md",
    "hoverEffect": "scale"
  }
}
:::

:::Card
{
  "title": "Rich Micro-Animations",
  "description": "Engage visitors with elegant hover zoom-ins, float-up motions, border-glow effects, and shadow elevations.",
  "tag": "Animations",
  "image": "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=800&auto=format&fit=crop",
  "imageLayout": "top",
  "customStyles": {
    "blockWidth": "50",
    "bgColor": "var(--bg-card)",
    "borderRadius": 12,
    "paddingTop": 24,
    "paddingBottom": 24,
    "paddingLeft": 24,
    "paddingRight": 24,
    "boxShadow": "md",
    "hoverEffect": "scale"
  }
}
:::

:::CalloutBlock
{
  "variant": "success",
  "title": "Pro Tip:",
  "message": "Double-click components to inline-edit, or use the **Box Styles** panel on the right sidebar to change typography, spacing, or backgrounds."
}
:::

:::FooterBlock
{
  "logoText": "NextEditor",
  "copyrightText": "© 2026 NextEditor. All rights reserved.",
  "socials": [
    { "platform": "twitter", "url": "#" },
    { "platform": "github", "url": "#" }
  ],
  "columns": [
    {
      "title": "Company",
      "links": [
        { "label": "Services", "url": "#services" },
        { "label": "Privacy", "url": "#" }
      ]
    }
  ]
}
:::`;
      } else if (selectedTemplate === 'pricing') {
        initMarkdown = `:::NavBlock
{
  "logoText": "NextEditor",
  "logoUrl": "/",
  "links": [
    { "label": "Features", "url": "#" },
    { "label": "Pricing", "url": "#" }
  ],
  "ctaLabel": "Sign Up",
  "ctaUrl": "#",
  "sticky": false
}
:::

:::StatsBlock
{
  "title": "Engineered for Conversion",
  "subtitle": "Join thousands of designers building fast, accessible React pages.",
  "stats": [
    { "value": "100%", "label": "Responsive Grid Layouts" },
    { "value": "0ms", "label": "Config Setup Time" },
    { "value": "60fps", "label": "Micro-Animations" }
  ]
}
:::

:::PricingBlock
{
  "title": "Simple, Transparent Plans",
  "subtitle": "Choose the right tier to build and publish visual markdown websites.",
  "plans": [
    {
      "name": "Standard Plan",
      "price": "$0",
      "period": "mo",
      "features": ["Visual Canvas reordering", "Standard Blocks Library", "Next.js Exporter"],
      "ctaText": "Start Free",
      "ctaUrl": "#",
      "popular": false
    },
    {
      "name": "Professional Tier",
      "price": "$19",
      "period": "mo",
      "features": ["Unlimited Dynamic Pages", "Box Design Styles Engine", "Custom Embed blocks", "Dedicated Email Support"],
      "ctaText": "Upgrade to Pro",
      "ctaUrl": "#",
      "popular": true
    }
  ]
}
:::

:::Accordion
{
  "items": [
    {
      "title": "Can I export my designs?",
      "content": "Yes, click the 'Get Code' button in the editor header to copy standard React components styled with Next.js inline CSS tags."
    },
    {
      "title": "Can I use raw HTML templates?",
      "content": "Yes, insert an 'HTML / Embed Code' block to integrate third-party forms, widgets, or inline CSS modules."
    }
  ]
}
:::`;
      }

      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: formattedSlug,
          title: newPageTitle.trim(),
          markdown: initMarkdown,
        }),
      });
      if (res.ok) {
        setNewPageSlug('');
        setNewPageTitle('');
        setShowNewPageModal(false);
        await loadPages(formattedSlug);
        setMessage({ type: 'success', text: `Page "${newPageTitle}" created!` });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create page.');
      }
    } catch {
      alert('Error creating page.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cursor insertion ───────────────────────────────────────────────────────
  const insertAtCursor = (prefix: string, suffix: string = '', newLine = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selection = current.substring(start, end);

    const insert = newLine ? '\n' + prefix + selection + suffix + '\n' : prefix + selection + suffix;
    const newMd = current.substring(0, start) + insert + current.substring(end);

    handleMarkdownChange(newMd);
    setTimeout(() => {
      textarea.focus();
      const cursor = newLine ? start + insert.length : start + prefix.length;
      textarea.setSelectionRange(cursor, cursor + selection.length);
    }, 20);
  };

  // ── Textarea keyboard shortcuts ───────────────────────────────────────────
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Ctrl+B → bold
    if (ctrl && e.key === 'b') { e.preventDefault(); insertAtCursor('**', '**'); return; }
    // Ctrl+I → italic
    if (ctrl && e.key === 'i') { e.preventDefault(); insertAtCursor('*', '*'); return; }
    // Ctrl+U → underline (HTML)
    if (ctrl && e.key === 'u') { e.preventDefault(); insertAtCursor('<u>', '</u>'); return; }
    // Ctrl+K → link prompt
    if (ctrl && e.key === 'k') {
      e.preventDefault();
      const url = window.prompt('Enter URL:', 'https://');
      if (url) {
        const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        insertAtCursor('[', `](${url})`);
      }
      return;
    }
    // Ctrl+Shift+K → inline code
    if (ctrl && e.shiftKey && e.key === 'K') { e.preventDefault(); insertAtCursor('`', '`'); return; }
    // Tab → indent (2 spaces) / Shift+Tab → dedent
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      if (e.shiftKey) {
        // dedent – remove up to 2 leading spaces on current line
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineText = val.slice(lineStart);
        const spaces = lineText.match(/^( {1,2})/)?.[1] ?? '';
        if (spaces) {
          const newMd = val.slice(0, lineStart) + val.slice(lineStart + spaces.length);
          handleMarkdownChange(newMd);
          setTimeout(() => textarea.setSelectionRange(start - spaces.length, end - spaces.length), 10);
        }
      } else {
        const newMd = val.slice(0, start) + '  ' + val.slice(end);
        handleMarkdownChange(newMd);
        setTimeout(() => textarea.setSelectionRange(start + 2, start + 2), 10);
      }
      return;
    }
    // Enter inside list – continue list marker
    if (e.key === 'Enter' && !ctrl && !e.shiftKey) {
      const start = textarea.selectionStart;
      const val = textarea.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.slice(lineStart, start);
      const listMatch = currentLine.match(/^(\s*)([-*+]|\d+[.)])\s/);
      if (listMatch) {
        e.preventDefault();
        const indent = listMatch[1];
        const marker = /\d/.test(listMatch[2])
          ? `${parseInt(listMatch[2]) + 1}.`
          : listMatch[2];
        // Empty list item → break out
        const itemText = currentLine.slice(listMatch[0].length).trim();
        if (!itemText) {
          // Remove empty marker, break out
          const newMd = val.slice(0, lineStart) + '\n' + val.slice(start);
          handleMarkdownChange(newMd);
          setTimeout(() => textarea.setSelectionRange(lineStart + 1, lineStart + 1), 10);
        } else {
          const continuation = `\n${indent}${marker} `;
          const newMd = val.slice(0, start) + continuation + val.slice(start);
          handleMarkdownChange(newMd);
          setTimeout(() => {
            const pos = start + continuation.length;
            textarea.setSelectionRange(pos, pos);
          }, 10);
        }
      }
    }
  };

  // ── Insert block ───────────────────────────────────────────────────────────
  const handleInsertBlock = (type: string) => {
    setShowInsertDropdown(false);

    // 1. Check if we are inserting a raw markdown text block
    if (type === 'markdown') {
      const textarea = textareaRef.current;
      if (activeLeftTab === 'markdown' && textarea) {
        insertAtCursor('\n### New Text Block\nWrite your markdown content here...\n');
        return;
      }

      // Otherwise, insert directly into the nodes list
      const newId = `node-${Date.now()}`;
      const newBlock: EditorNode = {
        id: newId,
        type: 'markdown',
        content: '### New Text Block\nWrite your markdown content here...',
      };

      let updated = [...nodes];
      if (selectedId) {
        const idx = nodes.findIndex((n) => n.id === selectedId);
        if (idx !== -1) {
          updated.splice(idx + 1, 0, newBlock);
        } else {
          updated.push(newBlock);
        }
      } else {
        updated.push(newBlock);
      }

      syncNodesToMarkdown(updated);
      setSelectedId(newId);
      return;
    }

    const def = componentDefinitions[type];
    if (!def) return;

    // 2. Check if we are in raw markdown editor tab with textarea focused/mounted
    const textarea = textareaRef.current;
    if (activeLeftTab === 'markdown' && textarea) {
      const blockText = `\n:::${type}\n${JSON.stringify(def.defaultProps, null, 2)}\n:::\n`;
      insertAtCursor(blockText);
      return;
    }

    // 3. Otherwise, insert directly into the visual nodes list
    const newId = `node-${Date.now()}`;
    const newBlock: EditorNode = {
      id: newId,
      type: 'component',
      componentType: type,
      props: JSON.parse(JSON.stringify(def.defaultProps)),
    };

    let updated = [...nodes];
    if (selectedId) {
      const idx = nodes.findIndex((n) => n.id === selectedId);
      if (idx !== -1) {
        updated.splice(idx + 1, 0, newBlock);
      } else {
        updated.push(newBlock);
      }
    } else {
      updated.push(newBlock);
    }

    syncNodesToMarkdown(updated);
    setSelectedId(newId);
  };

  // ── Insert markdown table template ─────────────────────────────────────────
  const insertTable = () => {
    const table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';
    insertAtCursor(table);
  };

  // ── Find & Replace ─────────────────────────────────────────────────────────
  const handleReplace = () => {
    if (!findText) return;
    const newMd = markdown.split(findText).join(replaceText);
    handleMarkdownChange(newMd);
  };

  const handleReplaceOne = () => {
    if (!findText) return;
    const idx = markdown.indexOf(findText);
    if (idx === -1) return;
    const newMd = markdown.substring(0, idx) + replaceText + markdown.substring(idx + findText.length);
    handleMarkdownChange(newMd);
  };

  const occurrences = findText ? (markdown.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;

  // ── Scroll sync ────────────────────────────────────────────────────────────
  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // ── Node operations ────────────────────────────────────────────────────────
  const handleUpdateNode = (id: string, updatedVal: any) => {
    const updated = nodes.map((n) => {
      if (n.id !== id) return n;
      return n.type === 'component' ? { ...n, props: updatedVal } : { ...n, content: updatedVal };
    });
    syncNodesToMarkdown(updated);
  };

  const handleMoveNode = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= nodes.length) return;
    const newNodes = [...nodes];
    const [moved] = newNodes.splice(fromIdx, 1);
    newNodes.splice(toIdx, 0, moved);
    syncNodesToMarkdown(newNodes);
  };

  const handleDeleteNode = (id: string) => {
    const newNodes = nodes.filter((n) => n.id !== id);
    syncNodesToMarkdown(newNodes);
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicateNode = (id: string) => {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const original = nodes[idx];
    const newId = `node-${Date.now()}`;
    const duplicate: EditorNode = {
      ...original,
      id: newId,
      props: original.props ? JSON.parse(JSON.stringify(original.props)) : undefined,
    };
    const updated = [...nodes];
    updated.splice(idx + 1, 0, duplicate);
    syncNodesToMarkdown(updated);
    setSelectedId(newId);
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggedIndex(null);
    if (draggedIndex === null || draggedIndex === index) return;
    handleMoveNode(draggedIndex, index);
  };

  // ── Next.js code export ────────────────────────────────────────────────────
  const generateNextJsCode = () => {
    const imports = new Set<string>();
    const nodesJsx = nodes.map((node) => {
      if (node.type === 'markdown') {
        const lines = (node.content || '').split('\n');
        let inList = false;
        const jsxLines: string[] = [];
        lines.forEach((line) => {
          const t = line.trim();
          if (t.startsWith('# ')) { if (inList) { jsxLines.push('        </ul>'); inList = false; } jsxLines.push(`        <h1>${t.slice(2)}</h1>`); }
          else if (t.startsWith('## ')) { if (inList) { jsxLines.push('        </ul>'); inList = false; } jsxLines.push(`        <h2>${t.slice(3)}</h2>`); }
          else if (t.startsWith('### ')) { if (inList) { jsxLines.push('        </ul>'); inList = false; } jsxLines.push(`        <h3>${t.slice(4)}</h3>`); }
          else if (t.startsWith('- ') || t.startsWith('* ')) { if (!inList) { jsxLines.push('        <ul>'); inList = true; } jsxLines.push(`          <li>${t.slice(2)}</li>`); }
          else if (!t) { if (inList) { jsxLines.push('        </ul>'); inList = false; } }
          else { if (inList) { jsxLines.push('        </ul>'); inList = false; } jsxLines.push(`        <p>${t}</p>`); }
        });
        if (inList) jsxLines.push('        </ul>');
        return `      <div style={{ width: '100%', flex: '0 0 100%', maxWidth: '100%', boxSizing: 'border-box' }}>\n${jsxLines.join('\n')}\n      </div>`;
      } else {
        imports.add(node.componentType || '');
        let componentCode = '';
        switch (node.componentType) {
          case 'Accordion': componentCode = `<Accordion items={${JSON.stringify(node.props.items)}} />`; break;
          case 'Card': componentCode = `<Card title="${node.props.title}" description="${node.props.description}" image="${node.props.image}" />`; break;
          case 'ImageBlock': componentCode = `<ImageBlock src="${node.props.src}" alt="${node.props.alt}" caption="${node.props.caption}" />`; break;
          case 'TestimonialRow': componentCode = `<TestimonialRow testimonials={${JSON.stringify(node.props.testimonials)}} />`; break;
          case 'HeroBlock': componentCode = `<HeroBlock title="${node.props.title}" subtitle="${node.props.subtitle}" ctaText="${node.props.ctaText}" ctaUrl="${node.props.ctaUrl}" />`; break;
          case 'CalloutBlock': componentCode = `<CalloutBlock variant="${node.props.variant}" title="${node.props.title}" message="${node.props.message}" />`; break;
          case 'StatsBlock': componentCode = `<StatsBlock title="${node.props.title}" stats={${JSON.stringify(node.props.stats)}} />`; break;
          case 'CodeBlock': componentCode = `<CodeBlock language="${node.props.language}" filename="${node.props.filename}" code={\`${node.props.code}\`} />`; break;
          case 'ButtonBlock': componentCode = `<ButtonBlock label="${node.props.label}" url="${node.props.url}" variant="${node.props.variant}" />`; break;
          case 'DividerBlock': componentCode = `<DividerBlock style="${node.props.style}" text="${node.props.text || ''}" />`; break;
          case 'NavBlock': componentCode = `<NavBlock logoText="${node.props.logoText}" logoUrl="${node.props.logoUrl || '/'}" links={${JSON.stringify(node.props.links)}} ctaLabel="${node.props.ctaLabel || ''}" ctaUrl="${node.props.ctaUrl || ''}" sticky={${!!node.props.sticky}} />`; break;
          case 'FooterBlock': componentCode = `<FooterBlock logoText="${node.props.logoText}" copyrightText="${node.props.copyrightText || ''}" socials={${JSON.stringify(node.props.socials || [])}} columns={${JSON.stringify(node.props.columns || [])}} />`; break;
          case 'ColumnsBlock': componentCode = `<ColumnsBlock layout="${node.props.layout}" gap="${node.props.gap || 'md'}" align="${node.props.align || 'stretch'}" columns={${JSON.stringify(node.props.columns)}} />`; break;
          case 'PricingBlock': componentCode = `<PricingBlock title="${node.props.title}" subtitle="${node.props.subtitle || ''}" plans={${JSON.stringify(node.props.plans)}} />`; break;
          case 'TextBlock': componentCode = `<TextBlock content={\`${node.props.content}\`} />`; break;
          case 'EmbedBlock': componentCode = `<EmbedBlock html={\`${node.props.html}\`} />`; break;
          default: break;
        }

        const styles = node.props?.customStyles || {};
        
        const blockWidth = styles.blockWidth || '100';
        const verticalAlign = styles.verticalAlign || 'stretch';
        
        const outerStyleEntries: string[] = [
          `width: '${blockWidth}%'`,
          `flex: '0 0 ${blockWidth}%'`,
          `maxWidth: '${blockWidth}%'`,
          `boxSizing: 'border-box'`
        ];
        if (verticalAlign !== 'stretch') {
          outerStyleEntries.push(`alignSelf: '${verticalAlign}'`);
        }
        if (blockWidth !== '100') {
          outerStyleEntries.push(`padding: '8px'`);
        }

        const parseSp = (val: any) => {
          if (val === undefined || val === '') return "''";
          const trimmed = val.toString().trim();
          return /^\d+$/.test(trimmed) ? `'${trimmed}px'` : `'${trimmed}'`;
        };

        const innerStyleEntries: string[] = [];
        if (styles.bgColor) innerStyleEntries.push(`backgroundColor: '${styles.bgColor}'`);
        if (styles.textColor) innerStyleEntries.push(`color: '${styles.textColor}'`);
        if (styles.contentAlign) innerStyleEntries.push(`textAlign: '${styles.contentAlign}'`);
        if (styles.paddingTop !== undefined && styles.paddingTop !== '') innerStyleEntries.push(`paddingTop: ${parseSp(styles.paddingTop)}`);
        if (styles.paddingBottom !== undefined && styles.paddingBottom !== '') innerStyleEntries.push(`paddingBottom: ${parseSp(styles.paddingBottom)}`);
        if (styles.paddingLeft !== undefined && styles.paddingLeft !== '') innerStyleEntries.push(`paddingLeft: ${parseSp(styles.paddingLeft)}`);
        if (styles.paddingRight !== undefined && styles.paddingRight !== '') innerStyleEntries.push(`paddingRight: ${parseSp(styles.paddingRight)}`);
        if (styles.marginTop !== undefined && styles.marginTop !== '') innerStyleEntries.push(`marginTop: ${parseSp(styles.marginTop)}`);
        if (styles.marginBottom !== undefined && styles.marginBottom !== '') innerStyleEntries.push(`marginBottom: ${parseSp(styles.marginBottom)}`);
        if (styles.marginLeft !== undefined && styles.marginLeft !== '') innerStyleEntries.push(`marginLeft: ${parseSp(styles.marginLeft)}`);
        if (styles.marginRight !== undefined && styles.marginRight !== '') innerStyleEntries.push(`marginRight: ${parseSp(styles.marginRight)}`);
        if (styles.borderRadius !== undefined && styles.borderRadius !== '') innerStyleEntries.push(`borderRadius: ${parseSp(styles.borderRadius)}`);
        if (styles.borderWidth !== undefined && styles.borderWidth !== '') {
          innerStyleEntries.push(`borderWidth: ${parseSp(styles.borderWidth)}`);
          innerStyleEntries.push(`borderStyle: '${styles.borderStyle || 'solid'}'`);
          if (styles.borderColor) innerStyleEntries.push(`borderColor: '${styles.borderColor}'`);
        }
        if (styles.boxShadow === 'sm') innerStyleEntries.push(`boxShadow: '0 1px 3px rgba(0,0,0,0.1)'`);
        else if (styles.boxShadow === 'md') innerStyleEntries.push(`boxShadow: '0 4px 6px rgba(0,0,0,0.1)'`);
        else if (styles.boxShadow === 'lg') innerStyleEntries.push(`boxShadow: '0 10px 15px rgba(0,0,0,0.1)'`);

        if (styles.fontFamily) {
          if (styles.fontFamily === 'sans') innerStyleEntries.push(`fontFamily: 'var(--font-sans, inherit)'`);
          else if (styles.fontFamily === 'serif') innerStyleEntries.push(`fontFamily: 'var(--font-serif, "Playfair Display", serif)'`);
          else if (styles.fontFamily === 'mono') innerStyleEntries.push(`fontFamily: 'var(--font-mono, monospace)'`);
          else if (styles.fontFamily === 'system') innerStyleEntries.push(`fontFamily: 'system-ui, -apple-system, sans-serif'`);
        }
        if (styles.fontSize !== undefined && styles.fontSize !== '') innerStyleEntries.push(`fontSize: ${parseSp(styles.fontSize)}`);
        if (styles.fontWeight) innerStyleEntries.push(`fontWeight: '${styles.fontWeight}'`);
        if (styles.letterSpacing !== undefined && styles.letterSpacing !== '') innerStyleEntries.push(`letterSpacing: ${parseSp(styles.letterSpacing)}`);

        if (styles.bgGradient) {
          innerStyleEntries.push(`backgroundImage: 'linear-gradient(${styles.bgGradient})'`);
        }
        if (styles.bgImage) {
          const overlay = styles.bgOverlay !== undefined && styles.bgOverlay !== '' ? parseFloat(styles.bgOverlay) : 0;
          if (overlay > 0) {
            innerStyleEntries.push(`backgroundImage: 'linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url(${styles.bgImage})'`);
          } else {
            innerStyleEntries.push(`backgroundImage: 'url(${styles.bgImage})'`);
          }
          innerStyleEntries.push(`backgroundSize: 'cover'`);
          innerStyleEntries.push(`backgroundPosition: 'center'`);
          innerStyleEntries.push(`backgroundRepeat: 'no-repeat'`);
        }

        if (styles.maxWidth === 'wide') innerStyleEntries.push(`maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto'`);
        else if (styles.maxWidth === 'narrow') innerStyleEntries.push(`maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto'`);
        else if (styles.maxWidth === 'custom' && styles.customMaxWidth !== undefined && styles.customMaxWidth !== '') innerStyleEntries.push(`maxWidth: '${styles.customMaxWidth}px', marginLeft: 'auto', marginRight: 'auto'`);

        const classAttr = styles.customClass ? ` className="${styles.customClass}"` : '';
        
        let styleTagContent = styles.customCss || '';
        if (styles.hoverEffect && styles.hoverEffect !== 'none') {
          styleTagContent += `\n#exported-node-inner-${node.id} { transition: all ${styles.transitionSpeed || '0.3s'} ease-in-out; }\n`;
          if (styles.hoverEffect === 'scale') styleTagContent += `#exported-node-inner-${node.id}:hover { transform: scale(1.03); }\n`;
          else if (styles.hoverEffect === 'float') styleTagContent += `#exported-node-inner-${node.id}:hover { transform: translateY(-6px); }\n`;
          else if (styles.hoverEffect === 'shadow') styleTagContent += `#exported-node-inner-${node.id}:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important; }\n`;
          else if (styles.hoverEffect === 'border-glow') styleTagContent += `#exported-node-inner-${node.id}:hover { border-color: var(--accent, #6366f1) !important; box-shadow: 0 0 12px rgba(99, 102, 241, 0.4) !important; }\n`;
        }
        const customStyleTag = styleTagContent ? `\n        <style dangerouslySetInnerHTML={{ __html: \`${styleTagContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />` : '';
        
        const innerStyleAttr = innerStyleEntries.length > 0 ? ` style={{ ${innerStyleEntries.join(', ')} }}` : '';
        
        return `      <div style={{ ${outerStyleEntries.join(', ')} }}>
        <div id="exported-node-inner-${node.id}"${innerStyleAttr}${classAttr}>${customStyleTag}
          ${componentCode}
        </div>
      </div>`;
      }
    }).filter(Boolean).join('\n\n');

    const importLines = Array.from(imports).map((n) => `import { ${n} } from '@/components/render/${n}';`).join('\n');
    return `import React from 'react';\n${importLines}\n\nexport const metadata = {\n  title: "${title}",\n  description: "Next.js page exported by NextEditor",\n};\n\nexport default function ExportedPage() {\n  return (\n    <div className="exported-page-container" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>\n${nodesJsx}\n    </div>\n  );\n}\n`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // ── Outline Navigator Builder ──────────────────────────────────────────────
  const renderOutline = () => {
    if (nodes.length === 0) {
      return (
        <div className="inspector-empty-state">
          <Layers size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p>No blocks on this page yet.</p>
        </div>
      );
    }

    return (
      <div className="outline-navigator">
        <h4 className="inspector-section-title">Navigator Tree</h4>
        <div className="outline-list">
          {nodes.map((node, index) => {
            const isSelected = selectedId === node.id;
            const meta = BLOCK_META[node.componentType || ''] || { icon: '📝', color: 'var(--accent)' };
            const label = node.type === 'markdown' ? 'Text Block' : node.componentType;
            const icon = node.type === 'markdown' ? '📝' : meta.icon;
            
            let previewText = '';
            if (node.type === 'markdown') {
              previewText = node.content?.substring(0, 30) || 'Empty text block';
            } else if (node.props) {
              previewText = node.props.title || node.props.label || node.props.filename || '';
            }

            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(node.id);
                  const el = document.getElementById(`canvas-node-${node.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`outline-item ${isSelected ? 'active' : ''}`}
              >
                <div className="outline-item-meta">
                  <span className="outline-item-icon">{icon}</span>
                  <div className="outline-item-text">
                    <span className="name">{label}</span>
                    {previewText && <span className="preview">{previewText}</span>}
                  </div>
                </div>
                
                <div className="outline-item-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) handleMoveNode(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="outline-action-btn"
                    title="Move Up"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < nodes.length - 1) handleMoveNode(index, index + 1);
                    }}
                    disabled={index === nodes.length - 1}
                    className="outline-action-btn"
                    title="Move Down"
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateNode(node.id);
                    }}
                    className="outline-action-btn"
                    title="Duplicate"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="outline-action-btn danger"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGenericStyles = (selectedNode: EditorNode) => {
    const customStyles = selectedNode.props?.customStyles || {};
    
    const updateStyle = (key: string, value: any) => {
      const currentProps = selectedNode.props || {};
      const currentStyles = currentProps.customStyles || {};
      handleUpdateNode(selectedNode.id, {
        ...currentProps,
        customStyles: {
          ...currentStyles,
          [key]: value === '' ? undefined : value
        }
      });
    };

    return (
      <div className="collapsible-design-section" style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '16px' }}>
        <button
          type="button"
          className="design-section-toggle-btn"
          onClick={() => setDesignStylesExpanded(!designStylesExpanded)}
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.8rem',
            padding: '8px 0',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span>🎨 Box Styles & Design Engine</span>
          <ChevronDown
            size={14}
            style={{
              transform: designStylesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: 'var(--text-sub)'
            }}
          />
        </button>

        {designStylesExpanded && (
          <div className="design-section-content animate-slide-down" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            {/* Grid & Column Layout */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grid & Column Layout</h5>
              
              <div className="inspector-form-field" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem' }}>Block Width (Row Span)</label>
                <select
                  className="inspector-select"
                  value={customStyles.blockWidth || '100'}
                  onChange={(e) => updateStyle('blockWidth', e.target.value)}
                >
                  <option value="100">Full Row (100%)</option>
                  <option value="75">Three-Quarters (75%)</option>
                  <option value="66.66">Two-Thirds (66.7%)</option>
                  <option value="50">Half Row (50%)</option>
                  <option value="33.33">One-Third (33.3%)</option>
                  <option value="25">One-Quarter (25%)</option>
                </select>
              </div>

              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Vertical Align</label>
                  <select
                    className="inspector-select"
                    value={customStyles.verticalAlign || 'stretch'}
                    onChange={(e) => updateStyle('verticalAlign', e.target.value)}
                  >
                    <option value="stretch">Stretch (Height)</option>
                    <option value="flex-start">Top</option>
                    <option value="center">Middle</option>
                    <option value="flex-end">Bottom</option>
                  </select>
                </div>

                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Content Align</label>
                  <select
                    className="inspector-select"
                    value={customStyles.contentAlign || ''}
                    onChange={(e) => updateStyle('contentAlign', e.target.value)}
                  >
                    <option value="">Default (Left)</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colors & Background Media */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Colors & Background Media</h5>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Bg Color</label>
                  <input
                    type="text"
                    className="inspector-input color-picker-input"
                    value={customStyles.bgColor || ''}
                    onChange={(e) => updateStyle('bgColor', e.target.value)}
                    placeholder="#ffffff or transparent"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Text Color Override</label>
                  <input
                    type="text"
                    className="inspector-input color-picker-input"
                    value={customStyles.textColor || ''}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    placeholder="#333333"
                  />
                </div>
              </div>

              <div className="inspector-form-field" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem' }}>Background Image URL</label>
                <input
                  type="text"
                  className="inspector-input"
                  value={customStyles.bgImage || ''}
                  onChange={(e) => updateStyle('bgImage', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Dark Image Overlay (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="inspector-input"
                    value={customStyles.bgOverlay ?? ''}
                    onChange={(e) => updateStyle('bgOverlay', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.4"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Gradient (CSS Formula)</label>
                  <input
                    type="text"
                    className="inspector-input"
                    value={customStyles.bgGradient || ''}
                    onChange={(e) => updateStyle('bgGradient', e.target.value)}
                    placeholder="45deg, #6366f1, #a855f7"
                  />
                </div>
              </div>
            </div>

            {/* Container Max Width */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layout Box Sizing</h5>
              <div className="inspector-form-field" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem' }}>Container Section Width</label>
                <select
                  className="inspector-select"
                  value={customStyles.maxWidth || 'full'}
                  onChange={(e) => updateStyle('maxWidth', e.target.value)}
                >
                  <option value="full">Full Width (100%)</option>
                  <option value="wide">Wide (1200px Centered)</option>
                  <option value="narrow">Narrow (600px Centered)</option>
                  <option value="custom">Custom Width px</option>
                </select>
              </div>
              {customStyles.maxWidth === 'custom' && (
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Custom Max Width (px)</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.customMaxWidth || ''}
                    onChange={(e) => updateStyle('customMaxWidth', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="900"
                  />
                </div>
              )}
            </div>

            {/* Spacing Padding */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paddings (Inner Spacing px)</h5>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Top</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.paddingTop ?? ''}
                    onChange={(e) => updateStyle('paddingTop', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Bottom</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.paddingBottom ?? ''}
                    onChange={(e) => updateStyle('paddingBottom', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Left</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.paddingLeft ?? ''}
                    onChange={(e) => updateStyle('paddingLeft', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Right</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.paddingRight ?? ''}
                    onChange={(e) => updateStyle('paddingRight', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Spacing Margins */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margins (Outer Spacing px)</h5>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Top</label>
                  <input
                    type="text"
                    className="inspector-input"
                    value={customStyles.marginTop ?? ''}
                    onChange={(e) => updateStyle('marginTop', e.target.value)}
                    placeholder="0 or auto"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Bottom</label>
                  <input
                    type="text"
                    className="inspector-input"
                    value={customStyles.marginBottom ?? ''}
                    onChange={(e) => updateStyle('marginBottom', e.target.value)}
                    placeholder="0 or auto"
                  />
                </div>
              </div>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Left</label>
                  <input
                    type="text"
                    className="inspector-input"
                    value={customStyles.marginLeft ?? ''}
                    onChange={(e) => updateStyle('marginLeft', e.target.value)}
                    placeholder="0 or auto"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Right</label>
                  <input
                    type="text"
                    className="inspector-input"
                    value={customStyles.marginRight ?? ''}
                    onChange={(e) => updateStyle('marginRight', e.target.value)}
                    placeholder="0 or auto"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Typography & Fonts</h5>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Font Family</label>
                  <select
                    className="inspector-select"
                    value={customStyles.fontFamily || ''}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  >
                    <option value="">Default Theme</option>
                    <option value="sans">Sans (Inter/Outfit)</option>
                    <option value="serif">Serif (Playfair)</option>
                    <option value="mono">Mono (Grotesk/Code)</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Font Size (px)</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.fontSize ?? ''}
                    onChange={(e) => updateStyle('fontSize', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="16"
                  />
                </div>
              </div>
              
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Font Weight</label>
                  <select
                    className="inspector-select"
                    value={customStyles.fontWeight || ''}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                  >
                    <option value="">Default Weight</option>
                    <option value="300">300 - Light</option>
                    <option value="400">400 - Regular</option>
                    <option value="500">500 - Medium</option>
                    <option value="600">600 - Semibold</option>
                    <option value="700">700 - Bold</option>
                    <option value="800">800 - Extra Bold</option>
                  </select>
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Letter Spacing (px)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="inspector-input"
                    value={customStyles.letterSpacing ?? ''}
                    onChange={(e) => updateStyle('letterSpacing', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Borders & Radii */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Borders & Shadows</h5>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Corner Radius (px)</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.borderRadius ?? ''}
                    onChange={(e) => updateStyle('borderRadius', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Shadow Depth</label>
                  <select
                    className="inspector-select"
                    value={customStyles.boxShadow || 'none'}
                    onChange={(e) => updateStyle('boxShadow', e.target.value)}
                  >
                    <option value="none">Flat (No Shadow)</option>
                    <option value="sm">Subtle Soft</option>
                    <option value="md">Medium Shadow</option>
                    <option value="lg">Floating Elevation</option>
                  </select>
                </div>
              </div>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Border Width (px)</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={customStyles.borderWidth ?? ''}
                    onChange={(e) => updateStyle('borderWidth', e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Border Color</label>
                  <input
                    type="text"
                    className="inspector-input color-picker-input"
                    value={customStyles.borderColor || ''}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    placeholder="#e2e8f0"
                  />
                </div>
              </div>
            </div>

            {/* Hover Effects */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hover Transitions & Effects</h5>
              <div className="inspector-two-col">
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Hover Animation</label>
                  <select
                    className="inspector-select"
                    value={customStyles.hoverEffect || 'none'}
                    onChange={(e) => updateStyle('hoverEffect', e.target.value)}
                  >
                    <option value="none">No Hover Effect</option>
                    <option value="scale">Zoom Up (1.03x)</option>
                    <option value="float">Float Up (-6px)</option>
                    <option value="shadow">Shadow Elevate</option>
                    <option value="border-glow">Accent Border Glow</option>
                  </select>
                </div>
                <div className="inspector-form-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem' }}>Transition Speed</label>
                  <select
                    className="inspector-select"
                    value={customStyles.transitionSpeed || '0.3s'}
                    onChange={(e) => updateStyle('transitionSpeed', e.target.value)}
                  >
                    <option value="0.1s">0.1s - Snappy</option>
                    <option value="0.2s">0.2s - Smooth</option>
                    <option value="0.3s">0.3s - Elegant</option>
                    <option value="0.5s">0.5s - Slow</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom CSS/Classes */}
            <div className="design-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stylesheet Overrides</h5>
              <div className="inspector-form-field" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem' }}>Custom HTML Classes</label>
                <input
                  type="text"
                  className="inspector-input"
                  value={customStyles.customClass || ''}
                  onChange={(e) => updateStyle('customClass', e.target.value)}
                  placeholder="my-custom-class shadow-hover"
                />
              </div>
              <div className="inspector-form-field" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem' }}>Custom Scoped CSS Rules</label>
                <textarea
                  className="inspector-textarea font-mono-editor"
                  value={customStyles.customCss || ''}
                  onChange={(e) => updateStyle('customCss', e.target.value)}
                  placeholder="border: 2px dashed red;&#10;opacity: 0.9;&#10;transition: all 0.3s ease;"
                  rows={4}
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                />
                <span className="field-helper-caption" style={{ fontSize: '0.65rem', color: 'var(--text-sub)', opacity: 0.8 }}>Enter raw CSS declarations to style the block container.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Properties Inspector Builder ───────────────────────────────────────────
  const renderInspector = () => {
    const selectedNode = nodes.find((n) => n.id === selectedId);

    if (!selectedNode) {
      return (
        <div className="inspector-empty-state">
          <div className="empty-icon">🖱️</div>
          <h4>Property Inspector</h4>
          <p>Select any element on the canvas or outline tree to customize its visual styles and text props.</p>
          
          <div style={{ marginTop: '24px', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h5 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Document Outline</h5>
            <div className="inspector-quick-outline">
              {nodes.map((node, index) => {
                const meta = BLOCK_META[node.componentType || ''] || { icon: '📝' };
                const label = node.type === 'markdown' ? 'Text Block' : node.componentType;
                const icon = node.type === 'markdown' ? '📝' : meta.icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedId(node.id);
                      const el = document.getElementById(`canvas-node-${node.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="navigator-quick-btn"
                  >
                    <span>{icon} {label}</span>
                    <ChevronRight size={10} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const props = selectedNode.props || {};
    const updateProp = (key: string, value: any) => {
      handleUpdateNode(selectedNode.id, { ...props, [key]: value });
    };

    const meta = BLOCK_META[selectedNode.componentType || ''] || { icon: '📝', color: 'var(--accent)' };

    if (selectedNode.type === 'markdown') {
      return (
        <div className="inspector-form">
          <div className="inspector-node-header" style={{ borderLeft: '4px solid #6366f1' }}>
            <span className="icon">📝</span>
            <div className="meta">
              <span className="type">Text Block</span>
              <span className="id">ID: {selectedNode.id.substring(0, 8)}...</span>
            </div>
            <button type="button" className="inspector-close-node" onClick={() => setSelectedId(null)}>
              <X size={12} />
            </button>
          </div>

          <div className="inspector-form-field">
            <label>Markdown Editor</label>
            <textarea
              value={selectedNode.content || ''}
              onChange={(e) => handleUpdateNode(selectedNode.id, e.target.value)}
              className="inspector-textarea"
              rows={14}
              placeholder="Type your markdown text here..."
            />
          </div>

          <div className="inspector-helper-card">
            <h5>Markdown Styling Guide</h5>
            <ul>
              <li><code>**bold text**</code></li>
              <li><code>*italic text*</code></li>
              <li><code>~~strikethrough~~</code></li>
              <li><code>==highlight text==</code></li>
              <li><code>`inline code`</code></li>
              <li><code>[Link](url)</code></li>
              <li><code>![Image](url)</code></li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="inspector-form">
        <div className="inspector-node-header" style={{ borderLeft: `4px solid ${meta.color}` }}>
          <span className="icon">{meta.icon}</span>
          <div className="meta">
            <span className="type">{selectedNode.componentType}</span>
            <span className="id">ID: {selectedNode.id.substring(0, 8)}...</span>
          </div>
          <button type="button" className="inspector-close-node" onClick={() => setSelectedId(null)}>
            <X size={12} />
          </button>
        </div>

        <div className="inspector-fields-wrapper">
          {(() => {
            switch (selectedNode.componentType) {
              case 'HeroBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Style Variant</label>
                      <select
                        value={props.variant || 'gradient'}
                        onChange={(e) => updateProp('variant', e.target.value)}
                        className="inspector-select"
                      >
                        <option value="gradient">Gradient Background</option>
                        <option value="light">Classic Light</option>
                        <option value="dark">Sleek Dark</option>
                        <option value="minimal">Minimalist White</option>
                      </select>
                    </div>
                    <div className="inspector-form-field">
                      <label>Badge Label</label>
                      <input
                        type="text"
                        value={props.badgeText || ''}
                        onChange={(e) => updateProp('badgeText', e.target.value)}
                        className="inspector-input"
                        placeholder="✨ New Release"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Headline Title</label>
                      <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className="inspector-input"
                        placeholder="Build Something Amazing"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Subtitle / Description</label>
                      <textarea
                        value={props.subtitle || ''}
                        onChange={(e) => updateProp('subtitle', e.target.value)}
                        className="inspector-textarea"
                        rows={3}
                        placeholder="A short powerful description..."
                      />
                    </div>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Primary Button Text</label>
                        <input
                          type="text"
                          value={props.ctaText || ''}
                          onChange={(e) => updateProp('ctaText', e.target.value)}
                          className="inspector-input"
                          placeholder="Get Started"
                        />
                      </div>
                      <div className="inspector-form-field">
                        <label>Primary Button URL</label>
                        <input
                          type="text"
                          value={props.ctaUrl || ''}
                          onChange={(e) => updateProp('ctaUrl', e.target.value)}
                          className="inspector-input"
                          placeholder="#"
                        />
                      </div>
                    </div>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Secondary Button Text</label>
                        <input
                          type="text"
                          value={props.secondaryText || ''}
                          onChange={(e) => updateProp('secondaryText', e.target.value)}
                          className="inspector-input"
                          placeholder="Learn More"
                        />
                      </div>
                      <div className="inspector-form-field">
                        <label>Secondary Button URL</label>
                        <input
                          type="text"
                          value={props.secondaryUrl || ''}
                          onChange={(e) => updateProp('secondaryUrl', e.target.value)}
                          className="inspector-input"
                          placeholder="#"
                        />
                      </div>
                    </div>
                  </>
                );

              case 'Card':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Image Position Layout</label>
                      <select
                        value={props.imageLayout || 'top'}
                        onChange={(e) => updateProp('imageLayout', e.target.value)}
                        className="inspector-select"
                      >
                        <option value="top">Image on Top</option>
                        <option value="left">Image on Left</option>
                        <option value="right">Image on Right</option>
                        <option value="none">No Image</option>
                      </select>
                    </div>
                    <div className="inspector-form-field">
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={props.image || ''}
                        onChange={(e) => updateProp('image', e.target.value)}
                        className="inspector-input"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Tag / Badge</label>
                      <input
                        type="text"
                        value={props.tag || ''}
                        onChange={(e) => updateProp('tag', e.target.value)}
                        className="inspector-input"
                        placeholder="Category tag"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Card Title</label>
                      <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className="inspector-input"
                        placeholder="Card Title"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Description Body</label>
                      <textarea
                        value={props.description || ''}
                        onChange={(e) => updateProp('description', e.target.value)}
                        className="inspector-textarea"
                        rows={4}
                        placeholder="Card description text..."
                      />
                    </div>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Link Label</label>
                        <input
                          type="text"
                          value={props.linkLabel || ''}
                          onChange={(e) => updateProp('linkLabel', e.target.value)}
                          className="inspector-input"
                          placeholder="Read more"
                        />
                      </div>
                      <div className="inspector-form-field">
                        <label>Link URL</label>
                        <input
                          type="text"
                          value={props.linkUrl || ''}
                          onChange={(e) => updateProp('linkUrl', e.target.value)}
                          className="inspector-input"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </>
                );

              case 'CalloutBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Variant / Level</label>
                      <select
                        value={props.variant || 'info'}
                        onChange={(e) => updateProp('variant', e.target.value)}
                        className="inspector-select"
                      >
                        <option value="info">ℹ️ Info (Indigo)</option>
                        <option value="warning">⚠️ Warning (Amber)</option>
                        <option value="success">✅ Success (Green)</option>
                        <option value="danger">🚨 Danger (Red)</option>
                      </select>
                    </div>
                    <div className="inspector-form-field">
                      <label>Alert Prefix Label</label>
                      <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className="inspector-input"
                        placeholder="Note:"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Alert Message</label>
                      <textarea
                        value={props.message || ''}
                        onChange={(e) => updateProp('message', e.target.value)}
                        className="inspector-textarea"
                        rows={4}
                        placeholder="Alert description details..."
                      />
                    </div>
                  </>
                );

              case 'ButtonBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={props.label || ''}
                        onChange={(e) => updateProp('label', e.target.value)}
                        className="inspector-input"
                        placeholder="Click here"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Link URL</label>
                      <input
                        type="text"
                        value={props.url || ''}
                        onChange={(e) => updateProp('url', e.target.value)}
                        className="inspector-input"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Style Variant</label>
                        <select
                          value={props.variant || 'primary'}
                          onChange={(e) => updateProp('variant', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="primary">Primary Accent</option>
                          <option value="secondary">Secondary Dark</option>
                          <option value="outline">Outline Border</option>
                        </select>
                      </div>
                      <div className="inspector-form-field">
                        <label>Button Size</label>
                        <select
                          value={props.size || 'md'}
                          onChange={(e) => updateProp('size', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                        </select>
                      </div>
                    </div>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Alignment</label>
                        <select
                          value={props.align || 'center'}
                          onChange={(e) => updateProp('align', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="left">Left Align</option>
                          <option value="center">Center Align</option>
                          <option value="right">Right Align</option>
                        </select>
                      </div>
                      <div className="inspector-form-field">
                        <label>Icon</label>
                        <input
                          type="text"
                          value={props.icon || ''}
                          onChange={(e) => updateProp('icon', e.target.value)}
                          className="inspector-input"
                          placeholder="🚀"
                        />
                      </div>
                    </div>
                    <div className="inspector-checkbox-group">
                      <input
                        type="checkbox"
                        id="inspector-btn-newtab"
                        checked={props.openNewTab || false}
                        onChange={(e) => updateProp('openNewTab', e.target.checked)}
                      />
                      <label htmlFor="inspector-btn-newtab">Open URL in new tab</label>
                    </div>
                  </>
                );

              case 'CodeBlock':
                return (
                  <>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>File Label</label>
                        <input
                          type="text"
                          value={props.filename || ''}
                          onChange={(e) => updateProp('filename', e.target.value)}
                          className="inspector-input"
                          placeholder="filename.js"
                        />
                      </div>
                      <div className="inspector-form-field">
                        <label>Syntax Type</label>
                        <select
                          value={props.language || 'javascript'}
                          onChange={(e) => updateProp('language', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="python">Python</option>
                          <option value="json">JSON</option>
                          <option value="shell">Shell/Bash</option>
                        </select>
                      </div>
                    </div>
                    <div className="inspector-form-field">
                      <label>Code Snippet</label>
                      <textarea
                        value={props.code || ''}
                        onChange={(e) => updateProp('code', e.target.value)}
                        className="inspector-textarea code-font"
                        rows={10}
                        placeholder="// Write code here..."
                      />
                    </div>
                    <div className="inspector-checkbox-group">
                      <input
                        type="checkbox"
                        id="inspector-code-linenum"
                        checked={props.showLineNumbers !== false}
                        onChange={(e) => updateProp('showLineNumbers', e.target.checked)}
                      />
                      <label htmlFor="inspector-code-linenum">Display line numbers</label>
                    </div>
                  </>
                );

              case 'ImageBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Image Source Link</label>
                      <input
                        type="text"
                        value={props.src || ''}
                        onChange={(e) => updateProp('src', e.target.value)}
                        className="inspector-input"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Alt Accessibility Text</label>
                      <input
                        type="text"
                        value={props.alt || ''}
                        onChange={(e) => updateProp('alt', e.target.value)}
                        className="inspector-input"
                        placeholder="Image description"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Figcaption Title</label>
                      <input
                        type="text"
                        value={props.caption || ''}
                        onChange={(e) => updateProp('caption', e.target.value)}
                        className="inspector-input"
                        placeholder="Caption under the image"
                      />
                    </div>
                  </>
                );

              case 'DividerBlock':
                return (
                  <>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Border Style</label>
                        <select
                          value={props.style || 'gradient'}
                          onChange={(e) => updateProp('style', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="solid">Plain Solid</option>
                          <option value="dashed">Dashed Line</option>
                          <option value="gradient">Modern Gradient</option>
                        </select>
                      </div>
                      <div className="inspector-form-field">
                        <label>Line Weight</label>
                        <select
                          value={props.weight || 'normal'}
                          onChange={(e) => updateProp('weight', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="thin">Thin (1px)</option>
                          <option value="normal">Normal (2px)</option>
                          <option value="thick">Thick (4px)</option>
                        </select>
                      </div>
                    </div>
                    <div className="inspector-form-field">
                      <label>Center Separator Text</label>
                      <input
                        type="text"
                        value={props.text || ''}
                        onChange={(e) => updateProp('text', e.target.value)}
                        className="inspector-input"
                        placeholder="Section Title"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Vertical Margins</label>
                      <select
                        value={props.spacing || 'md'}
                        onChange={(e) => updateProp('spacing', e.target.value)}
                        className="inspector-select"
                      >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </div>
                  </>
                );

              case 'Accordion':
                return (
                  <>
                    <label className="inspector-form-label">Accordion FAQ Elements</label>
                    <div className="inspector-list-builder">
                      {(props.items || []).map((item: any, i: number) => (
                        <div key={i} className="list-builder-card">
                          <div className="card-header">
                            <span>FAQ Item #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...props.items];
                                newItems.splice(i, 1);
                                updateProp('items', newItems);
                              }}
                              className="list-delete-btn"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                          <div className="card-fields">
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => {
                                const newItems = [...props.items];
                                newItems[i] = { ...item, title: e.target.value };
                                updateProp('items', newItems);
                              }}
                              className="inspector-input"
                              placeholder="Accordion Title / Header"
                            />
                            <textarea
                              value={item.content || ''}
                              onChange={(e) => {
                                const newItems = [...props.items];
                                newItems[i] = { ...item, content: e.target.value };
                                updateProp('items', newItems);
                              }}
                              className="inspector-textarea"
                              rows={3}
                              placeholder="Accordion Content Details..."
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...(props.items || [])];
                          newItems.push({ title: 'New Accordion Question', content: 'Answer text content.' });
                          updateProp('items', newItems);
                        }}
                        className="list-add-btn"
                      >
                        <Plus size={11} /> Add Accordion Item
                      </button>
                    </div>
                  </>
                );

              case 'TestimonialRow':
                return (
                  <>
                    <label className="inspector-form-label">Customer Testimonials</label>
                    <div className="inspector-list-builder">
                      {(props.testimonials || []).map((item: any, i: number) => (
                        <div key={i} className="list-builder-card">
                          <div className="card-header">
                            <span>Reviewer #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newTest = [...props.testimonials];
                                newTest.splice(i, 1);
                                updateProp('testimonials', newTest);
                              }}
                              className="list-delete-btn"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                          <div className="card-fields">
                            <input
                              type="text"
                              value={item.name || ''}
                              onChange={(e) => {
                                const newTest = [...props.testimonials];
                                newTest[i] = { ...item, name: e.target.value };
                                updateProp('testimonials', newTest);
                              }}
                              className="inspector-input"
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={item.image || ''}
                              onChange={(e) => {
                                const newTest = [...props.testimonials];
                                newTest[i] = { ...item, image: e.target.value };
                                updateProp('testimonials', newTest);
                              }}
                              className="inspector-input"
                              placeholder="Avatar Image URL"
                            />
                            <textarea
                              value={item.text || ''}
                              onChange={(e) => {
                                const newTest = [...props.testimonials];
                                newTest[i] = { ...item, text: e.target.value };
                                updateProp('testimonials', newTest);
                              }}
                              className="inspector-textarea"
                              rows={3}
                              placeholder="Testimonial Quote text..."
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newTest = [...(props.testimonials || [])];
                          newTest.push({ name: 'Jane Miller', text: 'Stunning visual layout options!', image: '' });
                          updateProp('testimonials', newTest);
                        }}
                        className="list-add-btn"
                      >
                        <Plus size={11} /> Add Testimonial Card
                      </button>
                    </div>
                  </>
                );

              case 'StatsBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Grid Section Title</label>
                      <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className="inspector-input"
                        placeholder="Trusted by Millions"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Grid Section Subtitle</label>
                      <input
                        type="text"
                        value={props.subtitle || ''}
                        onChange={(e) => updateProp('subtitle', e.target.value)}
                        className="inspector-input"
                        placeholder="Metric details"
                      />
                    </div>
                    <label className="inspector-form-label">Data Grid Items</label>
                    <div className="inspector-list-builder">
                      {(props.stats || []).map((item: any, i: number) => (
                        <div key={i} className="list-builder-card">
                          <div className="card-header">
                            <span>Stat Metric #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newStats = [...props.stats];
                                newStats.splice(i, 1);
                                updateProp('stats', newStats);
                              }}
                              className="list-delete-btn"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                          <div className="card-fields grid-2x2">
                            <input
                              type="text"
                              value={item.prefix || ''}
                              onChange={(e) => {
                                const newStats = [...props.stats];
                                newStats[i] = { ...item, prefix: e.target.value };
                                updateProp('stats', newStats);
                              }}
                              className="inspector-input"
                              placeholder="Prefix (⭐)"
                            />
                            <input
                              type="text"
                              value={item.value || ''}
                              onChange={(e) => {
                                const newStats = [...props.stats];
                                newStats[i] = { ...item, value: e.target.value };
                                updateProp('stats', newStats);
                              }}
                              className="inspector-input"
                              placeholder="Value (99)"
                            />
                            <input
                              type="text"
                              value={item.suffix || ''}
                              onChange={(e) => {
                                const newStats = [...props.stats];
                                newStats[i] = { ...item, suffix: e.target.value };
                                updateProp('stats', newStats);
                              }}
                              className="inspector-input"
                              placeholder="Suffix (%)"
                            />
                            <input
                              type="text"
                              value={item.label || ''}
                              onChange={(e) => {
                                const newStats = [...props.stats];
                                newStats[i] = { ...item, label: e.target.value };
                                updateProp('stats', newStats);
                              }}
                              className="inspector-input"
                              placeholder="Label Name"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newStats = [...(props.stats || [])];
                          newStats.push({ value: '150', label: 'Completed projects', suffix: '+' });
                          updateProp('stats', newStats);
                        }}
                        className="list-add-btn"
                      >
                        <Plus size={11} /> Add Stat Item
                      </button>
                    </div>
                  </>
                );

              case 'NavBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Branding Logo Text</label>
                      <input
                        type="text"
                        value={props.logoText || ''}
                        onChange={(e) => updateProp('logoText', e.target.value)}
                        className="inspector-input"
                        placeholder="NextEditor"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Logo Target URL</label>
                      <input
                        type="text"
                        value={props.logoUrl || ''}
                        onChange={(e) => updateProp('logoUrl', e.target.value)}
                        className="inspector-input"
                        placeholder="/"
                      />
                    </div>
                    <div className="inspector-form-field checkbox-field">
                      <input
                        type="checkbox"
                        checked={!!props.sticky}
                        onChange={(e) => updateProp('sticky', e.target.checked)}
                        id="nav-sticky-check"
                      />
                      <label htmlFor="nav-sticky-check">Sticky Header Menu Bar (Stays on scroll)</label>
                    </div>

                    <label className="inspector-form-label">Header Navigation Links</label>
                    <div className="inspector-list-builder">
                      {(props.links || []).map((link: any, i: number) => (
                        <div key={i} className="list-builder-card">
                          <div className="card-header">
                            <span>Navigation Menu Link #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newLinks = [...props.links];
                                newLinks.splice(i, 1);
                                updateProp('links', newLinks);
                              }}
                              className="list-delete-btn"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                          <div className="card-fields">
                            <input
                              type="text"
                              value={link.label || ''}
                              onChange={(e) => {
                                const newLinks = [...props.links];
                                newLinks[i] = { ...link, label: e.target.value };
                                updateProp('links', newLinks);
                              }}
                              className="inspector-input"
                              placeholder="Link Label (e.g. Pricing)"
                            />
                            <input
                              type="text"
                              value={link.url || ''}
                              onChange={(e) => {
                                const newLinks = [...props.links];
                                newLinks[i] = { ...link, url: e.target.value };
                                updateProp('links', newLinks);
                              }}
                              className="inspector-input"
                              placeholder="URL Link (e.g. #pricing)"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks = [...(props.links || [])];
                          newLinks.push({ label: 'New Link', url: '#' });
                          updateProp('links', newLinks);
                        }}
                        className="list-add-btn"
                      >
                        <Plus size={11} /> Add Menu Item
                      </button>
                    </div>

                    <div className="inspector-form-field">
                      <label>Call-to-Action CTA Button Text</label>
                      <input
                        type="text"
                        value={props.ctaLabel || ''}
                        onChange={(e) => updateProp('ctaLabel', e.target.value)}
                        className="inspector-input"
                        placeholder="Get Started"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>CTA Button URL</label>
                      <input
                        type="text"
                        value={props.ctaUrl || ''}
                        onChange={(e) => updateProp('ctaUrl', e.target.value)}
                        className="inspector-input"
                        placeholder="#contact"
                      />
                    </div>
                  </>
                );

              case 'FooterBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Footer Brand Text</label>
                      <input
                        type="text"
                        value={props.logoText || ''}
                        onChange={(e) => updateProp('logoText', e.target.value)}
                        className="inspector-input"
                        placeholder="NextEditor"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Copyright Notice Line</label>
                      <input
                        type="text"
                        value={props.copyrightText || ''}
                        onChange={(e) => updateProp('copyrightText', e.target.value)}
                        className="inspector-input"
                        placeholder="© 2026 NextEditor. All rights reserved."
                      />
                    </div>

                    <label className="inspector-form-label">Footer Links Directories</label>
                    <div className="inspector-list-builder">
                      {(props.columns || []).map((col: any, cIdx: number) => (
                        <div key={cIdx} className="list-builder-card" style={{ borderLeft: '3px solid var(--accent)' }}>
                          <div className="card-header">
                            <span>Category Column #{cIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newCols = [...props.columns];
                                newCols.splice(cIdx, 1);
                                updateProp('columns', newCols);
                              }}
                              className="list-delete-btn"
                            >
                              <Trash2 size={11} /> Remove Column
                            </button>
                          </div>
                          <div className="card-fields">
                            <label className="sub-label">Column Header</label>
                            <input
                              type="text"
                              value={col.title || ''}
                              onChange={(e) => {
                                const newCols = [...props.columns];
                                newCols[cIdx] = { ...col, title: e.target.value };
                                updateProp('columns', newCols);
                              }}
                              className="inspector-input"
                              placeholder="Product, Company, etc."
                            />
                            
                            <label className="sub-label">Column Links</label>
                            {(col.links || []).map((link: any, lIdx: number) => (
                              <div key={lIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                <input
                                  type="text"
                                  value={link.label || ''}
                                  onChange={(e) => {
                                    const newCols = [...props.columns];
                                    const newLinks = [...col.links];
                                    newLinks[lIdx] = { ...link, label: e.target.value };
                                    newCols[cIdx] = { ...col, links: newLinks };
                                    updateProp('columns', newCols);
                                  }}
                                  className="inspector-input"
                                  placeholder="Label"
                                  style={{ flex: 1, fontSize: '0.75rem', height: '24px', padding: '2px 6px' }}
                                />
                                <input
                                  type="text"
                                  value={link.url || ''}
                                  onChange={(e) => {
                                    const newCols = [...props.columns];
                                    const newLinks = [...col.links];
                                    newLinks[lIdx] = { ...link, url: e.target.value };
                                    newCols[cIdx] = { ...col, links: newLinks };
                                    updateProp('columns', newCols);
                                  }}
                                  className="inspector-input"
                                  placeholder="URL"
                                  style={{ flex: 1, fontSize: '0.75rem', height: '24px', padding: '2px 6px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCols = [...props.columns];
                                    const newLinks = [...col.links];
                                    newLinks.splice(lIdx, 1);
                                    newCols[cIdx] = { ...col, links: newLinks };
                                    updateProp('columns', newCols);
                                  }}
                                  className="node-delete-btn"
                                  style={{ padding: '0 4px', height: '24px' }}
                                  title="Delete Link"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newCols = [...props.columns];
                                const newLinks = [...(col.links || [])];
                                newLinks.push({ label: 'New Link', url: '#' });
                                newCols[cIdx] = { ...col, links: newLinks };
                                updateProp('columns', newCols);
                              }}
                              className="list-add-btn"
                              style={{ padding: '2px 8px', fontSize: '0.7rem', width: 'auto', alignSelf: 'flex-start', marginTop: '4px' }}
                            >
                              + Add Link
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newCols = [...(props.columns || [])];
                          newCols.push({ title: 'Resources', links: [{ label: 'Help', url: '#' }] });
                          updateProp('columns', newCols);
                        }}
                        className="list-add-btn"
                      >
                        <Plus size={11} /> Add Directory Column
                      </button>
                    </div>
                  </>
                );

              case 'ColumnsBlock':
                return (
                  <>
                    <div className="inspector-two-col">
                      <div className="inspector-form-field">
                        <label>Columns Layout Grid</label>
                        <select
                          value={props.layout || '1-1'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newCols = [...props.columns];
                            const targetCount = val === '1' ? 1 : val === '1-1-1' ? 3 : val === '1-1-1-1' ? 4 : 2;
                            while (newCols.length < targetCount) {
                              newCols.push({ type: 'markdown', content: '### Column\nNew column content.' });
                            }
                            if (newCols.length > targetCount) {
                              newCols.splice(targetCount);
                            }
                            handleUpdateNode(selectedNode.id, { ...props, layout: val, columns: newCols });
                          }}
                          className="inspector-select"
                        >
                          <option value="1">1 Full Width Column</option>
                          <option value="1-1">2 Equal Columns (50/50)</option>
                          <option value="1-2">2 Columns (33/66 Layout)</option>
                          <option value="2-1">2 Columns (66/33 Layout)</option>
                          <option value="1-1-1">3 Equal Columns (33/33/33)</option>
                          <option value="1-1-1-1">4 Equal Columns (25/25/25/25)</option>
                        </select>
                      </div>
                      <div className="inspector-form-field">
                        <label>Row Column Gap</label>
                        <select
                          value={props.gap || 'md'}
                          onChange={(e) => updateProp('gap', e.target.value)}
                          className="inspector-select"
                        >
                          <option value="sm">Small Spacing</option>
                          <option value="md">Default Medium</option>
                          <option value="lg">Large Spacing</option>
                          <option value="xl">Extra Large</option>
                        </select>
                      </div>
                    </div>

                    <div className="inspector-form-field">
                      <label>Vertical Alignment</label>
                      <select
                        value={props.align || 'stretch'}
                        onChange={(e) => updateProp('align', e.target.value)}
                        className="inspector-select"
                      >
                        <option value="top">Align Top</option>
                        <option value="center">Center Align</option>
                        <option value="bottom">Align Bottom</option>
                        <option value="stretch">Stretch (Full Height)</option>
                      </select>
                    </div>

                    <label className="inspector-form-label">Columns Grid Content & Box Styles</label>
                    <div className="inspector-list-builder">
                      {(props.columns || []).map((col: any, idx: number) => {
                        const isExpanded = activeColumnSubPanel === `${selectedNode.id}-col-${idx}`;
                        return (
                          <div key={idx} className="list-builder-card" style={{ marginBottom: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div 
                              className="card-header" 
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-app)', cursor: 'pointer' }}
                              onClick={() => setActiveColumnSubPanel(isExpanded ? null : `${selectedNode.id}-col-${idx}`)}
                            >
                              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Column #{idx + 1} ({col.type === 'custom' ? '🚀 Custom' : col.type === 'image' ? '🖼️ Image' : '📝 Text'})</span>
                              <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                            </div>
                            
                            {isExpanded && (
                              <div className="card-fields" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                                <div className="inspector-form-field" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '0.7rem' }}>Column Type</label>
                                  <select
                                    value={col.type}
                                    onChange={(e) => {
                                      const newCols = [...props.columns];
                                      newCols[idx] = { ...col, type: e.target.value };
                                      updateProp('columns', newCols);
                                    }}
                                    className="inspector-select"
                                  >
                                    <option value="markdown">📝 Standard Markdown Text</option>
                                    <option value="image">🖼️ Simple Image Column</option>
                                    <option value="custom">🚀 Custom Rich Layout Box</option>
                                  </select>
                                </div>
                                
                                {col.type === 'image' && (
                                  <>
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.7rem' }}>Image URL</label>
                                      <input
                                        type="text"
                                        value={col.src || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, src: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="Image Direct URL (https://...)"
                                      />
                                    </div>
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.7rem' }}>Alt Text</label>
                                      <input
                                        type="text"
                                        value={col.alt || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, alt: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="Alternative description text"
                                      />
                                    </div>
                                  </>
                                )}

                                {col.type === 'markdown' && (
                                  <div className="inspector-form-field" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '0.7rem' }}>Body Markdown</label>
                                    <textarea
                                      value={col.content || ''}
                                      onChange={(e) => {
                                        const newCols = [...props.columns];
                                        newCols[idx] = { ...col, content: e.target.value };
                                        updateProp('columns', newCols);
                                      }}
                                      className="inspector-textarea font-mono-editor"
                                      rows={5}
                                      placeholder="Write markdown here..."
                                    />
                                  </div>
                                )}

                                {col.type === 'custom' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--accent)', paddingLeft: '8px' }}>
                                    <div className="inspector-two-col">
                                      <div className="inspector-form-field" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>Icon/Emoji Badge</label>
                                        <input
                                          type="text"
                                          value={col.iconEmoji || ''}
                                          onChange={(e) => {
                                            const newCols = [...props.columns];
                                            newCols[idx] = { ...col, iconEmoji: e.target.value };
                                            updateProp('columns', newCols);
                                          }}
                                          className="inspector-input"
                                          placeholder="🚀 or ✨"
                                        />
                                      </div>
                                      <div className="inspector-form-field" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>Card Heading Title</label>
                                        <input
                                          type="text"
                                          value={col.title || ''}
                                          onChange={(e) => {
                                            const newCols = [...props.columns];
                                            newCols[idx] = { ...col, title: e.target.value };
                                            updateProp('columns', newCols);
                                          }}
                                          className="inspector-input"
                                          placeholder="Column Card Title"
                                        />
                                      </div>
                                    </div>

                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.7rem' }}>Image URL</label>
                                      <input
                                        type="text"
                                        value={col.src || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, src: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="Optional Card Image URL"
                                      />
                                    </div>

                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.7rem' }}>Body Description</label>
                                      <textarea
                                        value={col.content || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, content: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-textarea"
                                        rows={3}
                                        placeholder="Supports **markdown** description..."
                                      />
                                    </div>

                                    <div className="inspector-two-col">
                                      <div className="inspector-form-field" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>Button Text</label>
                                        <input
                                          type="text"
                                          value={col.btnLabel || ''}
                                          onChange={(e) => {
                                            const newCols = [...props.columns];
                                            newCols[idx] = { ...col, btnLabel: e.target.value };
                                            updateProp('columns', newCols);
                                          }}
                                          className="inspector-input"
                                          placeholder="CTA Button Label"
                                        />
                                      </div>
                                      <div className="inspector-form-field" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>Button Link</label>
                                        <input
                                          type="text"
                                          value={col.btnUrl || ''}
                                          onChange={(e) => {
                                            const newCols = [...props.columns];
                                            newCols[idx] = { ...col, btnUrl: e.target.value };
                                            updateProp('columns', newCols);
                                          }}
                                          className="inspector-input"
                                          placeholder="#signup"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.7rem' }}>Button Style Variant</label>
                                      <select
                                        value={col.btnVariant || 'primary'}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, btnVariant: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-select"
                                      >
                                        <option value="primary">Primary (Accent Solid)</option>
                                        <option value="secondary">Secondary (Card Gray)</option>
                                        <option value="outline">Outline (Transparent Accent)</option>
                                      </select>
                                    </div>
                                  </div>
                                )}

                                {/* Column Design Settings */}
                                <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '6px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-sub)' }}>🎨 Column Card Styling</span>
                                  
                                  <div className="inspector-two-col">
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.65rem' }}>Bg Color</label>
                                      <input
                                        type="text"
                                        value={col.bgColor || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, bgColor: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="#f8fafc or transparent"
                                      />
                                    </div>
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.65rem' }}>Text Color</label>
                                      <input
                                        type="text"
                                        value={col.textColor || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, textColor: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="#0f172a"
                                      />
                                    </div>
                                  </div>

                                  <div className="inspector-two-col">
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.65rem' }}>Border Radius</label>
                                      <input
                                        type="number"
                                        value={col.borderRadius ?? ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, borderRadius: e.target.value === '' ? '' : parseInt(e.target.value) };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="8"
                                      />
                                    </div>
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.65rem' }}>Shadow</label>
                                      <select
                                        value={col.boxShadow || 'none'}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, boxShadow: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-select"
                                      >
                                        <option value="none">Flat</option>
                                        <option value="sm">Soft</option>
                                        <option value="md">Medium</option>
                                        <option value="lg">Floating</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="inspector-two-col">
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.65rem' }}>Border Width</label>
                                      <input
                                        type="number"
                                        value={col.borderWidth ?? ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, borderWidth: e.target.value === '' ? '' : parseInt(e.target.value) };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="inspector-form-field" style={{ margin: 0 }}>
                                      <label style={{ fontSize: '0.65rem' }}>Border Color</label>
                                      <input
                                        type="text"
                                        value={col.borderColor || ''}
                                        onChange={(e) => {
                                          const newCols = [...props.columns];
                                          newCols[idx] = { ...col, borderColor: e.target.value };
                                          updateProp('columns', newCols);
                                        }}
                                        className="inspector-input"
                                        placeholder="#e2e8f0"
                                      />
                                    </div>
                                  </div>

                                  <div className="inspector-form-field" style={{ margin: '6px 0 0 0' }}>
                                    <label style={{ fontSize: '0.65rem' }}>Column Padding (e.g., 20px, 12px)</label>
                                    <input
                                      type="text"
                                      value={col.padding || ''}
                                      onChange={(e) => {
                                        const newCols = [...props.columns];
                                        newCols[idx] = { ...col, padding: e.target.value };
                                        updateProp('columns', newCols);
                                      }}
                                      className="inspector-input"
                                      placeholder="e.g. 16px or 20"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );

              case 'PricingBlock':
                return (
                  <>
                    <div className="inspector-form-field">
                      <label>Section Section Title</label>
                      <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className="inspector-input"
                        placeholder="Plans & Pricing"
                      />
                    </div>
                    <div className="inspector-form-field">
                      <label>Section Subtitle</label>
                      <input
                        type="text"
                        value={props.subtitle || ''}
                        onChange={(e) => updateProp('subtitle', e.target.value)}
                        className="inspector-input"
                        placeholder="Choose the perfect fit"
                      />
                    </div>

                    <label className="inspector-form-label">Subscription Pricing Plans</label>
                    <div className="inspector-list-builder">
                      {(props.plans || []).map((plan: any, idx: number) => (
                        <div key={idx} className="list-builder-card" style={{ borderLeft: plan.popular ? '3px solid var(--accent)' : undefined }}>
                          <div className="card-header">
                            <span style={{ fontWeight: plan.popular ? 700 : undefined }}>
                              {plan.popular ? '🔥 ' : ''}Plan Tier #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newPlans = [...props.plans];
                                newPlans.splice(idx, 1);
                                updateProp('plans', newPlans);
                              }}
                              className="list-delete-btn"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                          
                          <div className="card-fields">
                            <div className="inspector-two-col">
                              <input
                                type="text"
                                value={plan.name || ''}
                                onChange={(e) => {
                                  const newPlans = [...props.plans];
                                  newPlans[idx] = { ...plan, name: e.target.value };
                                  updateProp('plans', newPlans);
                                }}
                                className="inspector-input"
                                placeholder="Starter Plan"
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="checkbox"
                                  checked={!!plan.popular}
                                  onChange={(e) => {
                                    const newPlans = [...props.plans];
                                    newPlans[idx] = { ...plan, popular: e.target.checked };
                                    updateProp('plans', newPlans);
                                  }}
                                  id={`plan-pop-${idx}`}
                                />
                                <label htmlFor={`plan-pop-${idx}`} style={{ margin: 0, fontSize: '0.75rem' }}>Popular Choice</label>
                              </div>
                            </div>

                            <div className="inspector-two-col">
                              <input
                                type="text"
                                value={plan.price || ''}
                                onChange={(e) => {
                                  const newPlans = [...props.plans];
                                  newPlans[idx] = { ...plan, price: e.target.value };
                                  updateProp('plans', newPlans);
                                }}
                                className="inspector-input"
                                placeholder="Price ($29)"
                              />
                              <input
                                type="text"
                                value={plan.period || ''}
                                onChange={(e) => {
                                  const newPlans = [...props.plans];
                                  newPlans[idx] = { ...plan, period: e.target.value };
                                  updateProp('plans', newPlans);
                                }}
                                className="inspector-input"
                                placeholder="Period (mo)"
                              />
                            </div>

                            <label className="sub-label">Plan Features List</label>
                            {(plan.features || []).map((feat: string, fIdx: number) => (
                              <div key={fIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                <input
                                  type="text"
                                  value={feat}
                                  onChange={(e) => {
                                    const newPlans = [...props.plans];
                                    const newFeats = [...plan.features];
                                    newFeats[fIdx] = e.target.value;
                                    newPlans[idx] = { ...plan, features: newFeats };
                                    updateProp('plans', newPlans);
                                  }}
                                  className="inspector-input"
                                  placeholder="Feature line"
                                  style={{ flex: 1, fontSize: '0.75rem', height: '24px', padding: '2px 6px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPlans = [...props.plans];
                                    const newFeats = [...plan.features];
                                    newFeats.splice(fIdx, 1);
                                    newPlans[idx] = { ...plan, features: newFeats };
                                    updateProp('plans', newPlans);
                                  }}
                                  className="node-delete-btn"
                                  style={{ padding: '0 4px', height: '24px' }}
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newPlans = [...props.plans];
                                const newFeats = [...(plan.features || [])];
                                newFeats.push('New custom feature');
                                newPlans[idx] = { ...plan, features: newFeats };
                                updateProp('plans', newPlans);
                              }}
                              className="list-add-btn"
                              style={{ padding: '2px 8px', fontSize: '0.7rem', width: 'auto', alignSelf: 'flex-start', marginTop: '4px' }}
                            >
                              + Add Feature
                            </button>

                            <div className="inspector-two-col" style={{ marginTop: '10px' }}>
                              <input
                                type="text"
                                value={plan.ctaText || ''}
                                onChange={(e) => {
                                  const newPlans = [...props.plans];
                                  newPlans[idx] = { ...plan, ctaText: e.target.value };
                                  updateProp('plans', newPlans);
                                }}
                                className="inspector-input"
                                placeholder="Button Text (Get Started)"
                              />
                              <input
                                type="text"
                                value={plan.ctaUrl || ''}
                                onChange={(e) => {
                                  const newPlans = [...props.plans];
                                  newPlans[idx] = { ...plan, ctaUrl: e.target.value };
                                  updateProp('plans', newPlans);
                                }}
                                className="inspector-input"
                                placeholder="Button URL (#)"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newPlans = [...(props.plans || [])];
                          newPlans.push({
                            name: 'Enterprise Plus',
                            price: 'Custom',
                            period: 'yr',
                            features: ['All Pro features', 'SSO & SLA logs', 'Custom development support'],
                            ctaText: 'Contact Sales',
                            ctaUrl: '#contact',
                            popular: false
                          });
                          updateProp('plans', newPlans);
                        }}
                        className="list-add-btn"
                      >
                        <Plus size={11} /> Add Plan Tier
                      </button>
                    </div>
                  </>
                );

              case 'TextBlock':
                return (
                  <div className="inspector-form-field">
                    <label>Content Markdown Editor</label>
                    <textarea
                      value={props.content || ''}
                      onChange={(e) => updateProp('content', e.target.value)}
                      className="inspector-textarea font-mono-editor"
                      rows={14}
                      placeholder="Type your markdown text here..."
                    />
                  </div>
                );

              default:
                return (
                  <div style={{ padding: '8px', opacity: 0.6 }}>
                    No inspector fields mapped for: <strong>{selectedNode.componentType}</strong>
                  </div>
                );
            }
          })()}

          {/* ── GENERIC DESIGN & STYLES INSPECTOR ────────────────────────────── */}
          {renderGenericStyles(selectedNode)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="apidog-layout-shell">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-sub)' }}>
          <Sparkles size={20} className="spark-rotating" />
          <span>Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="apidog-layout-shell">
      <div className="apidog-editor-card builder-3column-layout">

        {/* ── TOP HEADER / CONTROLS BAR ─────────────────────────────────────── */}
        <div className="apidog-tabs-bar builder-header-bar">
          <div className="builder-header-left">
            <LinkComponent href="/" className="status-bar-back-btn" title="Back to homepage">
              <ArrowLeft size={16} />
            </LinkComponent>
            <div className="header-page-title-wrap">
              <span className={`tab-method-badge ${pageStatus === 'draft' ? 'draft' : ''}`}>
                {pageStatus.toUpperCase()}
              </span>
              <h3 className="active-doc-title">{title}</h3>
              <span className="active-doc-slug"><code>{slug}</code></span>
            </div>
          </div>

          <div className="apidog-tabs-actions">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="apidog-tab-save-btn"
              title="Ctrl+S"
            >
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`apidog-tab-preview-btn ${isPreviewMode ? 'active' : ''}`}
              title="Toggle design mode/preview mode"
              style={{
                backgroundColor: isPreviewMode ? 'var(--accent, #6366f1)' : undefined,
                color: isPreviewMode ? '#ffffff' : undefined,
              }}
            >
              {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />} {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="apidog-tab-preview-btn"
              title="Export Next.js component code"
            >
              <FileCode size={14} /> Get Code
            </button>
            <a
              href={slug}
              target="_blank"
              rel="noopener noreferrer"
              className="apidog-tab-preview-btn"
            >
              <Eye size={14} /> View Live
            </a>
          </div>
        </div>

        {/* ── SPLIT WORKSPACE (3-COLUMN LAYOUT) ─────────────────────────────── */}
        <div 
          className="apidog-workspace-split builder-workspace-split"
          style={{ gridTemplateColumns: isPreviewMode ? '1fr' : '320px 1fr 340px' }}
        >

          {/* ── COLUMN 1: LEFT CONTROL CENTER ───────────────────────────────── */}
          {!isPreviewMode && (
            <div className="apidog-left-editor-panel builder-left-panel">
            
            {/* Sidebar drawer switcher tab icons */}
            <div className="builder-sidebar-switcher">
              {(['pages', 'blocks', 'seo', 'markdown', 'export'] as const).map((tab) => {
                const label = tab === 'pages' ? 'Pages' : tab === 'blocks' ? 'Blocks' : tab === 'seo' ? 'Settings' : tab === 'markdown' ? 'Markdown' : 'Export';
                const icon = tab === 'pages' ? <Files size={15} /> : tab === 'blocks' ? <Plus size={15} /> : tab === 'seo' ? <Settings size={15} /> : tab === 'markdown' ? <FileText size={15} /> : <FileCode size={15} />;
                return (
                  <button
                    key={tab}
                    type="button"
                    className={`sidebar-switch-tab ${activeLeftTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveLeftTab(tab)}
                    title={label}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="builder-sidebar-tab-content-wrapper">

              {/* 1. PAGES TAB */}
              {activeLeftTab === 'pages' && (
                <div className="sidebar-tab-content pages-list-panel">
                  <h4 className="sidebar-section-title">Pages Directory</h4>
                  <div className="panel-search-bar">
                    <Search size={13} className="search-icon" />
                    <input
                      type="text"
                      value={pagesFilter}
                      onChange={(e) => setPagesFilter(e.target.value)}
                      placeholder="Search pages..."
                      className="pages-search-input"
                    />
                  </div>
                  <div className="pages-list">
                    {pages
                      .filter(p => p.title.toLowerCase().includes(pagesFilter.toLowerCase()) || p.slug.toLowerCase().includes(pagesFilter.toLowerCase()))
                      .map((p) => {
                        const isActive = p.slug === slug;
                        return (
                          <div
                            key={p.slug}
                            onClick={() => selectPage(p)}
                            className={`sidebar-page-item ${isActive ? 'active' : ''}`}
                          >
                            <div className="page-meta">
                              <span className="page-title">{p.title}</span>
                              <code className="page-slug">{p.slug}</code>
                            </div>
                            <span className={`page-status-badge ${p.status === 'draft' ? 'draft' : 'published'}`}>
                              {p.status === 'draft' ? 'Draft' : 'Live'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewPageModal(true)}
                    className="sidebar-add-page-btn"
                  >
                    <Plus size={14} /> Create New Page
                  </button>
                </div>
              )}

              {/* 2. BLOCKS TAB (ELEMENT LIBRARY) */}
              {activeLeftTab === 'blocks' && (
                <div className="sidebar-tab-content blocks-library-panel">
                  <h4 className="sidebar-section-title">Block Library</h4>
                  <p className="sidebar-section-desc">Click on any visual block to insert it.</p>
                  <div className="blocks-categories-list">
                    {/* Text Block */}
                    <div className="library-category">
                      <div className="category-header">
                        <span>✍️ Standard Elements</span>
                      </div>
                      <div className="category-items-grid">
                        <button
                          type="button"
                          onClick={() => handleInsertBlock('markdown')}
                          className="library-block-card text-block-card"
                        >
                          <span className="block-card-icon">📝</span>
                          <span className="block-card-title">Text Block</span>
                          <span className="block-card-desc">Rich markdown text block with titles, lists, formatting, etc.</span>
                        </button>
                      </div>
                    </div>

                    {componentCategories.map((cat) => (
                      <div key={cat.key} className="library-category">
                        <div className="category-header">
                          <span>{cat.icon} {cat.label}</span>
                        </div>
                        <div className="category-items-grid">
                          {cat.types.map((t) => {
                            const def = componentDefinitions[t];
                            if (!def) return null;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleInsertBlock(t)}
                                className="library-block-card"
                              >
                                <span className="block-card-icon">{def.icon}</span>
                                <span className="block-card-title">{def.name}</span>
                                <span className="block-card-desc">{def.description}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. SEO & PAGE SETTINGS TAB */}
              {activeLeftTab === 'seo' && (
                <div className="sidebar-tab-content editor-seo-settings-panel" style={{ padding: '16px' }}>
                  <div className="seo-section-block" style={{ padding: 0, border: 'none', background: 'none' }}>
                    <h3 className="settings-section-title" style={{ marginTop: 0 }}>Content Type</h3>
                    <div className="content-type-toggle">
                      <button
                        type="button"
                        className={`ctype-btn ${pageType === 'page' ? 'active' : ''}`}
                        onClick={() => setPageType('page')}
                      >
                        📄 Page
                      </button>
                      <button
                        type="button"
                        className={`ctype-btn ${pageType === 'blog' ? 'active' : ''}`}
                        onClick={() => setPageType('blog')}
                      >
                        ✍️ Blog Post
                      </button>
                    </div>
                  </div>

                  <div className="seo-section-block" style={{ padding: '12px 0 0 0', background: 'none', border: 'none' }}>
                    <h3 className="settings-section-title">Routing & Metadata</h3>
                    <div className="settings-form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter page title"
                        className="settings-text-input"
                      />
                    </div>
                    <div className="settings-form-group">
                      <label>URL Path Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="/slug"
                        className="settings-text-input"
                        disabled={slug === '/welcome'}
                      />
                    </div>
                    <div className="settings-form-group">
                      <label>Meta Description / Excerpt</label>
                      <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Short summary for SEO..."
                        className="settings-text-input"
                        rows={3}
                      />
                    </div>
                    <div className="settings-form-group">
                      <label>Publish Status</label>
                      <div className="status-toggle-group">
                        {(['draft', 'published'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`status-toggle-btn ${pageStatus === s ? 'active' : ''}`}
                            onClick={() => setPageStatus(s)}
                          >
                            {s === 'draft' ? '🔒 Draft' : '🌐 Published'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {pageType === 'blog' && (
                    <div className="seo-section-block" style={{ padding: '12px 0 0 0', background: 'none', border: 'none' }}>
                      <h3 className="settings-section-title">Blog Configurations</h3>
                      <div className="settings-form-group">
                        <label>Featured Image URL</label>
                        <input
                          type="url"
                          value={featuredImage}
                          onChange={(e) => setFeaturedImage(e.target.value)}
                          placeholder="https://..."
                          className="settings-text-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label>Category</label>
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Tech, Lifestyle..."
                          className="settings-text-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label>Publish Date</label>
                        <input
                          type="date"
                          value={postDate}
                          onChange={(e) => setPostDate(e.target.value)}
                          className="settings-text-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label>Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="nextjs, cms, editor"
                          className="settings-text-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label>Author Name</label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="John Doe"
                          className="settings-text-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label>Author Avatar URL</label>
                        <input
                          type="url"
                          value={authorImage}
                          onChange={(e) => setAuthorImage(e.target.value)}
                          placeholder="https://..."
                          className="settings-text-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label>Author Biography</label>
                        <textarea
                          value={authorBio}
                          onChange={(e) => setAuthorBio(e.target.value)}
                          placeholder="Short bio details..."
                          className="settings-text-input"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <div className="settings-danger-zone" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <h4 style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Danger Zone</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Once deleted, this document is gone forever.</p>
                    <button
                      type="button"
                      onClick={handleDeletePage}
                      disabled={slug === '/welcome' || slug === '/'}
                      className="danger-delete-btn"
                      style={{ padding: '6px 12px', fontSize: '0.72rem', width: '100%' }}
                    >
                      Delete Page
                    </button>
                  </div>
                </div>
              )}

              {/* 4. RAW MARKDOWN SOURCE TAB */}
              {activeLeftTab === 'markdown' && (
                <div className="sidebar-tab-content raw-markdown-editor-pane">
                  {/* Formatting toolbar */}
                  <div className="apidog-formatting-toolbar">
                    <div className="toolbar-group">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); handleUndo(); }} disabled={!canUndo} title="Undo" className="toolbar-btn"><Undo2 size={12} /></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); handleRedo(); }} disabled={!canRedo} title="Redo" className="toolbar-btn"><Redo2 size={12} /></button>
                    </div>
                    <div className="toolbar-separator" />
                    <div className="toolbar-group">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('# ', ''); }} title="H1" className="toolbar-btn"><Heading1 size={12} /></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('## ', ''); }} title="H2" className="toolbar-btn"><Heading2 size={12} /></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('### ', ''); }} title="H3" className="toolbar-btn"><Heading3 size={12} /></button>
                    </div>
                    <div className="toolbar-separator" />
                    <div className="toolbar-group">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('**', '**'); }} title="Bold" className="toolbar-btn"><Bold size={12} /></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('*', '*'); }} title="Italic" className="toolbar-btn"><Italic size={12} /></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('`', '`'); }} title="Code" className="toolbar-btn"><Code size={12} /></button>
                    </div>
                    <div className="toolbar-separator" />
                    <div className="toolbar-group">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertAtCursor('[', '](url)'); }} title="Link" className="toolbar-btn"><LinkIcon size={12} /></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTable(); }} title="Table" className="toolbar-btn"><Table size={12} /></button>
                    </div>
                    <div className="toolbar-group" style={{ marginLeft: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        title={isPreviewMode ? "Exit Preview" : "Enter Preview"}
                        className={`toolbar-btn ${isPreviewMode ? 'active' : ''}`}
                      >
                        {isPreviewMode ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFindReplace(!showFindReplace)}
                        title="Search"
                        className={`toolbar-btn ${showFindReplace ? 'active' : ''}`}
                      >
                        <Search size={12} />
                      </button>
                    </div>
                  </div>

                  {showFindReplace && (
                    <div className="find-replace-bar">
                      <div className="find-replace-row">
                        <input type="text" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find..." className="find-replace-input" />
                        <span className="find-count">{occurrences > 0 ? `${occurrences} found` : ''}</span>
                      </div>
                      <div className="find-replace-row">
                        <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace..." className="find-replace-input" />
                        <button type="button" onClick={handleReplaceOne} className="find-replace-btn">One</button>
                        <button type="button" onClick={handleReplace} className="find-replace-btn">All</button>
                      </div>
                    </div>
                  )}

                  {/* Lines gutter and textarea */}
                  <div className="apidog-editor-textarea-container">
                    <div ref={gutterRef} className="editor-gutter">
                      {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                        <div key={i} className="gutter-line-number">{i + 1}</div>
                      ))}
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={markdown}
                      onChange={(e) => handleMarkdownChange(e.target.value)}
                      onScroll={handleTextareaScroll}
                      onKeyDown={handleTextareaKeyDown}
                      className="apidog-editor-textarea"
                      placeholder="# Edit markdown text directly..."
                      spellCheck={false}
                    />
                  </div>

                  <div className="apidog-editor-stats-footer">
                    <span>Words: {wordCount}</span>
                    <span>Lines: {lineCount}</span>
                    <span>Chars: {charCount}</span>
                  </div>
                </div>
              )}

              {/* 5. CODE EXPORT TAB */}
              {activeLeftTab === 'export' && (
                <div className="sidebar-tab-content editor-export-code-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
                  <div className="export-panel-header" style={{ marginBottom: '12px' }}>
                    <h4 className="sidebar-section-title" style={{ margin: 0 }}>Generated React Code</h4>
                    <p className="sidebar-section-desc" style={{ marginBottom: '8px' }}>Fully compiled and imports-resolved Next.js page.</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generateNextJsCode());
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="export-copy-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%', textAlign: 'center' }}
                    >
                      {copied ? '✓ Copied!' : 'Copy Code Output'}
                    </button>
                  </div>
                  <pre className="export-code-display" style={{ flex: 1, fontSize: '0.7rem' }}>
                    <code>{generateNextJsCode()}</code>
                  </pre>
                </div>
              )}

            </div>
          </div>
          )}

          {/* ── COLUMN 2: CENTER VIEWPORT STAGING CANVAS ─────────────────────── */}
          <div className="apidog-right-preview-panel builder-center-canvas-panel">
            
            {/* Device Layout Switcher */}
            <div className="apidog-preview-subheader builder-canvas-header">
              <div className="preview-device-switcher">
                <button
                  type="button"
                  className={`device-btn ${canvasDevice === 'desktop' ? 'active' : ''}`}
                  onClick={() => setCanvasDevice('desktop')}
                  title="Desktop 100%"
                >
                  <Monitor size={13} />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  className={`device-btn ${canvasDevice === 'tablet' ? 'active' : ''}`}
                  onClick={() => setCanvasDevice('tablet')}
                  title="Tablet 768px"
                >
                  <Tablet size={13} />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  className={`device-btn ${canvasDevice === 'mobile' ? 'active' : ''}`}
                  onClick={() => setCanvasDevice('mobile')}
                  title="Mobile 400px"
                >
                  <Smartphone size={13} />
                  <span>Mobile</span>
                </button>
              </div>
              <span className="canvas-badge">
                {canvasDevice === 'desktop' ? '🖥️ Default Viewport' : canvasDevice === 'tablet' ? '📱 Tablet Layout' : '📱 Mobile Layout'}
              </span>
            </div>

            {/* Canvas Scroll Area */}
            <div
              className={`apidog-preview-canvas-container device-${canvasDevice}`}
              onClick={() => setSelectedId(null)}
            >
              <div className="apidog-preview-stage">
                {nodes.length === 0 ? (
                  <div className="apidog-empty-preview-state">
                    <Sparkles size={36} className="spark-rotating" />
                    <h4>Visual Staging Area</h4>
                    <p>No elements found on this page. Add blocks from the library on the left sidebar to start building.</p>
                  </div>
                ) : (
                  nodes.map((node, index) => {
                    const isSelected = selectedId === node.id;

                    if (node.type === 'markdown') {
                      if (isPreviewMode) {
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
                      const isDragOverTarget = dragOverIndex === index;
                      return (
                        <div
                          key={node.id}
                          id={`canvas-node-${node.id}`}
                          className={`editor-markdown-node-wrapper ${isSelected ? 'selected' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, index)}
                          style={{ 
                            width: '100%', 
                            flex: '0 0 100%', 
                            maxWidth: '100%', 
                            boxSizing: 'border-box',
                            border: isDragOverTarget ? '2px dashed var(--accent, #6366f1)' : undefined,
                            backgroundColor: isDragOverTarget ? 'rgba(99, 102, 241, 0.04)' : undefined,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div className="markdown-node-badge">
                            <GripVertical size={11} className="grip-drag-icon" />
                            <span>📝 Text Block</span>
                            <div className="node-quick-actions" style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDuplicateNode(node.id); }}
                                className="node-delete-btn"
                                title="Duplicate"
                                style={{ color: 'var(--text-sub)' }}
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                                className="node-delete-btn"
                                title="Delete"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                          <MarkdownTextRenderer
                            content={node.content || ''}
                            isEditable={isSelected}
                            onChange={(newContent) => handleUpdateNode(node.id, newContent)}
                          />
                        </div>
                      );
                    }

                    const styleSettings = node.props?.customStyles || {};
                    const blockWidth = styleSettings.blockWidth || '100';
                    const verticalAlign = styleSettings.verticalAlign || 'stretch';
                    const isDragOverTarget = dragOverIndex === index;
                    
                    const outerStyle: React.CSSProperties = {
                      width: `${blockWidth}%`,
                      flex: `0 0 ${blockWidth}%`,
                      maxWidth: `${blockWidth}%`,
                      boxSizing: 'border-box',
                      alignSelf: verticalAlign === 'stretch' ? 'stretch' : verticalAlign,
                      transition: 'all 0.2s ease',
                    };
                    if (blockWidth !== '100') {
                      outerStyle.padding = '8px';
                    }

                    if (isPreviewMode) {
                      return (
                        <div key={node.id} style={outerStyle}>
                          <DraggableBlock
                            id={node.id}
                            type={node.componentType || ''}
                            props={node.props}
                            index={index}
                            total={nodes.length}
                            isSelected={false}
                            onSelect={() => {}}
                            onMove={() => {}}
                            onDelete={() => {}}
                            onUpdateProps={() => {}}
                            onDragStart={() => {}}
                            onDragOver={() => {}}
                            onDrop={() => {}}
                            isPreviewMode={true}
                          />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={node.id}
                        id={`canvas-node-${node.id}`}
                        className={`draggable-block-outer-wrapper ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }}
                        style={outerStyle}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div style={{
                          border: isDragOverTarget ? '2px dashed var(--accent, #6366f1)' : '2px solid transparent',
                          borderRadius: '8px',
                          backgroundColor: isDragOverTarget ? 'rgba(99, 102, 241, 0.04)' : undefined,
                          transition: 'all 0.2s ease',
                          height: '100%'
                        }}>
                          <DraggableBlock
                            id={node.id}
                            type={node.componentType || ''}
                            props={node.props}
                            index={index}
                            total={nodes.length}
                            isSelected={isSelected}
                            onSelect={() => setSelectedId(node.id)}
                            onMove={handleMoveNode}
                            onDelete={() => handleDeleteNode(node.id)}
                            onDuplicate={() => handleDuplicateNode(node.id)}
                            onUpdateProps={(newProps) => handleUpdateNode(node.id, newProps)}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── COLUMN 3: RIGHT PROPERTIES INSPECTOR & OUTLINE ───────────────── */}
          {!isPreviewMode && (
            <div className="apidog-right-inspector-sidebar builder-right-panel">
            <div className="inspector-tabs-bar">
              <button
                type="button"
                className={`inspector-tab-btn ${activeRightTab === 'inspector' ? 'active' : ''}`}
                onClick={() => setActiveRightTab('inspector')}
              >
                <Settings size={13} />
                <span>Inspector</span>
              </button>
              <button
                type="button"
                className={`inspector-tab-btn ${activeRightTab === 'outline' ? 'active' : ''}`}
                onClick={() => setActiveRightTab('outline')}
              >
                <Layers size={13} />
                <span>Outline</span>
              </button>
            </div>

            <div className="inspector-panel-content">
              {activeRightTab === 'inspector' ? (
                renderInspector()
              ) : (
                renderOutline()
              )}
            </div>
          </div>
          )}

        </div>

        {/* ── STATUS FOOTER BAR ─────────────────────────────────────────────── */}
        <div className="apidog-status-bar">
          <div className="status-bar-left">
            <span>Editing Draft: <strong>{slug}</strong></span>
          </div>
          <div className="status-bar-right">
            <div className="status-indicator">
              <span className="status-dot green" />
              <span>Workspace Sync Active</span>
            </div>
            <div className="status-divider" />
            <div className="status-item">
              <Activity size={12} />
              <span>NextEditor v3 Professional</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── NEW PAGE CREATION MODAL ─────────────────────────────────────────── */}
      {showNewPageModal && (
        <div className="apidog-modal-overlay">
          <div className="apidog-modal-card">
            <div className="modal-header">
              <h3>Create New Document</h3>
              <button type="button" className="close-btn" onClick={() => setShowNewPageModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreatePageSubmit} className="modal-body">
              <div className="modal-form-group">
                <label>Page slug / path URL</label>
                <input
                  type="text"
                  placeholder="/about or /blog/my-post"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Services"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Choose Page Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="blank">📄 Blank Page (Simple title header)</option>
                  <option value="landing">🚀 Landing Page Preset (Hero + Features Grid + CTA + Footer)</option>
                  <option value="pricing">🏷️ Pricing & FAQs Preset (Navbar + Plan Cards + Stats + Accordion)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNewPageModal(false)} className="modal-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit" disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── NEXT.JS EXPORT DIALOG MODAL ─────────────────────────────────────── */}
      {showExportModal && (
        <div className="apidog-modal-overlay">
          <div className="apidog-modal-card" style={{ maxWidth: '820px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={18} /> Export Next.js Code Component
              </h3>
              <button type="button" className="close-btn" onClick={() => setShowExportModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ gap: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                Copy below into any Next.js app directory file (e.g.{' '}
                <code>app/about/page.tsx</code>). Imports are auto-generated.
              </p>
              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '16px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'auto',
                  maxHeight: '400px',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}>
                  {generateNextJsCode()}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateNextJsCode());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: copied ? 'var(--success)' : 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '12px' }}>
              <button type="button" onClick={() => setShowExportModal(false)} className="modal-btn-submit">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ALERT ──────────────────────────────────────────────────────── */}
      {message && (
        <div className={`apidog-alert-toast ${message.type}`}>
          <AlertCircle size={15} />
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="toast-close">&times;</button>
        </div>
      )}
    </div>
  );
}
