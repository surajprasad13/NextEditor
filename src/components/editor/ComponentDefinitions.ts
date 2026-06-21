export interface ComponentDef {
  type: string;
  name: string;
  icon: string;
  category: 'layout' | 'content' | 'media' | 'interactive' | 'data';
  description: string;
  defaultProps: any;
}

export const componentDefinitions: Record<string, ComponentDef> = {
  // ── Layout ──────────────────────────────────────────────────────────────────
  HeroBlock: {
    type: 'HeroBlock',
    name: 'Hero Banner',
    icon: '🚀',
    category: 'layout',
    description: 'Full-width hero section with headline, subtitle, and CTA buttons.',
    defaultProps: {
      title: 'Build Something Amazing',
      subtitle: 'A modern visual editor powered by Markdown and React. Start crafting beautiful pages today.',
      badgeText: '✨ New Release',
      ctaText: 'Get Started',
      ctaUrl: '#',
      secondaryText: 'Learn More',
      secondaryUrl: '#',
      variant: 'gradient',
    },
  },
  Card: {
    type: 'Card',
    name: 'Content Card',
    icon: '📦',
    category: 'layout',
    description: 'Visual card with image, title, and description.',
    defaultProps: {
      title: 'Premium Design Out-of-the-box',
      description: 'Our CSS modules use smooth gradients, high-contrast layouts, and sleek font families.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
    },
  },
  DividerBlock: {
    type: 'DividerBlock',
    name: 'Section Divider',
    icon: '〰️',
    category: 'layout',
    description: 'Decorative divider with optional center text and multiple styles.',
    defaultProps: {
      style: 'gradient',
      weight: 'normal',
      text: '',
      spacing: 'md',
    },
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  CalloutBlock: {
    type: 'CalloutBlock',
    name: 'Callout / Alert',
    icon: '📢',
    category: 'content',
    description: 'Info, warning, success, or danger callout alert box.',
    defaultProps: {
      variant: 'info',
      title: 'Note:',
      message: 'This is an important callout message. Supports **bold** and *italic* text.',
    },
  },
  ButtonBlock: {
    type: 'ButtonBlock',
    name: 'Button / CTA',
    icon: '🔘',
    category: 'content',
    description: 'Call-to-action button with multiple variants and alignment options.',
    defaultProps: {
      label: 'Get Started Today',
      url: '#',
      variant: 'primary',
      size: 'lg',
      align: 'center',
      icon: '🚀',
      openNewTab: false,
    },
  },
  CodeBlock: {
    type: 'CodeBlock',
    name: 'Code Block',
    icon: '💻',
    category: 'content',
    description: 'Styled code snippet with language label, copy button, and optional line numbers.',
    defaultProps: {
      language: 'javascript',
      filename: 'example.js',
      code: `// Welcome to NextEditor\nfunction greet(name) {\n  return \`Hello, \${name}! 👋\`;\n}\n\nconsole.log(greet('World'));`,
      showLineNumbers: true,
    },
  },

  // ── Media ──────────────────────────────────────────────────────────────────
  ImageBlock: {
    type: 'ImageBlock',
    name: 'Image Gallery Block',
    icon: '🖼️',
    category: 'media',
    description: 'Centered image with figcaption and optional alt text.',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=800&auto=format&fit=crop',
      alt: 'Beautiful digital creative banner',
      caption: 'Visuals captured live from premium photo stocks',
    },
  },

  // ── Interactive ───────────────────────────────────────────────────────────
  Accordion: {
    type: 'Accordion',
    name: 'Accordion FAQ',
    icon: '📋',
    category: 'interactive',
    description: 'Collapsible accordion sections for FAQ or content toggling.',
    defaultProps: {
      items: [
        {
          title: 'How does NextEditor work?',
          content: 'NextEditor parses standard Markdown along with custom blocks wrapped in ::: tags.',
        },
        {
          title: 'Can I add custom CSS?',
          content: 'Yes! The entire project runs on native responsive Vanilla CSS.',
        },
        {
          title: 'How do I export to Next.js?',
          content: 'Use the "Get Code" button in the toolbar to copy ready-to-use Next.js component code.',
        },
      ],
    },
  },
  TestimonialRow: {
    type: 'TestimonialRow',
    name: 'Testimonials Row',
    icon: '💬',
    category: 'interactive',
    description: 'Visual customer testimonials row with avatar, name, and quote.',
    defaultProps: {
      testimonials: [
        {
          name: 'Danny Rand',
          text: 'This visual editor feels extremely fluid. Highly recommended!',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        },
        {
          name: 'Sarah Chen',
          text: 'Finally a CMS that does not get in the way of design. Beautiful default styles!',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        },
      ],
    },
  },

  // ── Data ───────────────────────────────────────────────────────────────────
  StatsBlock: {
    type: 'StatsBlock',
    name: 'Stats / Numbers',
    icon: '📊',
    category: 'data',
    description: 'Display key metrics and statistics in a beautiful grid.',
    defaultProps: {
      title: 'Trusted by Thousands',
      subtitle: 'Real numbers, real results.',
      stats: [
        { value: '10K', label: 'Happy Customers', suffix: '+' },
        { value: '99.9', label: 'Uptime Guarantee', suffix: '%' },
        { value: '24', label: 'Support Hours', suffix: '/7' },
        { value: '4.9', label: 'Average Rating', prefix: '⭐' },
      ],
    },
  },
  NavBlock: {
    type: 'NavBlock',
    name: 'Header Navigation',
    icon: '🧭',
    category: 'layout',
    description: 'Top header navigation bar with site logo, custom links, and action button.',
    defaultProps: {
      logoText: 'NextEditor',
      logoUrl: '/',
      links: [
        { label: 'Home', url: '/' },
        { label: 'Features', url: '#features' },
        { label: 'Pricing', url: '#pricing' },
        { label: 'Blog', url: '/blog' },
      ],
      ctaLabel: 'Sign Up',
      ctaUrl: '/signup',
      sticky: false,
    },
  },
  FooterBlock: {
    type: 'FooterBlock',
    name: 'Footer Directory',
    icon: '🚪',
    category: 'layout',
    description: 'Visual website footer directory with logo, copyright notice, social links, and links categories.',
    defaultProps: {
      logoText: 'NextEditor',
      copyrightText: '© 2026 NextEditor. All rights reserved.',
      socials: [
        { platform: 'twitter', url: '#' },
        { platform: 'github', url: '#' },
        { platform: 'linkedin', url: '#' },
      ],
      columns: [
        {
          title: 'Product',
          links: [
            { label: 'Features', url: '#features' },
            { label: 'Pricing', url: '#pricing' },
            { label: 'Docs', url: '/docs' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', url: '#' },
            { label: 'Blog', url: '/blog' },
            { label: 'Careers', url: '#' },
          ],
        },
      ],
    },
  },
  ColumnsBlock: {
    type: 'ColumnsBlock',
    name: 'Multi-Columns Grid',
    icon: '🥞',
    category: 'layout',
    description: 'Grid layout supporting columns side-by-side with rich layouts, text, image, and style customizers.',
    defaultProps: {
      layout: '1-1',
      gap: 'md',
      align: 'stretch',
      columns: [
        {
          type: 'custom',
          iconEmoji: '✨',
          title: 'Premium Design Out-of-the-box',
          content: 'Add titles, text, buttons, and custom layout badges to any grid column.',
          btnLabel: 'Get Started Today',
          btnUrl: '#',
          btnVariant: 'primary',
          bgColor: 'var(--bg-app)',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'var(--border-color)',
          boxShadow: 'sm'
        },
        {
          type: 'custom',
          iconEmoji: '⚡',
          title: 'Speed & Conversion',
          content: 'Combine background boxes, text alignments, hover transitions, and custom html overlays.',
          btnLabel: 'Learn More',
          btnUrl: '#',
          btnVariant: 'outline',
          bgColor: 'var(--bg-app)',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'var(--border-color)',
          boxShadow: 'sm'
        },
      ],
    },
  },
  PricingBlock: {
    type: 'PricingBlock',
    name: 'Pricing Comparison',
    icon: '🏷️',
    category: 'interactive',
    description: 'Subscription pricing tiers comparison cards grid with visual checklist feature items.',
    defaultProps: {
      title: 'Simple, Transparent Plans',
      subtitle: 'No hidden fees. Scale as your business grows.',
      plans: [
        {
          name: 'Starter Plan',
          price: '$0',
          period: 'mo',
          features: ['1 Editor User', 'Core block formats', 'Static exports', 'Community support'],
          ctaText: 'Start for Free',
          ctaUrl: '#',
          popular: false,
        },
        {
          name: 'Professional Pro',
          price: '$29',
          period: 'mo',
          features: ['Unlimited Users', 'All 15+ Block types', 'Dynamic database entries', '24/7 dedicated email support', 'Custom style modules'],
          ctaText: 'Upgrade to Pro',
          ctaUrl: '#',
          popular: true,
        },
      ],
    },
  },
  TextBlock: {
    type: 'TextBlock',
    name: 'Styled Text Container',
    icon: '✍️',
    category: 'content',
    description: 'Markdown text block container with visual styling support (custom spacing, backgrounds, borders).',
    defaultProps: {
      content: '### Styled Text Container\nThis is a text container that supports direct CSS styles. Use the right inspector panel design settings to set margins, paddings, background gradients, borders, or inline CSS.',
    },
  },
  EmbedBlock: {
    type: 'EmbedBlock',
    name: 'HTML / Embed Code',
    icon: '🧩',
    category: 'interactive',
    description: 'Insert raw HTML, iframe widgets, SVG icons, or custom contact forms.',
    defaultProps: {
      html: '<div style="padding: 20px; background: linear-gradient(135deg, #1e1b4b, #311042); border-radius: 12px; text-align: center; color: white;">\n  <h3>Custom HTML Embed</h3>\n  <p>Modify this code block to insert forms, inline CSS, widgets, or SVG graphics.</p>\n</div>',
    },
  },
};

// Grouped by category for the insert panel
export const componentCategories = [
  {
    key: 'layout',
    label: 'Layout',
    icon: '🏗️',
    types: ['NavBlock', 'HeroBlock', 'Card', 'ColumnsBlock', 'DividerBlock', 'FooterBlock'],
  },
  {
    key: 'content',
    label: 'Content',
    icon: '📝',
    types: ['TextBlock', 'CalloutBlock', 'ButtonBlock', 'CodeBlock'],
  },
  {
    key: 'media',
    label: 'Media',
    icon: '🖼️',
    types: ['ImageBlock'],
  },
  {
    key: 'interactive',
    label: 'Interactive',
    icon: '⚡',
    types: ['Accordion', 'TestimonialRow', 'PricingBlock', 'EmbedBlock'],
  },
  {
    key: 'data',
    label: 'Data',
    icon: '📊',
    types: ['StatsBlock'],
  },
];
