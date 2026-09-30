'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  Users,
  Target,
  BookOpen,
  Award,
  Star,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  Save,
  ImagePlus,
  UploadCloud,
  Laptop,
  Compass,
  BarChart3,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Sparkles,
  Check,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import type {
  TeachersPageConfig,
  TeachersHeroConfig,
  TeachersWhyConfig,
  TeachersWhyCard,
  TeachersBecomeCTAConfig,
  TeachersHeroBadge,
  TeachersHeroStat,
  TeachersHeroFloatingCard,
} from '@/lib/types';
import { DEFAULT_TEACHERS_PAGE_CONFIG } from '@/lib/types';

function generateKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function TeachersPageContentEditor() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cms = useQuery({
    queryKey: ['teachers-page-cms-admin'],
    queryFn: () => api<{ teachersPage?: TeachersPageConfig | null }>('/api/cms/admin/teachers-page'),
  });

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'why' | 'cta'>('hero');
  const [config, setConfig] = useState<TeachersPageConfig>(DEFAULT_TEACHERS_PAGE_CONFIG);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deletion Confirmation Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    cardKey?: string;
    cardTitle?: string;
  }>({ open: false });

  // Reset Confirmation Dialog State
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Sync state when data is loaded
  useEffect(() => {
    if (cms.data?.teachersPage) {
      const remote = cms.data.teachersPage;
      setConfig({
        hero: {
          ...DEFAULT_TEACHERS_PAGE_CONFIG.hero,
          ...remote.hero,
          badges: remote.hero?.badges?.length ? remote.hero.badges : DEFAULT_TEACHERS_PAGE_CONFIG.hero.badges,
          stats: remote.hero?.stats?.length ? remote.hero.stats : DEFAULT_TEACHERS_PAGE_CONFIG.hero.stats,
          floatingCards: remote.hero?.floatingCards?.length ? remote.hero.floatingCards : DEFAULT_TEACHERS_PAGE_CONFIG.hero.floatingCards,
        },
        whyLearn: {
          ...DEFAULT_TEACHERS_PAGE_CONFIG.whyLearn,
          ...remote.whyLearn,
          cards: remote.whyLearn?.cards?.length ? remote.whyLearn.cards : DEFAULT_TEACHERS_PAGE_CONFIG.whyLearn.cards,
        },
        becomeTeacher: {
          ...DEFAULT_TEACHERS_PAGE_CONFIG.becomeTeacher,
          ...remote.becomeTeacher,
        },
      });
    }
  }, [cms.data?.teachersPage]);

  // Save / Publish
  async function handleSave(statusOverride?: 'published' | 'draft') {
    setBusy(true);
    try {
      const payload: TeachersPageConfig = {
        ...config,
        hero: {
          ...config.hero,
          status: statusOverride ?? config.hero.status ?? 'published',
        },
        whyLearn: {
          ...config.whyLearn,
          status: statusOverride ?? config.whyLearn.status ?? 'published',
        },
        becomeTeacher: {
          ...config.becomeTeacher,
          status: statusOverride ?? config.becomeTeacher.status ?? 'published',
        },
        updatedAt: new Date().toISOString(),
      };

      await api('/api/cms/admin/teachers-page', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success(statusOverride === 'draft' ? 'Draft saved successfully' : 'Changes published successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers-page-cms-admin'] });
      queryClient.invalidateQueries({ queryKey: ['teachers-page-cms'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  // Reset to default configuration
  async function handleReset() {
    setBusy(true);
    try {
      await api('/api/cms/admin/teachers-page/reset', { method: 'POST' });
      setConfig(DEFAULT_TEACHERS_PAGE_CONFIG);
      toast.success('Restored default content');
      setResetConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['teachers-page-cms-admin'] });
      queryClient.invalidateQueries({ queryKey: ['teachers-page-cms'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  // Hero updates
  function updateHero(patch: Partial<TeachersHeroConfig>) {
    setConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...patch },
    }));
  }

  function updateHeroStat(key: string, patch: Partial<TeachersHeroStat>) {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: (prev.hero.stats || []).map((s) => (s._key === key ? { ...s, ...patch } : s)),
      },
    }));
  }

  function addHeroStat() {
    const newStat: TeachersHeroStat = {
      _key: generateKey('s'),
      value: '100+',
      label: 'New Stat',
      icon: 'instructor',
      active: true,
    };
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: [...(prev.hero.stats || []), newStat],
      },
    }));
  }

  function deleteHeroStat(key: string) {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: (prev.hero.stats || []).filter((s) => s._key !== key),
      },
    }));
  }

  function updateHeroFloatingCard(key: string, patch: Partial<TeachersHeroFloatingCard>) {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        floatingCards: (prev.hero.floatingCards || []).map((fc) =>
          fc._key === key ? { ...fc, ...patch } : fc
        ),
      },
    }));
  }

  function addHeroFloatingCard() {
    const newCard: TeachersHeroFloatingCard = {
      _key: generateKey('fc'),
      title: 'Expert Mentorship',
      subtitle: 'Personalized guidance',
      icon: 'star',
      position: 'top-right',
      active: true,
    };
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        floatingCards: [...(prev.hero.floatingCards || []), newCard],
      },
    }));
  }

  function deleteHeroFloatingCard(key: string) {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        floatingCards: (prev.hero.floatingCards || []).filter((fc) => fc._key !== key),
      },
    }));
  }

  // Image Upload handler
  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadCloudinaryImage(file, 'cms');
      updateHero({ imageUrl: res.url });
      toast.success('Hero image uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Why Learn section updates
  function updateWhy(patch: Partial<TeachersWhyConfig>) {
    setConfig((prev) => ({
      ...prev,
      whyLearn: { ...prev.whyLearn, ...patch },
    }));
  }

  function updateWhyCard(key: string, patch: Partial<TeachersWhyCard>) {
    setConfig((prev) => ({
      ...prev,
      whyLearn: {
        ...prev.whyLearn,
        cards: prev.whyLearn.cards.map((c) => (c._key === key ? { ...c, ...patch } : c)),
      },
    }));
  }

  function addWhyCard() {
    const maxOrder = config.whyLearn.cards.reduce((max, c) => Math.max(max, c.order ?? 0), 0);
    const newCard: TeachersWhyCard = {
      _key: generateKey('w'),
      icon: 'educator',
      title: 'New Feature Card',
      description: 'Describe the feature or benefit of learning from Gyan Chowk teachers.',
      order: maxOrder + 1,
      active: true,
    };
    setConfig((prev) => ({
      ...prev,
      whyLearn: {
        ...prev.whyLearn,
        cards: [...prev.whyLearn.cards, newCard],
      },
    }));
    toast.success('Added new feature card');
  }

  function deleteWhyCard(key: string) {
    setConfig((prev) => ({
      ...prev,
      whyLearn: {
        ...prev.whyLearn,
        cards: prev.whyLearn.cards.filter((c) => c._key !== key),
      },
    }));
    setDeleteConfirm({ open: false });
    toast.success('Feature card removed');
  }

  function moveWhyCard(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.whyLearn.cards.length) return;

    setConfig((prev) => {
      const cards = [...prev.whyLearn.cards];
      const temp = cards[index];
      cards[index] = cards[newIndex];
      cards[newIndex] = temp;

      // Re-assign order numbers
      return {
        ...prev,
        whyLearn: {
          ...prev.whyLearn,
          cards: cards.map((c, i) => ({ ...c, order: i + 1 })),
        },
      };
    });
  }

  // Become Teacher CTA updates
  function updateCTA(patch: Partial<TeachersBecomeCTAConfig>) {
    setConfig((prev) => ({
      ...prev,
      becomeTeacher: { ...prev.becomeTeacher, ...patch },
    }));
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse" suppressHydrationWarning>
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-96 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Teachers Page Content
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                config.hero.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {config.hero.status ?? 'published'}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage the Hero, Why Learn From Teachers, and Become a Teacher CTA sections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reset / Restore Defaults */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <RotateCcw size={14} className="text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          {/* Live Preview Button */}
          <Link
            href="/teachers"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Eye size={14} className="text-amber-600" />
            <span>Preview Page</span>
            <ExternalLink size={12} className="text-slate-400" />
          </Link>

          {/* Save Draft */}
          <Button
            variant="ghost"
            onClick={() => void handleSave('draft')}
            loading={busy}
            className="text-xs"
          >
            Save Draft
          </Button>

          {/* Publish Changes */}
          <Button
            onClick={() => void handleSave('published')}
            loading={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2"
          >
            <Save size={14} />
            <span>Publish Changes</span>
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === 'hero'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={16} />
          <span>1. Hero / Learning Partner</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {config.hero.active ? 'Active' : 'Hidden'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('why')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === 'why'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target size={16} />
          <span>2. Why Learn From Teachers</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
            {config.whyLearn.cards.filter((c) => c.active).length} Cards
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cta')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === 'cta'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          <span>3. Become a Teacher CTA</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {config.becomeTeacher.active ? 'Active' : 'Hidden'}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: HERO / LEARNING PARTNER
         ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Section Visibility & Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hero Section Visibility & State</h3>
                <p className="text-xs text-slate-500">Toggle display on the public Teachers page</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hero.active}
                    onChange={(e) => updateHero({ active: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Hero Section</span>
                </label>

                <select
                  value={config.hero.status ?? 'published'}
                  onChange={(e) => updateHero({ status: e.target.value as 'published' | 'draft' })}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Saved only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hero Typography & Text Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Headings & Content
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow Text"
                value={config.hero.eyebrow}
                onChange={(e) => updateHero({ eyebrow: e.target.value })}
                placeholder="YOUR LEARNING PARTNER"
              />

              <Input
                label="Highlighted Heading Text"
                value={config.hero.headingHighlight}
                onChange={(e) => updateHero({ headingHighlight: e.target.value })}
                placeholder="expert"
              />
            </div>

            <Input
              label="Main Heading"
              value={config.hero.heading}
              onChange={(e) => updateHero({ heading: e.target.value })}
              placeholder="Learn from expert teachers"
              required
            />

            <Textarea
              label="Description"
              value={config.hero.description}
              onChange={(e) => updateHero({ description: e.target.value })}
              placeholder="Discover approved educators teaching recorded courses, batches and exam preparation..."
              rows={3}
            />

            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <Input
                label="Search Input Placeholder"
                value={config.hero.searchPlaceholder}
                onChange={(e) => updateHero({ searchPlaceholder: e.target.value })}
                placeholder="Search by name, headline or subject"
              />
              <Input
                label="Search Button Text"
                value={config.hero.searchButtonText}
                onChange={(e) => updateHero({ searchButtonText: e.target.value })}
                placeholder="Search"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <Input
                label="Link 1 Text (e.g. Browse all)"
                value={config.hero.browseAllText}
                onChange={(e) => updateHero({ browseAllText: e.target.value })}
                placeholder="Browse all"
              />
              <Input
                label="Link 1 Target URL (e.g. #all-teachers)"
                value={config.hero.browseAllLink}
                onChange={(e) => updateHero({ browseAllLink: e.target.value })}
                placeholder="#all-teachers"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <Input
                label="Link 2 Text (e.g. Become a teacher →)"
                value={config.hero.becomeTeacherText}
                onChange={(e) => updateHero({ becomeTeacherText: e.target.value })}
                placeholder="Become a teacher →"
              />
              <Input
                label="Link 2 Target URL"
                value={config.hero.becomeTeacherLink}
                onChange={(e) => updateHero({ becomeTeacherLink: e.target.value })}
                placeholder="/register?role=teacher"
              />
            </div>
          </div>

          {/* Hero Image Management */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Hero Teacher Image & Accents
            </h3>

            <div className="grid gap-6 sm:grid-cols-12 items-start">
              {/* Image Preview Box */}
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="relative h-64 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-amber-50/80 to-slate-100 shadow-sm flex items-center justify-center">
                  {config.hero.imageUrl ? (
                    <Image
                      src={config.hero.imageUrl}
                      alt={config.hero.imageAlt || 'Hero Preview'}
                      fill
                      className="object-contain object-bottom"
                      sizes="208px"
                    />
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      <ImagePlus size={32} className="mx-auto mb-2 text-slate-300" />
                      <span>No image set</span>
                    </div>
                  )}

                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-700">Uploading...</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                  >
                    <UploadCloud size={13} />
                    <span>Upload Image</span>
                  </button>

                  {config.hero.imageUrl && (
                    <button
                      type="button"
                      onClick={() => updateHero({ imageUrl: '' })}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      title="Clear image (fallback to default)"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Image Controls & Alt Text */}
              <div className="sm:col-span-8 space-y-4">
                <Input
                  label="Direct Image URL or Cloudinary Path"
                  value={config.hero.imageUrl}
                  onChange={(e) => updateHero({ imageUrl: e.target.value })}
                  placeholder="/teachers-hero-faculty.png or https://res.cloudinary.com/..."
                />

                <Input
                  label="Image Alt Text (SEO & Accessibility)"
                  value={config.hero.imageAlt}
                  onChange={(e) => updateHero({ imageAlt: e.target.value })}
                  placeholder="Expert Gyan Chowk Faculty"
                />
              </div>
            </div>
          </div>

          {/* Hero Statistics (Courses-Hero Style 3-Column Highlights) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hero Highlight Stats (3-Column Row)</h3>
                <p className="text-xs text-slate-500">Key proof points displayed below search bar (e.g., 100+ Approved Educators)</p>
              </div>
              <button
                type="button"
                onClick={addHeroStat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
              >
                <Plus size={13} />
                <span>Add Stat</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.hero.stats || []).map((stat, idx) => (
                <div
                  key={stat._key || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={stat.icon}
                      onChange={(e) =>
                        updateHeroStat(stat._key, {
                          icon: e.target.value as TeachersHeroStat['icon'],
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="instructor">Instructor (GraduationCap)</option>
                      <option value="students">Mentors / Users</option>
                      <option value="rate">Rate (Star)</option>
                      <option value="star">Award / Star</option>
                      <option value="book">Book Open</option>
                    </select>

                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateHeroStat(stat._key, { value: e.target.value })}
                      placeholder="Value (e.g. 100+)"
                      className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                    />

                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateHeroStat(stat._key, { label: e.target.value })}
                      placeholder="Label (e.g. Approved Educators)"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stat.active !== false}
                        onChange={(e) => updateHeroStat(stat._key, { active: e.target.checked })}
                        className="h-3.5 w-3.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => deleteHeroStat(stat._key)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Stat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Floating Cards (Over Visual Frame) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Floating Glass Cards (Over Image)</h3>
                <p className="text-xs text-slate-500">Premium glassmorphism badges floating around the photo</p>
              </div>
              <button
                type="button"
                onClick={addHeroFloatingCard}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
              >
                <Plus size={13} />
                <span>Add Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.hero.floatingCards || []).map((card, idx) => (
                <div
                  key={card._key || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={card.icon}
                      onChange={(e) =>
                        updateHeroFloatingCard(card._key, {
                          icon: e.target.value as TeachersHeroFloatingCard['icon'],
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="play">Play (Course Icon)</option>
                      <option value="check">Verified (Check Icon)</option>
                      <option value="award">Award</option>
                      <option value="star">Star</option>
                    </select>

                    <select
                      value={card.position}
                      onChange={(e) =>
                        updateHeroFloatingCard(card._key, {
                          position: e.target.value as TeachersHeroFloatingCard['position'],
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-left">Top Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>

                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateHeroFloatingCard(card._key, { title: e.target.value })}
                      placeholder="Title (e.g. Expert Faculty)"
                      className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                    />

                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={(e) => updateHeroFloatingCard(card._key, { subtitle: e.target.value })}
                      placeholder="Subtitle (e.g. Direct 1:1 guidance)"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.active !== false}
                        onChange={(e) => updateHeroFloatingCard(card._key, { active: e.target.checked })}
                        className="h-3.5 w-3.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => deleteHeroFloatingCard(card._key)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Floating Card"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: WHY LEARN FROM OUR TEACHERS
         ========================================================================= */}
      {activeTab === 'why' && (
        <div className="space-y-6">
          {/* Section Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Section Header & Visibility</h3>
                <p className="text-xs text-slate-500">
                  Controls the title, description, and state of the Why Learn section
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.whyLearn.active}
                    onChange={(e) => updateWhy({ active: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Why Learn Section</span>
                </label>

                <select
                  value={config.whyLearn.status ?? 'published'}
                  onChange={(e) => updateWhy({ status: e.target.value as 'published' | 'draft' })}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow (Optional Badge)"
                value={config.whyLearn.eyebrow ?? ''}
                onChange={(e) => updateWhy({ eyebrow: e.target.value })}
                placeholder="Optional small kicker"
              />

              <Input
                label="Highlighted Heading Text"
                value={config.whyLearn.headingHighlight}
                onChange={(e) => updateWhy({ headingHighlight: e.target.value })}
                placeholder="teachers"
              />
            </div>

            <Input
              label="Section Heading"
              value={config.whyLearn.heading}
              onChange={(e) => updateWhy({ heading: e.target.value })}
              placeholder="Why learn from Gyan Chowk teachers"
              required
            />

            <Textarea
              label="Section Description"
              value={config.whyLearn.description}
              onChange={(e) => updateWhy({ description: e.target.value })}
              placeholder="Our teachers are more than just educators — they are mentors, guides and subject experts..."
              rows={2}
            />
          </div>

          {/* Feature Cards Management (CRUD + Reorder) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Feature Cards ({config.whyLearn.cards.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Desktop displays 3 columns, Tablet 2 columns, Mobile 1 column
                </p>
              </div>

              <button
                type="button"
                onClick={addWhyCard}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-700"
              >
                <Plus size={14} />
                <span>Add Feature Card</span>
              </button>
            </div>

            {config.whyLearn.cards.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No feature cards defined yet.</p>
                <button
                  type="button"
                  onClick={addWhyCard}
                  className="mt-2 text-xs font-bold text-amber-700 underline"
                >
                  Add your first card
                </button>
              </div>
            )}

            <div className="space-y-4">
              {config.whyLearn.cards.map((card, idx) => (
                <div
                  key={card._key || idx}
                  className={`rounded-2xl border p-4 transition ${
                    card.active
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-slate-200 bg-slate-100/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {card.title || 'Untitled Card'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveWhyCard(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveWhyCard(idx, 'down')}
                        disabled={idx === config.whyLearn.cards.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      {/* Active toggle */}
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={card.active}
                          onChange={(e) => updateWhyCard(card._key, { active: e.target.checked })}
                          className="h-3.5 w-3.5 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Active</span>
                      </label>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            open: true,
                            cardKey: card._key,
                            cardTitle: card.title,
                          })
                        }
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete Card"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Card Icon
                      </label>
                      <select
                        value={card.icon}
                        onChange={(e) =>
                          updateWhyCard(card._key, {
                            icon: e.target.value as TeachersWhyCard['icon'],
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                      >
                        <option value="educator">Graduation Cap (Educator)</option>
                        <option value="target">Target (Exam focus)</option>
                        <option value="book">Book (Structured)</option>
                        <option value="doubt">User (Doubt desk)</option>
                        <option value="chart">Bar Chart (Performance)</option>
                        <option value="mentor">Compass (Mentorship)</option>
                        <option value="shield">Shield (Verified)</option>
                        <option value="award">Award (Honors)</option>
                        <option value="laptop">Laptop (Tech)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-9">
                      <Input
                        label="Card Title"
                        value={card.title}
                        onChange={(e) => updateWhyCard(card._key, { title: e.target.value })}
                        placeholder="e.g. Expert educators"
                        required
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <Textarea
                        label="Card Description"
                        value={card.description}
                        onChange={(e) => updateWhyCard(card._key, { description: e.target.value })}
                        placeholder="e.g. Only admin-approved teachers appear in this catalogue..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <Input
                        label="Optional Small Badge / Label"
                        value={card.badge ?? ''}
                        onChange={(e) => updateWhyCard(card._key, { badge: e.target.value })}
                        placeholder="e.g. Verified"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <Input
                        label="Optional Link (URL)"
                        value={card.link ?? ''}
                        onChange={(e) => updateWhyCard(card._key, { link: e.target.value })}
                        placeholder="e.g. /courses or #all-teachers"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BECOME A TEACHER CTA
         ========================================================================= */}
      {activeTab === 'cta' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Become a Teacher CTA Section</h3>
                <p className="text-xs text-slate-500">
                  Wavy dark bottom banner that encourages educators to apply
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.becomeTeacher.active}
                    onChange={(e) => updateCTA({ active: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show CTA Section</span>
                </label>

                <select
                  value={config.becomeTeacher.status ?? 'published'}
                  onChange={(e) => updateCTA({ status: e.target.value as 'published' | 'draft' })}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow Text"
                value={config.becomeTeacher.eyebrow}
                onChange={(e) => updateCTA({ eyebrow: e.target.value })}
                placeholder="SHARE YOUR KNOWLEDGE"
              />

              <Input
                label="Highlighted Heading Text"
                value={config.becomeTeacher.headingHighlight}
                onChange={(e) => updateCTA({ headingHighlight: e.target.value })}
                placeholder="teacher"
              />
            </div>

            <Input
              label="Main Heading"
              value={config.becomeTeacher.heading}
              onChange={(e) => updateCTA({ heading: e.target.value })}
              placeholder="Become a Gyan Chowk teacher"
              required
            />

            <Textarea
              label="Description"
              value={config.becomeTeacher.description}
              onChange={(e) => updateCTA({ description: e.target.value })}
              placeholder="Teach with recorded lessons, tests and study materials..."
              rows={3}
              required
            />

            <div className="grid gap-4 sm:grid-cols-12 pt-3 border-t border-slate-100 items-end">
              <div className="sm:col-span-5">
                <Input
                  label="Button Label"
                  value={config.becomeTeacher.buttonText}
                  onChange={(e) => updateCTA({ buttonText: e.target.value })}
                  placeholder="Become a teacher →"
                />
              </div>

              <div className="sm:col-span-5">
                <Input
                  label="Button Target URL"
                  value={config.becomeTeacher.buttonUrl}
                  onChange={(e) => updateCTA({ buttonUrl: e.target.value })}
                  placeholder="/register?role=teacher"
                />
              </div>

              <div className="sm:col-span-2 pb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.becomeTeacher.buttonActive !== false}
                    onChange={(e) => updateCTA({ buttonActive: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Button</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation Modal */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Feature Card"
        body={`Are you sure you want to delete the feature card "${deleteConfirm.cardTitle || 'Selected Card'}"? This action cannot be undone.`}
        confirmLabel="Delete Card"
        onConfirm={() => {
          if (deleteConfirm.cardKey) deleteWhyCard(deleteConfirm.cardKey);
        }}
        onClose={() => setDeleteConfirm({ open: false })}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Restore Default Teachers Page Content"
        body="Are you sure you want to reset all three sections (Hero, Why Learn, CTA) back to their default published content? Any unsaved custom text will be replaced."
        confirmLabel="Reset to Defaults"
        onConfirm={handleReset}
        onClose={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
