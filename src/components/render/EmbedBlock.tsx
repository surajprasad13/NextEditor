"use client";

import React from "react";

interface EmbedBlockProps {
  html: string;
  isEditable?: boolean;
}

export function EmbedBlock({ html = "", isEditable = false }: EmbedBlockProps) {
  return (
    <div
      className={`builder-embed-container ${
        isEditable ? "embed-editable" : ""
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
