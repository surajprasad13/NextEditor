import { NextRequest, NextResponse } from 'next/server';
import { getPages, savePage, deletePage, getBlogPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'blog') {
      const posts = await getBlogPosts();
      return NextResponse.json(posts);
    }

    const pages = await getPages();
    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      markdown,
      status,
      type,
      author,
      authorImage,
      authorBio,
      date,
      scheduledFor,
      tags,
      category,
      featuredImage,
      excerpt,
    } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug and Title are required.' }, { status: 400 });
    }

    const page = await savePage(slug, title, markdown || '', status, {
      type: type || 'page',
      author,
      authorImage,
      authorBio,
      date,
      scheduledFor,
      tags: Array.isArray(tags) ? tags : tags ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      category,
      featuredImage,
      excerpt,
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }
    if (slug === '/welcome' || slug === '/') {
      return NextResponse.json({ error: 'Core system pages cannot be deleted.' }, { status: 400 });
    }
    const success = await deletePage(slug);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
