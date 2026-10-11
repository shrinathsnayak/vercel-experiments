import { put, list } from '@vercel/blob';
import { getServiceStatus } from './services';
import { parseFrontmatterTitle, slugify, type CmsDocument } from '../logic';

const memory = new Map<string, CmsDocument>();

function key(kind: 'draft' | 'live', slug: string) {
  return `cms/${kind}/${slug}.md`;
}

export async function saveDraft(markdown: string, slugInput?: string): Promise<CmsDocument & { backend: string }> {
  const title = parseFrontmatterTitle(markdown);
  const slug = slugInput?.trim() || slugify(title);
  const doc: CmsDocument = {
    slug,
    title,
    body: markdown,
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
  const blobOk = getServiceStatus('blob').available;
  if (blobOk) {
    await put(key('draft', slug), markdown, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
    return { ...doc, backend: 'blob' };
  }
  memory.set(`draft:${slug}`, doc);
  return { ...doc, backend: 'memory' };
}

export async function publish(slug: string): Promise<CmsDocument & { backend: string }> {
  const draft = await readDraft(slug);
  if (!draft) throw new Error('Draft not found');
  const live: CmsDocument = { ...draft, status: 'published', updatedAt: new Date().toISOString() };
  const blobOk = getServiceStatus('blob').available;
  if (blobOk) {
    await put(key('live', slug), live.body, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
    return { ...live, backend: 'blob' };
  }
  memory.set(`live:${slug}`, live);
  memory.set(`draft:${slug}`, live);
  return { ...live, backend: 'memory' };
}

export async function readDraft(slug: string): Promise<CmsDocument | null> {
  const blobOk = getServiceStatus('blob').available;
  if (blobOk) {
    const { blobs } = await list({ prefix: key('draft', slug) });
    const hit = blobs.find((b) => b.pathname === key('draft', slug));
    if (!hit) return memory.get(`draft:${slug}`) ?? null;
    const res = await fetch(hit.url);
    const body = await res.text();
    return {
      slug,
      title: parseFrontmatterTitle(body),
      body,
      updatedAt: hit.uploadedAt.toISOString(),
      status: 'draft',
    };
  }
  return memory.get(`draft:${slug}`) ?? null;
}

export async function readLive(slug: string): Promise<CmsDocument | null> {
  const blobOk = getServiceStatus('blob').available;
  if (blobOk) {
    const { blobs } = await list({ prefix: key('live', slug) });
    const hit = blobs.find((b) => b.pathname === key('live', slug));
    if (!hit) return memory.get(`live:${slug}`) ?? null;
    const res = await fetch(hit.url);
    const body = await res.text();
    return {
      slug,
      title: parseFrontmatterTitle(body),
      body,
      updatedAt: hit.uploadedAt.toISOString(),
      status: 'published',
    };
  }
  return memory.get(`live:${slug}`) ?? null;
}
