'use client';

import React, { useRef, useEffect } from 'react';
import { parseInlineMarkdown } from '@/lib/parser';

interface MarkdownTextRendererProps {
  content: string;
  isEditable?: boolean;
  onChange?: (newContent: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Block-level parser
// ─────────────────────────────────────────────────────────────────────────────
function parseBlocks(rawLines: string[], prefix = ''): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // ── Skip empty ────────────────────────────────────────────────────────────
    if (!trimmed) {
      elements.push(<div key={`${prefix}sp-${i}`} className="md-spacer" />);
      i++;
      continue;
    }

    // ── Headings ─────────────────────────────────────────────────────────────
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const id = headingMatch[2].toLowerCase().replace(/[^\w]+/g, '-');
      const inner = parseInlineMarkdown(headingMatch[2]);
      const cn = `md-h${level}`;
      elements.push(
        level === 1 ? <h1 key={`${prefix}h1-${i}`} id={id} className={cn}>{inner}</h1>
        : level === 2 ? <h2 key={`${prefix}h2-${i}`} id={id} className={cn}>{inner}</h2>
        : level === 3 ? <h3 key={`${prefix}h3-${i}`} id={id} className={cn}>{inner}</h3>
        : level === 4 ? <h4 key={`${prefix}h4-${i}`} id={id} className={cn}>{inner}</h4>
        : level === 5 ? <h5 key={`${prefix}h5-${i}`} id={id} className={cn}>{inner}</h5>
        : <h6 key={`${prefix}h6-${i}`} id={id} className={cn}>{inner}</h6>
      );
      i++;
      continue;
    }

    // ── Horizontal Rule ───────────────────────────────────────────────────────
    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      elements.push(<hr key={`${prefix}hr-${i}`} className="md-hr" />);
      i++;
      continue;
    }

    // ── Fenced code block ─────────────────────────────────────────────────────
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      i++; // consume closing ```
      const codeStr = codeLines.join('\n');
      elements.push(
        <div key={`${prefix}cb-${i}`} className="md-fenced-code">
          {lang && <span className="md-code-lang-badge">{lang}</span>}
          <pre className="md-code-pre"><code>{codeStr}</code></pre>
          <button
            type="button"
            className="md-code-copy-btn"
            onClick={() => navigator.clipboard.writeText(codeStr)}
          >
            Copy
          </button>
        </div>
      );
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (trimmed.startsWith('> ')) {
      const bqLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
        bqLines.push(rawLines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote key={`${prefix}bq-${i}`} className="md-blockquote">
          {parseBlocks(bqLines, `${prefix}bq${i}-`)}
        </blockquote>
      );
      continue;
    }

    // ── Alert blockquote: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT] ──
    if (trimmed.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i)) {
      const typeMatch = trimmed.match(/\[!(\w+)\]/i);
      const alertType = typeMatch ? typeMatch[1].toLowerCase() : 'note';
      const alertLines: string[] = [];
      // first line after type marker
      const firstLine = trimmed.replace(/^>\s*\[!\w+\]\s*/, '');
      if (firstLine) alertLines.push(firstLine);
      i++;
      while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
        alertLines.push(rawLines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const alertIcons: Record<string, string> = {
        note: 'ℹ️', tip: '💡', warning: '⚠️', important: '📌', caution: '🔥',
      };
      elements.push(
        <div key={`${prefix}alert-${i}`} className={`md-alert md-alert--${alertType}`}>
          <div className="md-alert-title">
            <span className="md-alert-icon">{alertIcons[alertType] || 'ℹ️'}</span>
            <span>{alertType.toUpperCase()}</span>
          </div>
          <div className="md-alert-body">
            {alertLines.map((l, li) => (
              <p key={li}>{parseInlineMarkdown(l)}</p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // ── Definition list: term\n: definition ───────────────────────────────────
    if (i + 1 < rawLines.length && rawLines[i + 1].trim().startsWith(': ')) {
      const dlItems: React.ReactNode[] = [];
      while (i < rawLines.length && i + 1 < rawLines.length && rawLines[i + 1]?.trim().startsWith(': ')) {
        const term = rawLines[i].trim();
        const def = rawLines[i + 1].trim().slice(2);
        dlItems.push(
          <React.Fragment key={i}>
            <dt className="md-dt">{parseInlineMarkdown(term)}</dt>
            <dd className="md-dd">{parseInlineMarkdown(def)}</dd>
          </React.Fragment>
        );
        i += 2;
      }
      elements.push(<dl key={`${prefix}dl-${i}`} className="md-dl">{dlItems}</dl>);
      continue;
    }

    // ── Table ─────────────────────────────────────────────────────────────────
    if (trimmed.includes('|') && i + 1 < rawLines.length && /^\|?[\s\-:]+\|/.test(rawLines[i + 1])) {
      const parseCells = (row: string) =>
        row.split('|').map((cell) => cell.trim()).filter((cell, ci, arr) => ci > 0 || arr.length > 2 ? true : cell !== '');
      const headers = parseCells(trimmed);
      i += 2; // skip header + separator row

      // Parse alignment from separator
      const sepRow = rawLines[i - 1];
      const alignments = sepRow.split('|').filter((cell) => cell.trim()).map((cell) => {
        const ct = cell.trim();
        if (ct.startsWith(':') && ct.endsWith(':')) return 'center';
        if (ct.endsWith(':')) return 'right';
        return 'left';
      });

      const rows: string[][] = [];
      while (i < rawLines.length && rawLines[i].trim().includes('|') && rawLines[i].trim() !== '') {
        rows.push(parseCells(rawLines[i]));
        i++;
      }

      elements.push(
        <div key={`${prefix}tbl-${i}`} className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                {headers.map((h, ci) => (
                  <th key={ci} style={{ textAlign: alignments[ci] as any || 'left' }}>
                    {parseInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ textAlign: alignments[ci] as any || 'left' }}>
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Standalone image: ![alt](url) ─────────────────────────────────────────
    const imgOnly = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*"([^"]*)")?$/);
    if (imgOnly) {
      elements.push(
        <figure key={`${prefix}fig-${i}`} className="md-figure">
          <img src={imgOnly[2]} alt={imgOnly[1]} className="md-img" loading="lazy" />
          {imgOnly[1] && <figcaption className="md-figcaption">{imgOnly[1]}</figcaption>}
        </figure>
      );
      i++;
      continue;
    }

    // ── Unordered list (includes nested + task list) ───────────────────────────
    if (/^[-*+]\s/.test(trimmed)) {
      const listItems = collectListItems(rawLines, i, false);
      i += listItems.lineCount;
      elements.push(
        <ul key={`${prefix}ul-${i}`} className="md-ul">
          {listItems.nodes}
        </ul>
      );
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────────
    if (/^\d+[.)]\s/.test(trimmed)) {
      const startNum = parseInt(trimmed.match(/^(\d+)/)![1], 10);
      const listItems = collectListItems(rawLines, i, true);
      i += listItems.lineCount;
      elements.push(
        <ol key={`${prefix}ol-${i}`} className="md-ol" start={startNum}>
          {listItems.nodes}
        </ol>
      );
      continue;
    }

    // ── Footnote definition: [^1]: text ──────────────────────────────────────
    const fnMatch = trimmed.match(/^\[\^([^\]]+)\]:\s*(.+)$/);
    if (fnMatch) {
      elements.push(
        <div key={`${prefix}fn-${i}`} className="md-footnote-def" id={`fn-${fnMatch[1]}`}>
          <sup className="md-fn-num">{fnMatch[1]}</sup>
          <span className="md-fn-text">{parseInlineMarkdown(fnMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // ── Paragraph: collect contiguous content lines ───────────────────────────
    const paraLines: string[] = [];
    while (i < rawLines.length) {
      const t = rawLines[i].trim();
      if (!t) break;
      if (
        /^#{1,6}\s/.test(t) ||
        t.startsWith('> ') ||
        t.startsWith('```') ||
        /^[-*+]\s/.test(t) ||
        /^\d+[.)]\s/.test(t) ||
        /^(---+|\*\*\*+|___+)$/.test(t) ||
        /^!\[[^\]]*\]\([^)]+\)$/.test(t) ||
        /^\[\^[^\]]+\]:\s/.test(t) ||
        (t.includes('|') && i + 1 < rawLines.length && /^\|?[\s\-:]+\|/.test(rawLines[i + 1]))
      ) break;
      paraLines.push(rawLines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p key={`${prefix}p-${i}`} className="md-p">
          {parseInlineMarkdown(paraLines.join('\n'))}
        </p>
      );
    }
  }

  return elements;
}

// ─────────────────────────────────────────────────────────────────────────────
//  collectListItems – handles nested lists and task list items
// ─────────────────────────────────────────────────────────────────────────────
function collectListItems(
  lines: string[],
  startIdx: number,
  ordered: boolean,
  baseIndent = 0
): { nodes: React.ReactNode[]; lineCount: number } {
  const nodes: React.ReactNode[] = [];
  let i = startIdx;

  const getIndent = (line: string) => line.match(/^(\s*)/)?.[1].length || 0;
  const itemRe = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;

  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndent(line);
    if (indent < baseIndent) break;
    if (!itemRe.test(line)) break;

    const itemText = line.trim().replace(ordered ? /^\d+[.)]\s+/ : /^[-*+]\s+/, '');
    const isTask = /^\[[ xX]\]\s/.test(itemText);
    const checked = isTask && itemText[1].toLowerCase() === 'x';
    const displayText = isTask ? itemText.slice(4) : itemText;

    // Look ahead for nested list
    const nestedStart = i + 1;
    let childIndent = -1;
    if (nestedStart < lines.length) {
      const nextIndent = getIndent(lines[nestedStart]);
      if (nextIndent > indent && itemRe.test(lines[nestedStart].trimStart().replace(/^\s*/, ''))) {
        childIndent = nextIndent;
      }
    }

    let childrenEl: React.ReactNode = null;
    let childCount = 0;
    if (childIndent > indent) {
      const nested = collectListItems(lines, nestedStart, /^\s*\d+[.)]\s/.test(lines[nestedStart]), childIndent);
      childCount = nested.lineCount;
      // determine child list type
      const isChildOrdered = /^\s*\d+[.)]\s/.test(lines[nestedStart]);
      childrenEl = isChildOrdered
        ? <ol className="md-ol md-ol--nested">{nested.nodes}</ol>
        : <ul className="md-ul md-ul--nested">{nested.nodes}</ul>;
    }

    if (isTask) {
      nodes.push(
        <li key={i} className={`md-task-item${checked ? ' md-task-checked' : ''}`}>
          <span className={`md-checkbox${checked ? ' checked' : ''}`}>{checked ? '✓' : ''}</span>
          <span className="md-task-text">{parseInlineMarkdown(displayText)}</span>
          {childrenEl}
        </li>
      );
    } else {
      nodes.push(
        <li key={i} className="md-li">
          {parseInlineMarkdown(displayText)}
          {childrenEl}
        </li>
      );
    }

    i += 1 + childCount;
  }

  return { nodes, lineCount: i - startIdx };
}

// ─────────────────────────────────────────────────────────────────────────────
//  MarkdownTextRenderer component
// ─────────────────────────────────────────────────────────────────────────────
export function MarkdownTextRenderer({
  content = '',
  isEditable = false,
  onChange,
}: MarkdownTextRendererProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 4}px`;
    }
  }, [content, isEditable]);

  if (isEditable) {
    return (
      <div className="md-editable-wrap">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={[
            '# Heading 1',
            '## Heading 2',
            '**bold** *italic* ~~strikethrough~~ ==highlight==',
            '`inline code`  ^superscript^  ~subscript~',
            '',
            '- Bullet list',
            '  - Nested item',
            '- [ ] Task item',
            '- [x] Completed task',
            '',
            '1. Ordered list',
            '',
            '> Blockquote',
            '',
            '```js',
            'const x = 42;',
            '```',
            '',
            '| Column | Header |',
            '|--------|--------|',
            '| Cell   | Value  |',
            '',
            '[Link text](https://example.com)',
            '![Image alt](https://example.com/img.jpg)',
          ].join('\n')}
          className="md-editable-textarea"
          spellCheck={false}
          autoFocus
        />
        <div className="md-editable-cheatsheet">
          <span><strong>**bold**</strong></span>
          <span><em>*italic*</em></span>
          <span><del>~~strike~~</del></span>
          <span><mark>==highlight==</mark></span>
          <span><code>`code`</code></span>
          <span>^sup^</span>
          <span>[link](url)</span>
          <span>![img](url)</span>
        </div>
      </div>
    );
  }

  if (!content.trim()) {
    return (
      <div className="md-rendered md-empty">
        <em style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Click to add text content...
        </em>
      </div>
    );
  }

  const lines = content.split('\n');
  return (
    <div className="md-rendered prose">
      {parseBlocks(lines)}
    </div>
  );
}
