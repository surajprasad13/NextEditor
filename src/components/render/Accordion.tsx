"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { parseInlineMarkdown } from "@/lib/parser";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  isEditable?: boolean;
  onChange?: (props: { items: AccordionItem[] }) => void;
}

export function Accordion({
  items = [],
  isEditable = false,
  onChange,
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleItemChange = (
    idx: number,
    field: "title" | "content",
    value: string,
  ) => {
    if (!onChange) return;
    const newItems = items.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ items: newItems });
  };

  const addItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    const newItems = [
      ...items,
      { title: "New Question", content: "New Answer content here..." },
    ];
    onChange({ items: newItems });
    setOpenIndex(newItems.length - 1);
  };

  const removeItem = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (!onChange) return;
    const newItems = items.filter((_, i) => i !== idx);
    onChange({ items: newItems });
    if (openIndex === idx) {
      setOpenIndex(null);
    } else if (openIndex !== null && openIndex > idx) {
      setOpenIndex(openIndex - 1);
    }
  };

  return (
    <div className="custom-accordion">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className={`accordion-item ${isOpen ? "open" : ""}`}>
            <div className="accordion-trigger" onClick={() => toggleItem(idx)}>
              {isEditable ? (
                <input
                  type="text"
                  value={item.title}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleItemChange(idx, "title", e.target.value)
                  }
                  className="accordion-title-input"
                  placeholder="Accordion Question"
                />
              ) : (
                <span className="accordion-title-text">
                  {parseInlineMarkdown(item.title)}
                </span>
              )}
              <div className="accordion-actions">
                {isEditable && items.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => removeItem(e, idx)}
                    className="accordion-btn-delete"
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ChevronDown className="accordion-chevron" size={18} />
              </div>
            </div>

            <div className="accordion-content">
              {isEditable ? (
                <textarea
                  value={item.content}
                  onChange={(e) =>
                    handleItemChange(idx, "content", e.target.value)
                  }
                  className="accordion-content-input"
                  placeholder="Accordion Answer content..."
                  rows={3}
                />
              ) : (
                <div className="accordion-content-text">
                  {parseInlineMarkdown(item.content)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isEditable && (
        <button type="button" onClick={addItem} className="accordion-btn-add">
          <Plus size={14} /> Add Accordion Item
        </button>
      )}
    </div>
  );
}
