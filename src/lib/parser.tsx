import React from 'react';

export interface EditorNode {
  id: string;
  type: 'markdown' | 'component';
  componentType?: string;
  content?: string;
  props?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
//  parseMarkdownToNodes – splits markdown + :::Block::: sections into nodes
// ─────────────────────────────────────────────────────────────────────────────
export function parseMarkdownToNodes(markdown: string): EditorNode[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const nodes: EditorNode[] = [];
  let currentMarkdownLines: string[] = [];
  let inComponent = false;
  let componentType = '';
  let componentJsonLines: string[] = [];
  let nodeIndex = 0;

  const flushMarkdown = () => {
    const text = currentMarkdownLines.join('\n').trim();
    if (text) {
      nodes.push({
        id: `node-${nodeIndex++}`,
        type: 'markdown',
        content: currentMarkdownLines.join('\n'),
      });
    }
    currentMarkdownLines = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith(':::')) {
      if (!inComponent) {
        flushMarkdown();
        inComponent = true;
        componentType = line.trim().slice(3).trim();
        componentJsonLines = [];
      } else {
        inComponent = false;
        try {
          const props = JSON.parse(componentJsonLines.join('\n').trim() || '{}');
          nodes.push({ id: `node-${nodeIndex++}`, type: 'component', componentType, props });
        } catch {
          nodes.push({
            id: `node-${nodeIndex++}`,
            type: 'component',
            componentType,
            props: { error: 'Invalid JSON', rawText: componentJsonLines.join('\n') },
          });
        }
      }
    } else {
      if (inComponent) componentJsonLines.push(line);
      else currentMarkdownLines.push(line);
    }
  }

  flushMarkdown();
  return nodes;
}

// ─────────────────────────────────────────────────────────────────────────────
//  nodesToMarkdown – reassemble nodes back into raw markdown string
// ─────────────────────────────────────────────────────────────────────────────
export function nodesToMarkdown(nodes: EditorNode[]): string {
  return nodes
    .map((n) =>
      n.type === 'markdown'
        ? (n.content ?? '')
        : `:::${n.componentType}\n${JSON.stringify(n.props, null, 2)}\n:::`
    )
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
//  parseInlineMarkdown – SINGLE-PASS TOKENIZER (production-grade)
//
//  Handles:  ***bold-italic***  |  **bold**  |  *italic*  |  _italic_
//            ~~strike~~  |  ==highlight==  |  ^superscript^  |  ~subscript~
//            `inline-code`  |  ![alt](url)  |  [text](url)
//            bare http/https auto-links  |  \n → <br>
// ─────────────────────────────────────────────────────────────────────────────

// Token types – ordered by priority
const PATTERNS: Array<{
  name: string;
  re: RegExp;
  render: (m: RegExpExecArray, key: string) => React.ReactNode;
}> = [
  // Bold-Italic: ***text***
  {
    name: 'bolditalic',
    re: /\*{3}([^*]+?)\*{3}/,
    render: (m, k) => <strong key={k}><em>{parseInlineMarkdown(m[1])}</em></strong>,
  },
  // Bold: **text** or __text__
  {
    name: 'bold',
    re: /\*{2}([^*]+?)\*{2}|__([^_]+?)__/,
    render: (m, k) => <strong key={k}>{parseInlineMarkdown(m[1] ?? m[2])}</strong>,
  },
  // Italic: *text* or _text_
  {
    name: 'italic',
    re: /\*([^*]+?)\*|(?<![a-zA-Z0-9])_([^_]+?)_(?![a-zA-Z0-9])/,
    render: (m, k) => <em key={k}>{parseInlineMarkdown(m[1] ?? m[2])}</em>,
  },
  // Strikethrough: ~~text~~
  {
    name: 'strike',
    re: /~~([^~]+?)~~/,
    render: (m, k) => <del key={k}>{parseInlineMarkdown(m[1])}</del>,
  },
  // Highlight: ==text==
  {
    name: 'highlight',
    re: /==([^=]+?)==/,
    render: (m, k) => <mark key={k} className="inline-highlight">{m[1]}</mark>,
  },
  // Superscript: ^text^
  {
    name: 'sup',
    re: /\^([^^\n]+?)\^/,
    render: (m, k) => <sup key={k}>{m[1]}</sup>,
  },
  // Subscript: ~text~ (single tilde, not inside ~~)
  {
    name: 'sub',
    re: /(?<!~)~([^~\n]+?)~(?!~)/,
    render: (m, k) => <sub key={k}>{m[1]}</sub>,
  },
  // Inline code: `text`
  {
    name: 'code',
    re: /`([^`]+?)`/,
    render: (m, k) => <code key={k} className="inline-code-badge">{m[1]}</code>,
  },
  // Inline image: ![alt](url "title"?)
  {
    name: 'image',
    re: /!\[([^\]]*?)\]\(([^)\s]+?)(?:\s+"([^"]*)")?\)/,
    render: (m, k) => (
      <img
        key={k}
        src={m[2]}
        alt={m[1]}
        title={m[3]}
        className="inline-md-img"
        loading="lazy"
      />
    ),
  },
  // Link: [text](url "title"?)
  {
    name: 'link',
    re: /\[([^\]]+?)\]\(([^)\s]+?)(?:\s+"([^"]*)")?\)/,
    render: (m, k) => (
      <a
        key={k}
        href={m[2]}
        title={m[3]}
        className="preview-inline-link"
        target={m[2].startsWith('http') ? '_blank' : undefined}
        rel={m[2].startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {parseInlineMarkdown(m[1])}
      </a>
    ),
  },
  // Auto-link: bare https?:// URL
  {
    name: 'autolink',
    re: /https?:\/\/[^\s<>"')\]]+/,
    render: (m, k) => (
      <a
        key={k}
        href={m[0]}
        className="preview-inline-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {m[0]}
      </a>
    ),
  },
];

let _inlineKey = 0;
function nextKey() {
  return `il-${_inlineKey++}`;
}

export function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Handle explicit line-break: two spaces + newline
  if (text.includes('\n')) {
    const parts = text.split('\n');
    const nodes: React.ReactNode[] = [];
    parts.forEach((part, i) => {
      nodes.push(parseInlineMarkdown(part));
      if (i < parts.length - 1) nodes.push(<br key={`br-${i}`} />);
    });
    return (
      <>
        {nodes.map((node, i) => (
          <React.Fragment key={`ln-${i}`}>{node}</React.Fragment>
        ))}
      </>
    );
  }

  // Single-pass: scan left-to-right, find the earliest match
  let remaining = text;
  const segments: React.ReactNode[] = [];

  while (remaining.length > 0) {
    let earliest: { index: number; match: RegExpExecArray; pattern: typeof PATTERNS[0] } | null = null;

    for (const pattern of PATTERNS) {
      // Use exec on remaining string (anchored-equivalent by tracking offset)
      const re = new RegExp(pattern.re.source, 'u');
      const m = re.exec(remaining);
      if (m !== null) {
        if (earliest === null || m.index < earliest.index) {
          earliest = { index: m.index, match: m, pattern };
        }
      }
    }

    if (earliest === null) {
      // No more patterns – rest is plain text
      segments.push(remaining);
      break;
    }

    // Text before the match
    if (earliest.index > 0) {
      segments.push(remaining.slice(0, earliest.index));
    }

    // Render the matched token
    segments.push(earliest.pattern.render(earliest.match, nextKey()));

    // Advance past the match
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  if (segments.length === 0) return null;
  if (segments.length === 1) return segments[0];
  return (
    <>
      {segments.map((seg, i) => (
        <React.Fragment key={`seg-${i}`}>{seg}</React.Fragment>
      ))}
    </>
  );
}
