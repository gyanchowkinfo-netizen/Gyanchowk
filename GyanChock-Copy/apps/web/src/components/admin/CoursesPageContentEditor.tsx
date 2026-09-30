'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  Play,
  CheckCircle2,
  Sparkles,
  Laptop,
  RotateCcw,
  Plus,
  Trash2,
  ImagePlus,
  Save,
  RotateCw,
  Eye,
  Check,
  Star,
  BookOpen,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { uploadCloudinaryImage } from '@/lib/upload';
import {
  CoursesPageConfig,
  CoursesHeroStat,
  CoursesHeroFloatingCard,
  CoursesPromoBenefit,
  DEFAULT_COURSES_PAGE_CONFIG,
} from '@/lib/types';

function newKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function CoursesPageContentEditor({
  onClose,
}: {
  onClose?: () => void;
}) {
  const queryClient = useQueryClient();
  const cms = useQuery({
    queryKey: ['courses-page-cms'],
    queryFn: () => api<{ coursesPage?: CoursesPageConfig | null }>('/api/cms/courses-page'),
  });

  const [activeTab, setActiveTab] = useState<'hero' | 'promo'>('hero');
  const [config, setConfig] = useState<CoursesPageConfig>(DEFAULT_COURSES_PAGE_CONFIG);
  const [busy, setBusy] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);
  const [uploadingPromoImg, setUploadingPromoImg] = useState(false);

  useEffect(() => {
    if (cms.data?.coursesPage) {
      setConfig({
        hero: {
          ...DEFAULT_COURSES_PAGE_CONFIG.hero,
          ...cms.data.coursesPage.hero,
          stats: cms.data.coursesPage.hero?.stats?.length
            ? cms.data.coursesPage.hero.stats
            : DEFAULT_COURSES_PAGE_CONFIG.hero.stats,
          floatingCards: cms.data.coursesPage.hero?.floatingCards?.length
            ? cms.data.coursesPage.hero.floatingCards
            : DEFAULT_COURSES_PAGE_CONFIG.hero.floatingCards,
        },
        featuredPromo: {
          ...DEFAULT_COURSES_PAGE_CONFIG.featuredPromo,
          ...cms.data.coursesPage.featuredPromo,
          benefits: cms.data.coursesPage.featuredPromo?.benefits?.length
            ? cms.data.coursesPage.featuredPromo.benefits
            : DEFAULT_COURSES_PAGE_CONFIG.featuredPromo.benefits,
        },
      });
    }
  }, [cms.data?.coursesPage]);

  // Helpers for Hero
  const updateHero = (patch: Partial<CoursesPageConfig['hero']>) => {
    setConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...patch },
    }));
  };

  const updateHeroStat = (index: number, patch: Partial<CoursesHeroStat>) => {
    setConfig((prev) => {
      const stats = [...prev.hero.stats];
      stats[index] = { ...stats[index], ...patch };
      return { ...prev, hero: { ...prev.hero, stats } };
    });
  };

  const addHeroStat = () => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: [
          ...prev.hero.stats,
          {
            _key: newKey('stat'),
            value: '50+',
            label: 'New Metric',
            icon: 'award',
            active: true,
          },
        ],
      },
    }));
  };

  const removeHeroStat = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: prev.hero.stats.filter((_, i) => i !== index),
      },
    }));
  };

  const updateFloatingCard = (index: number, patch: Partial<CoursesHeroFloatingCard>) => {
    setConfig((prev) => {
      const floatingCards = [...prev.hero.floatingCards];
      floatingCards[index] = { ...floatingCards[index], ...patch };
      return { ...prev, hero: { ...prev.hero, floatingCards } };
    });
  };

  const addFloatingCard = () => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        floatingCards: [
          ...prev.hero.floatingCards,
          {
            _key: newKey('card'),
            title: 'Structured Path',
            subtitle: 'Curated curriculum',
            icon: 'check',
            position: 'top-left',
            active: true,
          },
        ],
      },
    }));
  };

  const removeFloatingCard = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        floatingCards: prev.hero.floatingCards.filter((_, i) => i !== index),
      },
    }));
  };

  // Helpers for Featured Promo
  const updatePromo = (patch: Partial<CoursesPageConfig['featuredPromo']>) => {
    setConfig((prev) => ({
      ...prev,
      featuredPromo: { ...prev.featuredPromo, ...patch },
    }));
  };

  const updatePromoBenefit = (index: number, patch: Partial<CoursesPromoBenefit>) => {
    setConfig((prev) => {
      const benefits = [...prev.featuredPromo.benefits];
      benefits[index] = { ...benefits[index], ...patch };
      return { ...prev, featuredPromo: { ...prev.featuredPromo, benefits } };
    });
  };

  const addPromoBenefit = () => {
    setConfig((prev) => ({
      ...prev,
      featuredPromo: {
        ...prev.featuredPromo,
        benefits: [
          ...prev.featuredPromo.benefits,
          {
            _key: newKey('benefit'),
            title: 'Expert Mentorship',
            subtitle: 'Direct support',
            icon: 'laptop',
            active: true,
          },
        ],
      },
    }));
  };

  const removePromoBenefit = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      featuredPromo: {
        ...prev.featuredPromo,
        benefits: prev.featuredPromo.benefits.filter((_, i) => i !== index),
      },
    }));
  };

  // Cloudinary image upload handlers
  async function handleHeroImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImg(true);
    try {
      const { url } = await uploadCloudinaryImage(file, 'cms');
      updateHero({ imageUrl: url });
      toast.success('Hero image uploaded successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Hero image upload failed.');
    } finally {
      setUploadingHeroImg(false);
    }
  }

  async function handlePromoImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPromoImg(true);
    try {
      const { url } = await uploadCloudinaryImage(file, 'cms');
      updatePromo({ imageUrl: url });
      toast.success('Featured promo image uploaded successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Promo image upload failed.');
    } finally {
      setUploadingPromoImg(false);
    }
  }

  // Save changes
  async function saveChanges(e?: FormEvent) {
    if (e) e.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          key: 'courses.page',
          value: config,
        }),
      });
      toast.success('Courses page content saved successfully!');
      await queryClient.invalidateQueries({ queryKey: ['courses-page-cms'] });
      await queryClient.invalidateQueries({ queryKey: ['cms-public'] });
      if (onClose) onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save courses content.');
    } finally {
      setBusy(false);
    }
  }

  // Reset to default
  async function resetToDefaults() {
    if (!confirm('Are you sure you want to restore the default content for the Courses page?')) {
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          key: 'courses.page',
          value: DEFAULT_COURSES_PAGE_CONFIG,
        }),
      });
      setConfig(DEFAULT_COURSES_PAGE_CONFIG);
      toast.success('Restored default content for Courses page.');
      await queryClient.invalidateQueries({ queryKey: ['courses-page-cms'] });
      await queryClient.invalidateQueries({ queryKey: ['cms-public'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset content.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Courses Page Editor</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Admin
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage titles, copy, stats, floating badges, promotional banners and media for <code className="text-slate-800 font-mono">/courses</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetToDefaults}
            disabled={busy}
            className="text-xs"
          >
            <RotateCw size={13} className="mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => void saveChanges()}
            loading={busy}
            className="text-xs font-semibold"
          >
            <Save size={13} className="mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'hero'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={16} />
          <span>Section 1: Hero ("LEARN ANYTIME, ANYWHERE")</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'promo'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={16} />
          <span>Section 2: Featured Promo Banner ("FEATURED")</span>
        </button>
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="space-y-8">
          {/* Hero Main Copy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
              Hero Copy & Search Settings
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Top Pill Badge
                </label>
                <Input
                  value={config.hero.badge}
                  onChange={(e) => updateHero({ badge: e.target.value })}
                  placeholder="e.g. LEARN ANYTIME, ANYWHERE"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Main Headline
                </label>
                <Input
                  value={config.hero.title}
                  onChange={(e) => updateHero({ title: e.target.value })}
                  placeholder="e.g. Courses built for"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Headline Highlight (Italic / Styled Text)
                </label>
                <Input
                  value={config.hero.titleHighlight}
                  onChange={(e) => updateHero({ titleHighlight: e.target.value })}
                  placeholder="e.g. deep work"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Bar Placeholder
                </label>
                <Input
                  value={config.hero.searchPlaceholder}
                  onChange={(e) => updateHero({ searchPlaceholder: e.target.value })}
                  placeholder="e.g. Search by title, exam or subject"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-headline / Paragraph
                </label>
                <Textarea
                  rows={2}
                  value={config.hero.subtitle}
                  onChange={(e) => updateHero({ subtitle: e.target.value })}
                  placeholder="e.g. Recorded syllabi, verified enrollment, and tests that rank on the server…"
                />
              </div>
            </div>
          </div>

          {/* Hero Image Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
              Hero Visual & Media (Student Photo)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL or Path
                </label>
                <Input
                  value={config.hero.imageUrl}
                  onChange={(e) => updateHero({ imageUrl: e.target.value })}
                  placeholder="/courses-hero-student.jpg or https://..."
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Enter an image URL or upload a new picture directly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image Alt Text
                </label>
                <Input
                  value={config.hero.imageAlt}
                  onChange={(e) => updateHero({ imageAlt: e.target.value })}
                  placeholder="Student learning online"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  <ImagePlus size={16} />
                  <span>{uploadingHeroImg ? 'Uploading…' : 'Upload New Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImageUpload}
                    disabled={uploadingHeroImg}
                  />
                </label>

                {config.hero.imageUrl && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.hero.imageUrl}
                      alt={config.hero.imageAlt}
                      className="h-12 w-16 rounded-lg object-cover border border-slate-200"
                    />
                    <span className="text-xs text-slate-500">Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero Stats Row (100+ Expert Instructors, 20K+ Active Learners, etc.) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
                  Key Stats Row
                </h3>
                <p className="text-xs text-slate-400">
                  Add, update or delete numeric counters displayed beneath the search bar.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addHeroStat}
                className="text-xs font-medium"
              >
                <Plus size={14} className="mr-1" />
                Add Stat
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {config.hero.stats.map((stat, index) => (
                <div
                  key={stat._key || index}
                  className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 transition hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Stat #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeHeroStat(index)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete stat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Metric Value</label>
                    <Input
                      value={stat.value}
                      onChange={(e) => updateHeroStat(index, { value: e.target.value })}
                      placeholder="e.g. 100+"
                      className="text-xs py-1.5 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Metric Label</label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateHeroStat(index, { label: e.target.value })}
                      placeholder="e.g. Expert Instructors"
                      className="text-xs py-1.5 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Icon Type</label>
                    <select
                      value={stat.icon || 'instructor'}
                      onChange={(e) => updateHeroStat(index, { icon: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    >
                      <option value="instructor">Graduation Cap / Instructor</option>
                      <option value="students">Users / Students</option>
                      <option value="rate">Award / Satisfaction</option>
                      <option value="star">Star / Rating</option>
                      <option value="book">Book / Courses</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Floating Cards ("Learn at your pace", "Certificate on completion", etc.) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
                  Floating Cards (Over Student Image)
                </h3>
                <p className="text-xs text-slate-400">
                  Manage the floating feature badges overlaid across the hero image.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addFloatingCard}
                className="text-xs font-medium"
              >
                <Plus size={14} className="mr-1" />
                Add Floating Card
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {config.hero.floatingCards.map((card, index) => (
                <div
                  key={card._key || index}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Floating Card #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFloatingCard(index)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete card"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Title</label>
                    <Input
                      value={card.title}
                      onChange={(e) => updateFloatingCard(index, { title: e.target.value })}
                      placeholder="e.g. Learn at your pace"
                      className="text-xs py-1.5 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Subtitle</label>
                    <Input
                      value={card.subtitle}
                      onChange={(e) => updateFloatingCard(index, { subtitle: e.target.value })}
                      placeholder="e.g. Video lessons, notes & quizzes"
                      className="text-xs py-1.5 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Icon</label>
                      <select
                        value={card.icon || 'play'}
                        onChange={(e) => updateFloatingCard(index, { icon: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                      >
                        <option value="play">Play (Video)</option>
                        <option value="check">Checkmark (Certificate)</option>
                        <option value="award">Award</option>
                        <option value="star">Star</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Position</label>
                      <select
                        value={card.position || 'top-right'}
                        onChange={(e) =>
                          updateFloatingCard(index, {
                            position: e.target.value as CoursesHeroFloatingCard['position'],
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                      >
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="top-left">Top Left</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURED PROMO BANNER SECTION */}
      {activeTab === 'promo' && (
        <div className="space-y-8">
          {/* Promo Copy & CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
              Featured Promo Banner Copy & CTA
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline Badge
                </label>
                <Input
                  value={config.featuredPromo.badge}
                  onChange={(e) => updatePromo({ badge: e.target.value })}
                  placeholder="e.g. FEATURED"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banner Headline
                </label>
                <Input
                  value={config.featuredPromo.title}
                  onChange={(e) => updatePromo({ title: e.target.value })}
                  placeholder="e.g. Boost Your Career with the Right Skills"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banner Subtitle
                </label>
                <Textarea
                  rows={2}
                  value={config.featuredPromo.subtitle}
                  onChange={(e) => updatePromo({ subtitle: e.target.value })}
                  placeholder="e.g. Explore top-rated courses, get certified, and unlock new career opportunities."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Button (CTA) Text
                </label>
                <Input
                  value={config.featuredPromo.ctaText}
                  onChange={(e) => updatePromo({ ctaText: e.target.value })}
                  placeholder="e.g. Explore Featured Courses"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Button Link (Optional)
                </label>
                <Input
                  value={config.featuredPromo.ctaLink ?? ''}
                  onChange={(e) => updatePromo({ ctaLink: e.target.value })}
                  placeholder="Defaults to scrolling to course catalog"
                />
              </div>
            </div>
          </div>

          {/* Promo Graphic (Graduation Cap & Books) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
              Banner Graphic (Graduation Cap and Books)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL or Path
                </label>
                <Input
                  value={config.featuredPromo.imageUrl}
                  onChange={(e) => updatePromo({ imageUrl: e.target.value })}
                  placeholder="/courses-featured-cap.jpg or https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image Alt Text
                </label>
                <Input
                  value={config.featuredPromo.imageAlt}
                  onChange={(e) => updatePromo({ imageAlt: e.target.value })}
                  placeholder="Graduation Cap and Books"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  <ImagePlus size={16} />
                  <span>{uploadingPromoImg ? 'Uploading…' : 'Upload New Graphic'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePromoImageUpload}
                    disabled={uploadingPromoImg}
                  />
                </label>

                {config.featuredPromo.imageUrl && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.featuredPromo.imageUrl}
                      alt={config.featuredPromo.imageAlt}
                      className="h-12 w-16 rounded-lg object-contain bg-slate-50 border border-slate-200"
                    />
                    <span className="text-xs text-slate-500">Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Badges (Flexible Learning, Verified Certificates, Lifetime Access, etc.) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase text-slate-500">
                  Benefits Badges List
                </h3>
                <p className="text-xs text-slate-400">
                  Add, update or remove benefit cards shown in the featured promo column.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addPromoBenefit}
                className="text-xs font-medium"
              >
                <Plus size={14} className="mr-1" />
                Add Benefit
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {config.featuredPromo.benefits.map((benefit, index) => (
                <div
                  key={benefit._key || index}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Benefit #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePromoBenefit(index)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete benefit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Title</label>
                    <Input
                      value={benefit.title}
                      onChange={(e) => updatePromoBenefit(index, { title: e.target.value })}
                      placeholder="e.g. Flexible Learning"
                      className="text-xs py-1.5 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Subtitle</label>
                    <Input
                      value={benefit.subtitle}
                      onChange={(e) => updatePromoBenefit(index, { subtitle: e.target.value })}
                      placeholder="e.g. Learn on your schedule"
                      className="text-xs py-1.5 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Icon</label>
                    <select
                      value={benefit.icon || 'laptop'}
                      onChange={(e) => updatePromoBenefit(index, { icon: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    >
                      <option value="laptop">Laptop / Flexible</option>
                      <option value="award">Award / Certificate</option>
                      <option value="rotate">Rotate / Lifetime</option>
                      <option value="check">Checkmark</option>
                      <option value="star">Star</option>
                      <option value="sparkles">Sparkles</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={() => void saveChanges()}
          loading={busy}
          className="font-semibold"
        >
          <Save size={14} className="mr-1.5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
