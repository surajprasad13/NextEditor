'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface PlanItem {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  popular?: boolean;
}

interface PricingBlockProps {
  title: string;
  subtitle?: string;
  plans: PlanItem[];
  isEditable?: boolean;
  onChange?: (props: {
    title: string;
    subtitle?: string;
    plans: PlanItem[];
  }) => void;
}

export function PricingBlock({
  title = 'Simple, Transparent Plans',
  subtitle = 'Scale up or down anytime.',
  plans = [],
  isEditable = false,
  onChange,
}: PricingBlockProps) {
  const update = (patch: Partial<PricingBlockProps>) => {
    if (!onChange) return;
    onChange({
      title,
      subtitle,
      plans,
      ...patch,
    } as any);
  };

  return (
    <div className={`builder-pricing-section ${isEditable ? 'pricing-editable' : ''}`}>
      <div className="pricing-header">
        <h2 className="pricing-title">
          {isEditable ? (
            <input
              type="text"
              value={title}
              onChange={(e) => update({ title: e.target.value })}
              className="pricing-title-input"
              placeholder="Pricing Title"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            title
          )}
        </h2>
        {subtitle && (
          <p className="pricing-subtitle">
            {isEditable ? (
              <input
                type="text"
                value={subtitle}
                onChange={(e) => update({ subtitle: e.target.value })}
                className="pricing-subtitle-input"
                placeholder="Pricing Subtitle"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              subtitle
            )}
          </p>
        )}
      </div>

      <div className="pricing-grid">
        {plans.map((plan, idx) => (
          <div key={idx} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
            {plan.popular && <span className="pricing-badge">Popular Choice</span>}
            <div className="pricing-card-header">
              <h4 className="plan-name">
                {isEditable ? (
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => {
                      const newPlans = [...plans];
                      newPlans[idx] = { ...plan, name: e.target.value };
                      update({ plans: newPlans });
                    }}
                    className="plan-name-input"
                    placeholder="Plan Name"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  plan.name
                )}
              </h4>
              <div className="plan-price-wrap">
                <span className="price-val">
                  {isEditable ? (
                    <input
                      type="text"
                      value={plan.price}
                      onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[idx] = { ...plan, price: e.target.value };
                        update({ plans: newPlans });
                      }}
                      className="price-val-input"
                      placeholder="$29"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    plan.price
                  )}
                </span>
                <span className="price-period">
                  /
                  {isEditable ? (
                    <input
                      type="text"
                      value={plan.period}
                      onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[idx] = { ...plan, period: e.target.value };
                        update({ plans: newPlans });
                      }}
                      className="price-period-input"
                      placeholder="mo"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    plan.period
                  )}
                </span>
              </div>
            </div>

            <ul className="plan-features-list">
              {plan.features.map((feat, fIdx) => (
                <li key={fIdx}>
                  <Check size={14} className="feature-check-icon" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="plan-cta-wrap" onClick={(e) => e.stopPropagation()}>
              {isEditable ? (
                <div className="plan-cta-inline-edit">
                  <input
                    type="text"
                    value={plan.ctaText}
                    onChange={(e) => {
                      const newPlans = [...plans];
                      newPlans[idx] = { ...plan, ctaText: e.target.value };
                      update({ plans: newPlans });
                    }}
                    className="plan-cta-input"
                    placeholder="CTA Button Label"
                  />
                  <input
                    type="text"
                    value={plan.ctaUrl}
                    onChange={(e) => {
                      const newPlans = [...plans];
                      newPlans[idx] = { ...plan, ctaUrl: e.target.value };
                      update({ plans: newPlans });
                    }}
                    className="plan-cta-input-url"
                    placeholder="CTA Link URL"
                  />
                </div>
              ) : (
                <a href={plan.ctaUrl} className="plan-cta-btn">
                  {plan.ctaText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
