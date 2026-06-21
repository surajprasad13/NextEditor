'use client';

import React, { useState } from 'react';

const LANGUAGES = [
  'javascript', 'typescript', 'jsx', 'tsx', 'python', 'css', 'html',
  'json', 'bash', 'shell', 'sql', 'go', 'rust', 'java', 'php',
  'ruby', 'swift', 'kotlin', 'yaml', 'markdown', 'text',
];

interface CodeBlockProps {
  language?: string;
  code?: string;
  filename?: string;
  showLineNumbers?: boolean;
  isEditable?: boolean;
  onChange?: (props: any) => void;
}

export function CodeBlock({
  language = 'javascript',
  code = '',
  filename = '',
  showLineNumbers = true,
  isEditable = false,
  onChange,
}: CodeBlockProps) {
  const [localLang, setLocalLang] = useState(language);
  const [localCode, setLocalCode] = useState(code);
  const [localFilename, setLocalFilename] = useState(filename);
  const [localLines, setLocalLines] = useState(showLineNumbers);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEditable) {
    return (
      <div className="block-editor-form">
        <div className="block-editor-form-title">Code Block Settings</div>
        <div className="editor-form-row">
          <div className="editor-form-field">
            <label>Language</label>
            <select
              value={localLang}
              onChange={(e) => setLocalLang(e.target.value)}
              className="editor-form-select"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="editor-form-field">
            <label>Filename (optional)</label>
            <input
              value={localFilename}
              onChange={(e) => setLocalFilename(e.target.value)}
              className="editor-form-input"
              placeholder="index.js"
            />
          </div>
        </div>
        <div className="editor-form-field">
          <label>Code Content</label>
          <textarea
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value)}
            className="editor-form-textarea editor-code-textarea"
            rows={10}
            placeholder="// Write your code here..."
            spellCheck={false}
          />
        </div>
        <label className="editor-checkbox-row">
          <input
            type="checkbox"
            checked={localLines}
            onChange={(e) => setLocalLines(e.target.checked)}
          />
          Show line numbers
        </label>
        <button
          type="button"
          className="block-form-apply-btn"
          onClick={() =>
            onChange?.({
              language: localLang,
              code: localCode,
              filename: localFilename,
              showLineNumbers: localLines,
            })
          }
        >
          ✓ Apply Changes
        </button>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <div className="code-block-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="code-block-filename">{filename || language}</span>
        <button type="button" onClick={handleCopy} className="code-copy-btn">
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <div className="code-block-body">
        {showLineNumbers && (
          <div className="code-line-numbers" aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <pre className="code-block-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
