import React from "react";
import {
  Rocket,
  Package,
  SeparatorHorizontal,
  Megaphone,
  MousePointerClick,
  Code2,
  Image,
  LayoutList,
  MessageSquare,
  BarChart3,
  Navigation,
  PanelBottom,
  Columns2,
  CreditCard,
  AlignLeft,
  Braces,
  Lightbulb,
  Rows3,
  Zap,
  Box,
  BookOpen,
} from "lucide-react";

export interface ComponentDef {
  type: string;
  name: string;
  icon: React.ReactNode;
  category: "layout" | "content" | "media" | "interactive" | "data";
  description: string;
  defaultProps: any;
}

const ico = (C: React.ElementType) =>
  React.createElement(C, { size: 14, strokeWidth: 1.8 });

export const componentDefinitions: Record<string, ComponentDef> = {
  // ── Layout ──────────────────────────────────────────────────────────────────
  HeroBlock: {
    type: "HeroBlock",
    name: "Hero Banner",
    icon: ico(Rocket),
    category: "layout",
    description:
      "Full-width hero section with headline, subtitle, and CTA buttons.",
    defaultProps: {
      title: "Build Something Amazing",
      subtitle:
        "A modern visual editor powered by Markdown and React. Start crafting beautiful pages today.",
      badgeText: "New Release",
      ctaText: "Get Started",
      ctaUrl: "#",
      secondaryText: "Learn More",
      secondaryUrl: "#",
      variant: "gradient",
    },
  },
  Card: {
    type: "Card",
    name: "Content Card",
    icon: ico(Package),
    category: "layout",
    description: "Visual card with image, title, and description.",
    defaultProps: {
      title: "Premium Design Out-of-the-box",
      description:
        "Our CSS modules use smooth gradients, high-contrast layouts, and sleek font families.",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
    },
  },
  DividerBlock: {
    type: "DividerBlock",
    name: "Section Divider",
    icon: ico(SeparatorHorizontal),
    category: "layout",
    description:
      "Decorative divider with optional center text and multiple styles.",
    defaultProps: {
      style: "gradient",
      weight: "normal",
      text: "",
      spacing: "md",
    },
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  CalloutBlock: {
    type: "CalloutBlock",
    name: "Callout / Alert",
    icon: ico(Megaphone),
    category: "content",
    description: "Info, warning, success, or danger callout alert box.",
    defaultProps: {
      variant: "info",
      title: "Note:",
      message:
        "This is an important callout message. Supports **bold** and *italic* text.",
    },
  },
  ButtonBlock: {
    type: "ButtonBlock",
    name: "Button / CTA",
    icon: ico(MousePointerClick),
    category: "content",
    description:
      "Call-to-action button with multiple variants and alignment options.",
    defaultProps: {
      label: "Get Started Today",
      url: "#",
      variant: "primary",
      size: "lg",
      align: "center",
      icon: "",
      openNewTab: false,
    },
  },
  CodeBlock: {
    type: "CodeBlock",
    name: "Code Block",
    icon: ico(Code2),
    category: "content",
    description:
      "Styled code snippet with language label, copy button, and optional line numbers.",
    defaultProps: {
      language: "javascript",
      filename: "example.js",
      code: `// Welcome to NextEditor\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));`,
      showLineNumbers: true,
    },
  },

  // ── Media ──────────────────────────────────────────────────────────────────
  ImageBlock: {
    type: "ImageBlock",
    name: "Image Gallery Block",
    icon: ico(Image),
    category: "media",
    description: "Centered image with figcaption and optional alt text.",
    defaultProps: {
      src: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=800&auto=format&fit=crop",
      alt: "Beautiful digital creative banner",
      caption: "Visuals captured live from premium photo stocks",
    },
  },

  // ── Interactive ───────────────────────────────────────────────────────────
  Accordion: {
    type: "Accordion",
    name: "Accordion FAQ",
    icon: ico(LayoutList),
    category: "interactive",
    description: "Collapsible accordion sections for FAQ or content toggling.",
    defaultProps: {
      items: [
        {
          title: "How does NextEditor work?",
          content:
            "NextEditor parses standard Markdown along with custom blocks wrapped in ::: tags.",
        },
        {
          title: "Can I add custom CSS?",
          content:
            "Yes! The entire project runs on native responsive Vanilla CSS.",
        },
        {
          title: "How do I export to Next.js?",
          content:
            'Use the "Get Code" button in the toolbar to copy ready-to-use Next.js component code.',
        },
      ],
    },
  },
  TestimonialRow: {
    type: "TestimonialRow",
    name: "Testimonials Row",
    icon: ico(MessageSquare),
    category: "interactive",
    description:
      "Visual customer testimonials row with avatar, name, and quote.",
    defaultProps: {
      testimonials: [
        {
          name: "Danny Rand",
          text: "This visual editor feels extremely fluid. Highly recommended!",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        },
        {
          name: "Sarah Chen",
          text: "Finally a CMS that does not get in the way of design. Beautiful default styles!",
          image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        },
      ],
    },
  },

  // ── Data ───────────────────────────────────────────────────────────────────
  StatsBlock: {
    type: "StatsBlock",
    name: "Stats / Numbers",
    icon: ico(BarChart3),
    category: "data",
    description: "Display key metrics and statistics in a beautiful grid.",
    defaultProps: {
      title: "Trusted by Thousands",
      subtitle: "Real numbers, real results.",
      stats: [
        { value: "10K", label: "Happy Customers", suffix: "+" },
        { value: "99.9", label: "Uptime Guarantee", suffix: "%" },
        { value: "24", label: "Support Hours", suffix: "/7" },
        { value: "4.9", label: "Average Rating", prefix: "" },
      ],
    },
  },
  NavBlock: {
    type: "NavBlock",
    name: "Header Navigation",
    icon: ico(Navigation),
    category: "layout",
    description:
      "Top header navigation bar with site logo, custom links, and action button.",
    defaultProps: {
      logoText: "NextEditor",
      logoUrl: "/",
      links: [
        { label: "Home", url: "/" },
        { label: "Features", url: "#features" },
        { label: "Pricing", url: "#pricing" },
        { label: "Blog", url: "/blog" },
      ],
      ctaLabel: "Sign Up",
      ctaUrl: "/signup",
      sticky: false,
    },
  },
  FooterBlock: {
    type: "FooterBlock",
    name: "Footer Directory",
    icon: ico(PanelBottom),
    category: "layout",
    description:
      "Visual website footer directory with logo, copyright notice, social links, and links categories.",
    defaultProps: {
      logoText: "NextEditor",
      copyrightText: "© 2026 NextEditor. All rights reserved.",
      socials: [
        { platform: "twitter", url: "#" },
        { platform: "github", url: "#" },
        { platform: "linkedin", url: "#" },
      ],
      columns: [
        {
          title: "Product",
          links: [
            { label: "Features", url: "#features" },
            { label: "Pricing", url: "#pricing" },
            { label: "Docs", url: "/docs" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", url: "#" },
            { label: "Blog", url: "/blog" },
            { label: "Careers", url: "#" },
          ],
        },
      ],
    },
  },
  ColumnsBlock: {
    type: "ColumnsBlock",
    name: "Multi-Columns Grid",
    icon: ico(Columns2),
    category: "layout",
    description:
      "Grid layout supporting columns side-by-side with rich layouts, text, image, and style customizers.",
    defaultProps: {
      layout: "1-1",
      gap: "md",
      align: "stretch",
      columns: [
        {
          type: "custom",
          iconEmoji: "",
          title: "Premium Design Out-of-the-box",
          content:
            "Add titles, text, buttons, and custom layout badges to any grid column.",
          btnLabel: "Get Started Today",
          btnUrl: "#",
          btnVariant: "primary",
          bgColor: "var(--bg-app)",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "var(--border-color)",
          boxShadow: "sm",
        },
        {
          type: "custom",
          iconEmoji: "",
          title: "Speed & Conversion",
          content:
            "Combine background boxes, text alignments, hover transitions, and custom html overlays.",
          btnLabel: "Learn More",
          btnUrl: "#",
          btnVariant: "outline",
          bgColor: "var(--bg-app)",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "var(--border-color)",
          boxShadow: "sm",
        },
      ],
    },
  },
  PricingBlock: {
    type: "PricingBlock",
    name: "Pricing Comparison",
    icon: ico(CreditCard),
    category: "interactive",
    description:
      "Subscription pricing tiers comparison cards grid with visual checklist feature items.",
    defaultProps: {
      title: "Simple, Transparent Plans",
      subtitle: "No hidden fees. Scale as your business grows.",
      plans: [
        {
          name: "Starter Plan",
          price: "$0",
          period: "mo",
          features: [
            "1 Editor User",
            "Core block formats",
            "Static exports",
            "Community support",
          ],
          ctaText: "Start for Free",
          ctaUrl: "#",
          popular: false,
        },
        {
          name: "Professional Pro",
          price: "$29",
          period: "mo",
          features: [
            "Unlimited Users",
            "All 15+ Block types",
            "Dynamic database entries",
            "24/7 dedicated email support",
            "Custom style modules",
          ],
          ctaText: "Upgrade to Pro",
          ctaUrl: "#",
          popular: true,
        },
      ],
    },
  },
  TextBlock: {
    type: "TextBlock",
    name: "Styled Text Container",
    icon: ico(AlignLeft),
    category: "content",
    description:
      "Markdown text block container with visual styling support (custom spacing, backgrounds, borders).",
    defaultProps: {
      content:
        "### Styled Text Container\nThis is a text container that supports direct CSS styles. Use the right inspector panel design settings to set margins, paddings, background gradients, borders, or inline CSS.",
    },
  },
  EmbedBlock: {
    type: "EmbedBlock",
    name: "HTML / Embed Code",
    icon: ico(Braces),
    category: "interactive",
    description:
      "Insert raw HTML, iframe widgets, SVG icons, or custom contact forms.",
    defaultProps: {
      html: '<div style="padding: 20px; background: linear-gradient(135deg, #1e1b4b, #311042); border-radius: 12px; text-align: center; color: white;">\n  <h3>Custom HTML Embed</h3>\n  <p>Modify this code block to insert forms, inline CSS, widgets, or SVG graphics.</p>\n</div>',
    },
  },
  AdmonitionBlock: {
    type: "AdmonitionBlock",
    name: "Admonition",
    icon: ico(Lightbulb),
    category: "content",
    description: "Tip, Note, Warning, Danger, or Info callout block.",
    defaultProps: {
      type: "tip",
      title: "Tip",
      content: "This is a helpful tip for your readers.",
    },
  },
  TabsBlock: {
    type: "TabsBlock",
    name: "Tab",
    icon: ico(BookOpen),
    category: "layout",
    description: "Tabbed content switcher — organize content into tabs.",
    defaultProps: {
      tabs: [
        { label: "Overview", content: "This is the overview tab content." },
        { label: "Details", content: "Detailed information goes here." },
        { label: "Example", content: "Code or usage examples go here." },
      ],
    },
  },
  StepBlock: {
    type: "StepBlock",
    name: "Step",
    icon: ico(Rows3),
    category: "content",
    description: "Numbered or bulleted step-by-step guide block.",
    defaultProps: {
      variant: "number",
      steps: [
        { title: "Install the package", content: "Run `npm install` in your project directory." },
        { title: "Configure settings", content: "Create a config file and set your options." },
        { title: "Start building", content: "Run `npm run dev` to launch the dev server." },
      ],
    },
  },
  HighlightBlock: {
    type: "HighlightBlock",
    name: "Highlight",
    icon: ico(Zap),
    category: "content",
    description: "A highlighted callout line with an accent prefix and color.",
    defaultProps: {
      prefix: "",
      text: "This is an important highlighted note or callout.",
      color: "#2563eb",
    },
  },
  ContainerBlock: {
    type: "ContainerBlock",
    name: "Container",
    icon: ico(Box),
    category: "layout",
    description: "A customizable wrapper box with title, content, background, and border controls.",
    defaultProps: {
      title: "",
      content: "Add your content inside this container block.",
      bgColor: "var(--bg-card)",
      borderColor: "var(--border-color)",
      borderRadius: 8,
      padding: 20,
    },
  },
};

// Grouped by category for the insert panel
export const componentCategories = [
  {
    key: "layout",
    label: "Layout",
    icon: React.createElement(Columns2, { size: 13, strokeWidth: 1.8 }),
    types: [
      "NavBlock",
      "HeroBlock",
      "Card",
      "ColumnsBlock",
      "TabsBlock",
      "ContainerBlock",
      "DividerBlock",
      "FooterBlock",
    ],
  },
  {
    key: "content",
    label: "Content",
    icon: React.createElement(AlignLeft, { size: 13, strokeWidth: 1.8 }),
    types: ["TextBlock", "CalloutBlock", "AdmonitionBlock", "HighlightBlock", "StepBlock", "ButtonBlock", "CodeBlock"],
  },
  {
    key: "media",
    label: "Media",
    icon: React.createElement(Image, { size: 13, strokeWidth: 1.8 }),
    types: ["ImageBlock"],
  },
  {
    key: "interactive",
    label: "Interactive",
    icon: React.createElement(MousePointerClick, { size: 13, strokeWidth: 1.8 }),
    types: ["Accordion", "TestimonialRow", "PricingBlock", "EmbedBlock"],
  },
  {
    key: "data",
    label: "Data",
    icon: React.createElement(BarChart3, { size: 13, strokeWidth: 1.8 }),
    types: ["StatsBlock"],
  },
];
