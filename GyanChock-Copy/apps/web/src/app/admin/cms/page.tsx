'use client';

import Link from 'next/link';
import { FormEvent, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, CheckCircle2, Eye, ExternalLink, HelpCircle, FileText, Layers, Layout, Image } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { Alert, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Overlay';
import { LoadingState } from '@/components/ui/States';
import { HomeDiscoveryEditor } from '@/components/admin/HomeDiscoveryEditor';
import { HomeHighlightsEditor } from '@/components/admin/HomeHighlightsEditor';
import { HomeFacultyEditor } from '@/components/admin/HomeFacultyEditor';
import { HomeTestSubscriptionEditor } from '@/components/admin/HomeTestSubscriptionEditor';
import { HomePlatformEditor } from '@/components/admin/HomePlatformEditor';
import { HomeSectionCopyEditor } from '@/components/admin/HomeSectionCopyEditor';
import { HomeWhyEditor } from '@/components/admin/HomeWhyEditor';
import { HomeFeaturedCoursesEditor } from '@/components/admin/HomeFeaturedCoursesEditor';
import { CoursesPageContentEditor } from '@/components/admin/CoursesPageContentEditor';
import { TeachersPageContentEditor } from '@/components/admin/TeachersPageContentEditor';
import { AboutPageContentEditor } from '@/components/admin/AboutPageContentEditor';

type TabKey = 'sections' | 'pages' | 'faqs' | 'blogs' | 'legal' | 'banners';

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('sections');

  // FAQ states
  const faqsQuery = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => api<{ faqs: Array<{ _id: string; question: string; answer: string; category?: string; order?: number; published?: boolean }> }>('/api/cms/admin/faqs'),
  });

  const [faqModal, setFaqModal] = useState<{ open: boolean; id?: string; question: string; answer: string; category: string; order: number; published: boolean }>({
    open: false,
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    published: true,
  });

  // Blog states
  const blogsQuery = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string; slug: string; excerpt?: string; body?: string; tags?: string[]; featured?: boolean; published?: boolean; createdAt?: string }> }>('/api/cms/admin/blogs'),
  });

  const [blogModal, setBlogModal] = useState<{
    open: boolean;
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    tags: string;
    featured: boolean;
    published: boolean;
  }>({
    open: false,
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    tags: '',
    featured: false,
    published: true,
  });

  // Legal / Page states
  const [legalKey, setLegalKey] = useState('privacy-policy');
  const [legalTitle, setLegalTitle] = useState('');
  const [legalBody, setLegalBody] = useState('');
  const [savingLegal, setSavingLegal] = useState(false);

  const legalPageQuery = useQuery({
    queryKey: ['admin-legal-page', legalKey],
    queryFn: async () => {
      const res = await api<{ page: { title?: string; body?: string } | null }>(`/api/cms/admin/pages/${legalKey}`);
      return res.page;
    },
  });

  useEffect(() => {
    if (legalPageQuery.data) {
      setLegalTitle(legalPageQuery.data.title || '');
      setLegalBody(legalPageQuery.data.body || '');
    } else if (legalPageQuery.isSuccess && !legalPageQuery.data) {
      setLegalTitle(legalKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
      setLegalBody('');
    }
  }, [legalPageQuery.data, legalPageQuery.isSuccess, legalKey]);

  // Save Legal Page
  async function saveLegalPage(e: FormEvent) {
    e.preventDefault();
    setSavingLegal(true);
    try {
      await api('/api/cms/admin/pages', {
        method: 'POST',
        body: JSON.stringify({ key: legalKey, title: legalTitle, body: legalBody }),
      });
      toast.success('Page content updated successfully');
      await legalPageQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingLegal(false);
    }
  }

  // FAQ save
  async function saveFaq() {
    if (!faqModal.question.trim() || !faqModal.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    try {
      if (faqModal.id) {
        await api(`/api/cms/admin/faqs/${faqModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            question: faqModal.question,
            answer: faqModal.answer,
            category: faqModal.category,
            order: faqModal.order,
            published: faqModal.published,
          }),
        });
        toast.success('FAQ updated');
      } else {
        await api('/api/cms/admin/faqs', {
          method: 'POST',
          body: JSON.stringify({
            question: faqModal.question,
            answer: faqModal.answer,
            category: faqModal.category,
            order: faqModal.order,
            published: faqModal.published,
          }),
        });
        toast.success('FAQ created');
      }
      setFaqModal({ open: false, question: '', answer: '', category: 'general', order: 0, published: true });
      await faqsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  // FAQ delete
  async function deleteFaq(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api(`/api/cms/admin/faqs/${id}`, { method: 'DELETE' });
      toast.success('FAQ deleted');
      await faqsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // Blog save
  async function saveBlog() {
    if (!blogModal.title.trim()) return toast.error('Title is required');
    const slug = (blogModal.slug || blogModal.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const payload = {
        title: blogModal.title,
        slug,
        excerpt: blogModal.excerpt,
        body: blogModal.body,
        tags: blogModal.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: blogModal.featured,
        published: blogModal.published,
      };

      if (blogModal.id) {
        await api(`/api/cms/admin/blogs/${blogModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Blog article updated');
      } else {
        await api('/api/cms/admin/blogs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Blog article created');
      }
      setBlogModal({ open: false, title: '', slug: '', excerpt: '', body: '', tags: '', featured: false, published: true });
      await blogsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  // Blog delete
  async function deleteBlog(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api(`/api/cms/admin/blogs/${id}`, { method: 'DELETE' });
      toast.success('Blog article deleted');
      await blogsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const TABS = [
    { id: 'sections', label: 'Homepage Sections', icon: Layers },
    { id: 'pages', label: 'Page Layouts', icon: Layout },
    { id: 'faqs', label: 'FAQ Management', icon: HelpCircle },
    { id: 'blogs', label: 'Blog Articles', icon: FileText },
    { id: 'legal', label: 'Legal & Custom Pages', icon: FileText },
    { id: 'banners', label: 'Banners & Career', icon: Image },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-gc-black">Content Management System (CMS)</h1>
        <p className="mt-1 text-sm text-gc-mute">
          Manage website content, homepage sections, custom pages, FAQs, and articles without modifying codebase.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gc-line pb-3" suppressHydrationWarning>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-gc-black text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-gc-line hover:border-gc-blue hover:text-gc-blue'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Homepage Sections */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <HomeHighlightsEditor />
          <HomeSectionCopyEditor />
          <HomeDiscoveryEditor />
          <HomePlatformEditor />
          <HomeWhyEditor />
          <HomeTestSubscriptionEditor />
          <HomeFacultyEditor />
          <HomeFeaturedCoursesEditor />
        </div>
      )}

      {/* Tab 2: Page Layouts */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="gc-card p-6">
            <CoursesPageContentEditor />
          </div>
          <div className="gc-card p-6">
            <TeachersPageContentEditor />
          </div>
          <div className="gc-card p-6">
            <AboutPageContentEditor />
          </div>
        </div>
      )}

      {/* Tab 3: FAQ Management */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-gc-black">Frequently Asked Questions</h2>
              <p className="text-xs text-gc-mute">Manage questions shown on homepage, courses, and support.</p>
            </div>
            <Button
              onClick={() => setFaqModal({ open: true, question: '', answer: '', category: 'general', order: (faqsQuery.data?.faqs?.length || 0), published: true })}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <Plus size={14} /> Add New FAQ
            </Button>
          </div>

          {faqsQuery.isLoading && <LoadingState />}

          <div className="space-y-3">
            {(faqsQuery.data?.faqs ?? []).map((faq) => (
              <div key={faq._id} className="gc-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gc-black">{faq.question}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase font-mono text-stone-600">
                      {faq.category || 'general'}
                    </span>
                    {faq.published ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Published</span>
                    ) : (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Draft</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gc-mute line-clamp-2">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() =>
                      setFaqModal({
                        open: true,
                        id: faq._id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category || 'general',
                        order: faq.order || 0,
                        published: faq.published !== false,
                      })
                    }
                    className="p-1.5 text-stone-500 hover:text-gc-black"
                    title="Edit FAQ"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => deleteFaq(faq._id)}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                    title="Delete FAQ"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {(faqsQuery.data?.faqs ?? []).length === 0 && !faqsQuery.isLoading && (
              <div className="gc-card p-8 text-center text-sm text-gc-mute">
                No FAQs created yet. Click &quot;Add New FAQ&quot; above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Blog Articles */}
      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-gc-black">Articles & Editorial</h2>
              <p className="text-xs text-gc-mute">Publish study tips, exam strategies, and educational updates.</p>
            </div>
            <Button
              onClick={() => setBlogModal({ open: true, title: '', slug: '', excerpt: '', body: '', tags: '', featured: false, published: true })}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <Plus size={14} /> New Article
            </Button>
          </div>

          {blogsQuery.isLoading && <LoadingState />}

          <div className="space-y-3">
            {(blogsQuery.data?.items ?? []).map((blog) => (
              <div key={blog._id} className="gc-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gc-black">{blog.title}</span>
                    {blog.featured && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">Featured</span>
                    )}
                    {blog.published ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Published</span>
                    ) : (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Draft</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gc-mute line-clamp-1">{blog.excerpt || blog.body}</p>
                  <p className="mt-1 text-[11px] font-mono text-stone-400">/blogs/{blog.slug}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() =>
                      setBlogModal({
                        open: true,
                        id: blog._id,
                        title: blog.title,
                        slug: blog.slug,
                        excerpt: blog.excerpt || '',
                        body: blog.body || '',
                        tags: (blog.tags || []).join(', '),
                        featured: Boolean(blog.featured),
                        published: Boolean(blog.published),
                      })
                    }
                    className="p-1.5 text-stone-500 hover:text-gc-black"
                    title="Edit Article"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => deleteBlog(blog._id)}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                    title="Delete Article"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {(blogsQuery.data?.items ?? []).length === 0 && !blogsQuery.isLoading && (
              <div className="gc-card p-8 text-center text-sm text-gc-mute">
                No blog articles published yet. Click &quot;New Article&quot; above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Legal & Custom Pages */}
      {activeTab === 'legal' && (
        <form onSubmit={saveLegalPage} className="gc-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gc-line pb-3">
            <div>
              <h2 className="font-display text-xl font-bold text-gc-black">Legal & System Pages</h2>
              <p className="text-xs text-gc-mute">Edit policies and About sub-sections without changing code.</p>
            </div>
            <Link href={`/${legalKey}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-gc-blue hover:underline">
              Preview Live <ExternalLink size={12} />
            </Link>
          </div>

          <Select
            label="Select Page to Edit"
            value={legalKey}
            onChange={(e) => setLegalKey(e.target.value)}
          >
            {[
              { key: 'privacy-policy', label: 'Privacy Policy' },
              { key: 'terms-and-conditions', label: 'Terms and Conditions' },
              { key: 'refund-policy', label: 'Refund Policy' },
              { key: 'cookie-policy', label: 'Cookie Policy' },
              { key: 'payment-policy', label: 'Payment Policy' },
              { key: 'about', label: 'About Page Overview' },
              { key: 'about-mission', label: 'About - Mission Statement' },
              { key: 'about-vision', label: 'About - Vision Statement' },
              { key: 'about-future', label: 'About - Future Preview' },
            ].map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} ({p.key})
              </option>
            ))}
          </Select>

          <Input
            label="Page Title"
            value={legalTitle}
            onChange={(e) => setLegalTitle(e.target.value)}
            required
          />

          <Textarea
            label="Page Body (Markdown or Plain Text)"
            value={legalBody}
            onChange={(e) => setLegalBody(e.target.value)}
            rows={10}
            required
          />

          <div className="flex justify-end pt-2">
            <Button loading={savingLegal} type="submit">
              Save Content
            </Button>
          </div>
        </form>
      )}

      {/* Tab 6: Banners & Career */}
      {activeTab === 'banners' && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="gc-card p-6 flex flex-col justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-gc-black">Hero & Promo Banners</h2>
              <p className="mt-1 text-xs text-gc-mute">
                Configure promotional carousels, schedule banner display periods, and upload desktop and mobile creative assets.
              </p>
            </div>
            <Link href="/admin/banners" className="gc-btn-primary w-fit text-xs font-semibold">
              Open Banner Management &rarr;
            </Link>
          </div>

          <div className="gc-card p-6 flex flex-col justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-gc-black">Career & Job Openings</h2>
              <p className="mt-1 text-xs text-gc-mute">
                Publish open teaching positions, engineering vacancies, curriculum roles, and scholarship guides.
              </p>
            </div>
            <Link href="/admin/career" className="gc-btn-primary w-fit text-xs font-semibold">
              Open Career Management &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      <Modal
        open={faqModal.open}
        onClose={() => setFaqModal((s) => ({ ...s, open: false }))}
        title={faqModal.id ? 'Edit FAQ' : 'Add New FAQ'}
      >
        <div className="space-y-3 p-1">
          <Input
            label="Question"
            value={faqModal.question}
            onChange={(e) => setFaqModal((s) => ({ ...s, question: e.target.value }))}
            required
          />
          <Textarea
            label="Answer"
            value={faqModal.answer}
            onChange={(e) => setFaqModal((s) => ({ ...s, answer: e.target.value }))}
            rows={4}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={faqModal.category}
              onChange={(e) => setFaqModal((s) => ({ ...s, category: e.target.value }))}
            >
              <option value="general">General</option>
              <option value="courses">Courses</option>
              <option value="payment">Payment & Refunds</option>
              <option value="doubts">Doubts & Mentorship</option>
              <option value="technical">Technical</option>
            </Select>
            <Input
              type="number"
              label="Sort Order"
              value={faqModal.order}
              onChange={(e) => setFaqModal((s) => ({ ...s, order: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gc-black pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={faqModal.published}
              onChange={(e) => setFaqModal((s) => ({ ...s, published: e.target.checked }))}
              className="accent-gc-gold h-4 w-4"
            />
            <span>Published on website</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setFaqModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={saveFaq}>Save FAQ</Button>
          </div>
        </div>
      </Modal>

      {/* Blog Modal */}
      <Modal
        open={blogModal.open}
        onClose={() => setBlogModal((s) => ({ ...s, open: false }))}
        title={blogModal.id ? 'Edit Article' : 'Create Article'}
      >
        <div className="space-y-3 p-1">
          <Input
            label="Title"
            value={blogModal.title}
            onChange={(e) => setBlogModal((s) => ({ ...s, title: e.target.value }))}
            required
          />
          <Input
            label="URL Slug"
            value={blogModal.slug}
            onChange={(e) => setBlogModal((s) => ({ ...s, slug: e.target.value }))}
            placeholder="auto-generated-from-title"
          />
          <Input
            label="Excerpt / Summary"
            value={blogModal.excerpt}
            onChange={(e) => setBlogModal((s) => ({ ...s, excerpt: e.target.value }))}
          />
          <Input
            label="Tags (Comma-separated)"
            value={blogModal.tags}
            onChange={(e) => setBlogModal((s) => ({ ...s, tags: e.target.value }))}
            placeholder="jee, revision, preparation"
          />
          <Textarea
            label="Article Body (Markdown or Plain Text)"
            value={blogModal.body}
            onChange={(e) => setBlogModal((s) => ({ ...s, body: e.target.value }))}
            rows={8}
            required
          />
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gc-black cursor-pointer">
              <input
                type="checkbox"
                checked={blogModal.featured}
                onChange={(e) => setBlogModal((s) => ({ ...s, featured: e.target.checked }))}
                className="accent-gc-gold h-4 w-4"
              />
              <span>Featured Article</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gc-black cursor-pointer">
              <input
                type="checkbox"
                checked={blogModal.published}
                onChange={(e) => setBlogModal((s) => ({ ...s, published: e.target.checked }))}
                className="accent-gc-gold h-4 w-4"
              />
              <span>Publish Live</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setBlogModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={saveBlog}>Save Article</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
