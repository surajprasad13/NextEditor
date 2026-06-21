'use client';

import { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { parseInlineMarkdown } from '@/lib/parser';

interface TestimonialItem {
  name: string;
  text: string;
  image: string;
}

interface TestimonialRowProps {
  testimonials: TestimonialItem[];
  isEditable?: boolean;
  onChange?: (props: { testimonials: TestimonialItem[] }) => void;
}

export function TestimonialRow({ testimonials = [], isEditable = false, onChange }: TestimonialRowProps) {
  const [activeAvatarPrompt, setActiveAvatarPrompt] = useState<number | null>(null);

  const handleTestimonialChange = (idx: number, field: keyof TestimonialItem, value: string) => {
    if (!onChange) return;
    const newTestimonials = testimonials.map((t, i) => {
      if (i === idx) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onChange({ testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    if (!onChange) return;
    const newTestimonials = [
      ...testimonials,
      {
        name: 'Jane Doe',
        text: 'This is a fantastic product! Highly recommended to everyone.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      },
    ];
    onChange({ testimonials: newTestimonials });
  };

  const removeTestimonial = (idx: number) => {
    if (!onChange) return;
    const newTestimonials = testimonials.filter((_, i) => i !== idx);
    onChange({ testimonials: newTestimonials });
    if (activeAvatarPrompt === idx) {
      setActiveAvatarPrompt(null);
    } else if (activeAvatarPrompt !== null && activeAvatarPrompt > idx) {
      setActiveAvatarPrompt(activeAvatarPrompt - 1);
    }
  };

  return (
    <div className="custom-testimonial-row-container">
      <div className="custom-testimonial-row">
        {testimonials.map((t, idx) => (
          <div key={idx} className="testimonial-card">
            {isEditable && testimonials.length > 1 && (
              <button
                type="button"
                className="testimonial-delete-btn"
                onClick={() => removeTestimonial(idx)}
                title="Delete testimonial"
              >
                <Trash2 size={12} />
              </button>
            )}

            <div className="testimonial-avatar-wrapper">
              {t.image ? (
                <img src={t.image} alt={t.name} className="testimonial-avatar" />
              ) : (
                <div className="testimonial-avatar-placeholder">
                  <User size={20} />
                </div>
              )}
              {isEditable && (
                <button
                  type="button"
                  onClick={() => setActiveAvatarPrompt(activeAvatarPrompt === idx ? null : idx)}
                  className="testimonial-avatar-edit-btn"
                >
                  Edit Image
                </button>
              )}

              {isEditable && activeAvatarPrompt === idx && (
                <div className="testimonial-avatar-prompt">
                  <input
                    type="text"
                    placeholder="Avatar URL"
                    value={t.image}
                    onChange={(e) => handleTestimonialChange(idx, 'image', e.target.value)}
                    className="avatar-url-input"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveAvatarPrompt(null)}
                    className="avatar-prompt-close"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            <div className="testimonial-body">
              {isEditable ? (
                <textarea
                  value={t.text}
                  onChange={(e) => handleTestimonialChange(idx, 'text', e.target.value)}
                  className="testimonial-text-input"
                  placeholder="Testimonial text..."
                  rows={3}
                />
              ) : (
                <p className="testimonial-text">"{parseInlineMarkdown(t.text)}"</p>
              )}

              {isEditable ? (
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => handleTestimonialChange(idx, 'name', e.target.value)}
                  className="testimonial-name-input"
                  placeholder="Customer Name"
                />
              ) : (
                <span className="testimonial-name">— {parseInlineMarkdown(t.name)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditable && (
        <button
          type="button"
          onClick={addTestimonial}
          className="testimonial-add-btn"
        >
          <Plus size={14} /> Add Testimonial
        </button>
      )}
    </div>
  );
}
