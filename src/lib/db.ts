import fs from "fs/promises";
import path from "path";

export interface PageItem {
  slug: string;
  title: string;
  markdown: string;
  status: "draft" | "published" | "scheduled";
  type: "page" | "blog";

  // Blog-specific metadata
  author?: string;
  authorImage?: string;
  authorBio?: string;
  date?: string; // ISO date string – publication date
  scheduledFor?: string; // ISO date string – scheduled publish
  updatedDate?: string; // ISO date string – last modified
  tags?: string[];
  category?: string;
  featuredImage?: string;
  excerpt?: string; // Short description / meta description
  readingTime?: number; // Auto-calculated minutes

  // System fields
  createdAt: string;
  updatedAt: string;
}

const DB_FILE = path.join(process.cwd(), "data", "pages.json");

async function ensureDbDirectory() {
  try {
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  } catch {
    // directory already exists – ignore
  }
}

// Calculate reading time from markdown text (avg 200 words/min)
export function calcReadingTime(markdown: string): number {
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function getPages(): Promise<PageItem[]> {
  await ensureDbDirectory();
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    const pages: PageItem[] = JSON.parse(data);
    // Migrate old records that lack 'type'
    return pages.map((p) => ({ ...p, type: p.type ?? ("page" as const) }));
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const defaultPages: PageItem[] = [
        {
          slug: "/welcome",
          title: "Welcome to NextEditor",
          type: "page",
          markdown: `# Welcome to NextEditor!\n\nThis is a live preview of your visual markdown page. Click on components on the right to edit them inline, drag to reorder, or use the toolbar to insert new blocks.\n\n:::Accordion\n{\n  "items": [\n    { "title": "What is **NextEditor**?", "content": "NextEditor is a **visual markdown page builder** that compiles rich component structures in real-time. It supports *all standard markdown* plus custom component blocks." },\n    { "title": "How do I edit components?", "content": "Click the ✏️ Edit button on any component block, or edit the markdown text directly on the left panel." },\n    { "title": "Can I use ~~strikethrough~~ and \`inline code\`?", "content": "Yes! The parser supports **bold**, *italic*, ~~strike~~, \`code\`, ==highlight==, [links](https://nextjs.org), and more." }\n  ]\n}\n:::\n\n## Custom Features\n\n:::Card\n{\n  "title": "Drag-and-Drop Reordering",\n  "description": "Rearrange components in the preview panel, and watch the markdown code update automatically.",\n  "image": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop"\n}\n:::\n`,
          status: "published",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await fs.writeFile(
        DB_FILE,
        JSON.stringify(defaultPages, null, 2),
        "utf-8",
      );
      return defaultPages;
    }
    console.error("DB read error:", error);
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<PageItem | null> {
  const pages = await getPages();
  const normalizedSlug = "/" + slug.replace(/^\/+|\/+$/g, "");
  return pages.find((p) => p.slug === normalizedSlug) || null;
}

export async function savePage(
  slug: string,
  title: string,
  markdown: string,
  status: PageItem["status"] = "published",
  meta?: Partial<
    Omit<
      PageItem,
      "slug" | "title" | "markdown" | "status" | "createdAt" | "updatedAt"
    >
  >,
): Promise<PageItem> {
  const pages = await getPages();
  const normalizedSlug = "/" + slug.replace(/^\/+|\/+$/g, "");
  const existingIdx = pages.findIndex((p) => p.slug === normalizedSlug);
  const now = new Date().toISOString();

  const readingTime = calcReadingTime(markdown);

  let updatedPage: PageItem;

  if (existingIdx >= 0) {
    updatedPage = {
      ...pages[existingIdx],
      title,
      markdown,
      status,
      readingTime,
      updatedAt: now,
      updatedDate: now,
      ...(meta || {}),
    };
    pages[existingIdx] = updatedPage;
  } else {
    updatedPage = {
      slug: normalizedSlug,
      title,
      markdown,
      status,
      readingTime,
      createdAt: now,
      updatedAt: now,
      ...(meta || {}),
      type: (meta?.type ?? "page") as PageItem["type"],
    };
    pages.push(updatedPage);
  }

  await ensureDbDirectory();
  await fs.writeFile(DB_FILE, JSON.stringify(pages, null, 2), "utf-8");
  return updatedPage;
}

export async function deletePage(slug: string): Promise<boolean> {
  const pages = await getPages();
  const normalizedSlug = "/" + slug.replace(/^\/+|\/+$/g, "");
  const newPages = pages.filter((p) => p.slug !== normalizedSlug);

  if (newPages.length === pages.length) return false;

  await ensureDbDirectory();
  await fs.writeFile(DB_FILE, JSON.stringify(newPages, null, 2), "utf-8");
  return true;
}

// Get only blog posts (type === 'blog')
export async function getBlogPosts(): Promise<PageItem[]> {
  const pages = await getPages();
  return pages
    .filter((p) => p.type === "blog" && p.status === "published")
    .sort((a, b) => {
      const da = a.date
        ? new Date(a.date).getTime()
        : new Date(a.createdAt).getTime();
      const db = b.date
        ? new Date(b.date).getTime()
        : new Date(b.createdAt).getTime();
      return db - da; // newest first
    });
}
