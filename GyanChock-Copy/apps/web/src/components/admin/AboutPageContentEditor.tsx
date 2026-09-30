'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  ImagePlus,
  Layers,
  LayoutDashboard,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UploadCloud,
  Users,
  Video,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import { LearningStackCardManager } from './LearningStackCardManager';
import {
  VisionStagesManager,
  ValuesCardsManager,
  PlatformFeaturesCardsManager,
  FutureVisionStepsManager,
} from './AboutSectionsManagers';
import type {
  AboutPageConfig,
  AboutHeroConfig,
  AboutMissionConfig,
  AboutVisionConfig,
  AboutWhyConfig,
  AboutEcosystemConfig,
  AboutValuesConfig,
  AboutPlatformConfig,
  AboutImpactConfig,
  AboutFutureVisionConfig,
  AboutCTAConfig,
} from '@/lib/types';
import { DEFAULT_ABOUT_PAGE_CONFIG, normalizeAboutPageConfig } from '@/lib/types';

function generateKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AboutPageContentEditor() {
  const queryClient = useQueryClient();
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const missionImageInputRef = useRef<HTMLInputElement>(null);
  const futureImageInputRef = useRef<HTMLInputElement>(null);
  const ctaImageInputRef = useRef<HTMLInputElement>(null);

  const cms = useQuery({
    queryKey: ['about-page-cms-admin'],
    queryFn: () => api<{ aboutPage?: AboutPageConfig | null }>('/api/cms/admin/about-page'),
  });

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'hero' | 'mission' | 'vision' | 'why' | 'ecosystem' | 'values' | 'platform' | 'impact' | 'future' | 'cta'
  >('hero');
  const [config, setConfig] = useState<AboutPageConfig>(DEFAULT_ABOUT_PAGE_CONFIG);
  const [busy, setBusy] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cms.data?.aboutPage) {
      setConfig(normalizeAboutPageConfig(cms.data.aboutPage));
    }
  }, [cms.data?.aboutPage]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'mission' | 'future' | 'cta') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    try {
      const res = await uploadCloudinaryImage(file, 'cms');
      if (target === 'hero') {
        setConfig((prev) => ({ ...prev, hero: { ...prev.hero, imageUrl: res.url } }));
      } else if (target === 'mission') {
        setConfig((prev) => ({ ...prev, mission: { ...prev.mission, imageUrl: res.url } }));
      } else if (target === 'future') {
        setConfig((prev) => ({ ...prev, futureVision: { ...prev.futureVision, imageUrl: res.url } }));
      } else if (target === 'cta') {
        setConfig((prev) => ({ ...prev, cta: { ...prev.cta, bannerImageUrl: res.url } }));
      }
      toast.success('Image uploaded successfully to Cloudinary');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingTarget(null);
      if (e.target) e.target.value = '';
    }
  };

  // Save changes
  const handleSave = async () => {
    setBusy(true);
    try {
      await api('/api/cms/admin/about-page', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      toast.success('About page content saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['about-page-cms-admin'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-cms'] });
      queryClient.invalidateQueries({ queryKey: ['cms-public'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setBusy(false);
    }
  };

  // Immediate save for individual section card managers
  const handleSectionCardUpdate = async (updatedConfig: AboutPageConfig, message: string) => {
    setConfig(updatedConfig);
    try {
      await api('/api/cms/admin/about-page', {
        method: 'POST',
        body: JSON.stringify(updatedConfig),
      });
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['about-page-cms-admin'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-cms'] });
      queryClient.invalidateQueries({ queryKey: ['cms-public'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Reset all About Page content to original defaults? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api('/api/cms/admin/about-page/reset', { method: 'POST' });
      setConfig(DEFAULT_ABOUT_PAGE_CONFIG);
      toast.success('About page reset to default configuration');
      queryClient.invalidateQueries({ queryKey: ['about-page-cms-admin'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-cms'] });
      queryClient.invalidateQueries({ queryKey: ['cms-public'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ECE6DE] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C1815] sm:text-3xl">About Page Manager</h1>
          <p className="mt-1 text-sm text-[#7B7368]">
            Edit, add new, delete, update sections, and manage images across all 10 About page sections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE6DE] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1815] shadow-xs hover:bg-[#FAF7F2]"
          >
            <Eye className="h-3.5 w-3.5 text-[#8C6228]" />
            <span>Preview Page</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </Link>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={busy}
            className="text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-gray-500" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="bg-[#8C6228] text-white hover:bg-[#724e1e] text-xs font-semibold px-4"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {busy ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#ECE6DE] pb-2 text-xs font-medium">
        {[
          { id: 'hero', label: '1. Hero' },
          { id: 'mission', label: '2. Mission' },
          { id: 'vision', label: '3. Vision' },
          { id: 'why', label: '4. Why Gyan Chowk' },
          { id: 'values', label: '5. Values' },
          { id: 'platform', label: '6. Platform' },
          { id: 'impact', label: '7. Impact' },
          { id: 'future', label: '8. Future' },
          { id: 'cta', label: '9. CTA' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-3.5 py-2 transition-all ${
              activeTab === tab.id
                ? 'bg-[#8C6228] text-white font-bold shadow-xs'
                : 'bg-white text-[#5F5850] border border-[#ECE6DE] hover:bg-[#FAF7F2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hidden File Inputs for Cloudinary Uploads */}
      <input
        ref={heroImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, 'hero')}
      />
      <input
        ref={missionImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, 'mission')}
      />
      <input
        ref={futureImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, 'future')}
      />
      <input
        ref={ctaImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, 'cta')}
      />

      {/* TAB 1: HERO */}
      {activeTab === 'hero' && (
        <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1815]">Hero Section Settings</h2>
              <p className="text-xs text-[#7B7368]">Customize headline, description, CTAs, hero image and metric badges.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Eyebrow Kicker"
              value={config.hero.eyebrow}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, eyebrow: e.target.value } })}
            />
            <Input
              label="Decorative Badge Text"
              value={config.hero.badgeText || ''}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badgeText: e.target.value } })}
            />
            <Input
              label="Main Heading"
              value={config.hero.heading}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
            />
            <Input
              label="Heading Highlight Words (Golden font)"
              value={config.hero.headingHighlight || ''}
              placeholder="e.g. No Limits."
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, headingHighlight: e.target.value } })}
            />
            <Textarea
              label="Description Subtitle"
              value={config.hero.description}
              rows={3}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })}
            />
            <Input
              label="Primary CTA Text"
              value={config.hero.primaryCtaText}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, primaryCtaText: e.target.value } })}
            />
            <Input
              label="Primary CTA Link"
              value={config.hero.primaryCtaLink}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, primaryCtaLink: e.target.value } })}
            />
            <Input
              label="Secondary CTA Text"
              value={config.hero.secondaryCtaText}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, secondaryCtaText: e.target.value } })}
            />
            <Input
              label="Secondary CTA Link"
              value={config.hero.secondaryCtaLink}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, secondaryCtaLink: e.target.value } })}
            />
          </div>

          {/* Hero Image Section */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <h3 className="font-display text-sm font-bold text-[#1C1815]">Hero Showcase Image</h3>
            <p className="text-xs text-[#7B7368] mb-3">Upload a new image or paste a URL.</p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-[#ECE6DE] bg-[#FAF7F2]">
                {config.hero.imageUrl ? (
                  <Image src={config.hero.imageUrl} alt="Hero preview" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <Input
                  label="Image URL"
                  value={config.hero.imageUrl}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, imageUrl: e.target.value } })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  disabled={uploadingTarget === 'hero'}
                  onClick={() => heroImageInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-[#8C6228]" />
                  {uploadingTarget === 'hero' ? 'Uploading...' : 'Upload Image to Cloudinary'}
                </Button>
              </div>
            </div>
          </div>

          {/* Badges List */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[#1C1815]">Trust Badges</h3>
              <Button
                type="button"
                variant="outline"
                className="text-xs py-1 px-2.5"
                onClick={() =>
                  setConfig({
                    ...config,
                    hero: {
                      ...config.hero,
                      badges: [...(config.hero.badges || []), { _key: generateKey('b'), text: 'New Badge', active: true }],
                    },
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Add Badge
              </Button>
            </div>

            <div className="space-y-2">
              {config.hero.badges?.map((badge, idx) => (
                <div key={badge._key} className="flex items-center gap-2 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] p-2.5">
                  <Input
                    value={badge.text}
                    placeholder="Badge Text"
                    className="flex-1 text-xs"
                    onChange={(e) => {
                      const updated = [...config.hero.badges];
                      updated[idx].text = e.target.value;
                      setConfig({ ...config, hero: { ...config.hero, badges: updated } });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 p-1.5"
                    onClick={() => {
                      const updated = config.hero.badges.filter((_, i) => i !== idx);
                      setConfig({ ...config, hero: { ...config.hero, badges: updated } });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISSION */}
      {activeTab === 'mission' && (
        <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1815]">Mission Section Settings</h2>
              <p className="text-xs text-[#7B7368]">Configure mission statement, creed quote, studio image and badges.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Eyebrow Kicker"
              value={config.mission.eyebrow}
              onChange={(e) => setConfig({ ...config, mission: { ...config.mission, eyebrow: e.target.value } })}
            />
            <Input
              label="Heading Highlight Words"
              value={config.mission.headingHighlight || ''}
              placeholder="e.g. clear path"
              onChange={(e) => setConfig({ ...config, mission: { ...config.mission, headingHighlight: e.target.value } })}
            />
            <Input
              label="Mission Heading"
              value={config.mission.heading}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, mission: { ...config.mission, heading: e.target.value } })}
            />
            <Textarea
              label="Mission Body Paragraphs (Line breaks create new paragraphs)"
              value={config.mission.body}
              rows={4}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, mission: { ...config.mission, body: e.target.value } })}
            />
            <Input
              label="Creed Quote"
              value={config.mission.quote || ''}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, mission: { ...config.mission, quote: e.target.value } })}
            />
            <Input
              label="Quote Author"
              value={config.mission.quoteAuthor || ''}
              onChange={(e) => setConfig({ ...config, mission: { ...config.mission, quoteAuthor: e.target.value } })}
            />
          </div>

          {/* Mission Image Section */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <h3 className="font-display text-sm font-bold text-[#1C1815]">Studio Demo Image</h3>
            <p className="text-xs text-[#7B7368] mb-3">Upload a new mission studio photo or specify an image URL.</p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-[#ECE6DE] bg-[#FAF7F2]">
                {config.mission.imageUrl ? (
                  <Image src={config.mission.imageUrl} alt="Mission preview" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <Input
                  label="Image URL"
                  value={config.mission.imageUrl}
                  onChange={(e) => setConfig({ ...config, mission: { ...config.mission, imageUrl: e.target.value } })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  disabled={uploadingTarget === 'mission'}
                  onClick={() => missionImageInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-[#8C6228]" />
                  {uploadingTarget === 'mission' ? 'Uploading...' : 'Upload Image to Cloudinary'}
                </Button>
              </div>
            </div>
          </div>

          {/* Mission Feature Pills */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[#1C1815]">Mission Feature Badges</h3>
              <Button
                type="button"
                variant="outline"
                className="text-xs py-1 px-2.5"
                onClick={() =>
                  setConfig({
                    ...config,
                    mission: {
                      ...config.mission,
                      badgePills: [
                        ...(config.mission.badgePills || []),
                        { _key: generateKey('mp'), title: 'New Feature', subtitle: 'Feature description', icon: 'book', active: true },
                      ],
                    },
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Add Badge
              </Button>
            </div>

            <div className="space-y-3">
              {config.mission.badgePills?.map((bp, idx) => (
                <div key={bp._key} className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] p-3">
                  <Input
                    label="Title"
                    value={bp.title}
                    className="sm:col-span-5 text-xs"
                    onChange={(e) => {
                      const updated = [...config.mission.badgePills];
                      updated[idx].title = e.target.value;
                      setConfig({ ...config, mission: { ...config.mission, badgePills: updated } });
                    }}
                  />
                  <Input
                    label="Subtitle"
                    value={bp.subtitle || ''}
                    className="sm:col-span-6 text-xs"
                    onChange={(e) => {
                      const updated = [...config.mission.badgePills];
                      updated[idx].subtitle = e.target.value;
                      setConfig({ ...config, mission: { ...config.mission, badgePills: updated } });
                    }}
                  />
                  <div className="sm:col-span-1 flex items-end justify-center pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 p-1.5"
                      onClick={() => {
                        const updated = config.mission.badgePills.filter((_, i) => i !== idx);
                        setConfig({ ...config, mission: { ...config.mission, badgePills: updated } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VISION */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1C1815]">Vision Section — Header</h2>
                <p className="text-xs text-[#7B7368]">Configure the section eyebrow kicker, heading, and description.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow Kicker"
                value={config.vision.eyebrow}
                onChange={(e) => setConfig({ ...config, vision: { ...config.vision, eyebrow: e.target.value } })}
              />
              <Input
                label="Heading Highlight Words"
                value={config.vision.headingHighlight || ''}
                onChange={(e) => setConfig({ ...config, vision: { ...config.vision, headingHighlight: e.target.value } })}
              />
              <Input
                label="Vision Heading"
                value={config.vision.heading}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, vision: { ...config.vision, heading: e.target.value } })}
              />
              <Textarea
                label="Vision Description"
                value={config.vision.description}
                rows={2}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, vision: { ...config.vision, description: e.target.value } })}
              />
            </div>
          </div>

          {/* Dynamic Vision Stages Cards CRUD Manager */}
          <VisionStagesManager config={config} onUpdate={handleSectionCardUpdate} />
        </div>
      )}

      {/* TAB 4: WHY GYAN CHOWK */}
      {activeTab === 'why' && (
        <div className="space-y-6">
          <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1C1815]">Why Gyan Chowk Stack — Header</h2>
                <p className="text-xs text-[#7B7368]">Configure the section eyebrow badge, title highlight, and supporting description.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow Kicker"
                value={config.whyGyanChowk.eyebrow}
                onChange={(e) => setConfig({ ...config, whyGyanChowk: { ...config.whyGyanChowk, eyebrow: e.target.value } })}
              />
              <Input
                label="Heading Highlight Words"
                value={config.whyGyanChowk.headingHighlight || ''}
                onChange={(e) => setConfig({ ...config, whyGyanChowk: { ...config.whyGyanChowk, headingHighlight: e.target.value } })}
              />
              <Input
                label="Section Heading"
                value={config.whyGyanChowk.heading}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, whyGyanChowk: { ...config.whyGyanChowk, heading: e.target.value } })}
              />
              <Textarea
                label="Description Subtitle"
                value={config.whyGyanChowk.description || ''}
                rows={2}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, whyGyanChowk: { ...config.whyGyanChowk, description: e.target.value } })}
              />
            </div>
          </div>

          {/* Dynamic Learning Stack Cards CRUD Manager */}
          <LearningStackCardManager />
        </div>
      )}

      {/* TAB 5: ECOSYSTEM */}
      {activeTab === 'ecosystem' && (
        <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1815]">Learning Ecosystem Hub & Nodes</h2>
              <p className="text-xs text-[#7B7368]">Configure central hub and linked educational nodes.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Eyebrow Kicker"
              value={config.learningEcosystem.eyebrow}
              onChange={(e) => setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, eyebrow: e.target.value } })}
            />
            <Input
              label="Heading Highlight Words"
              value={config.learningEcosystem.headingHighlight || ''}
              onChange={(e) => setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, headingHighlight: e.target.value } })}
            />
            <Input
              label="Section Heading"
              value={config.learningEcosystem.heading}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, heading: e.target.value } })}
            />
            <Input
              label="Hub Title"
              value={config.learningEcosystem.hubTitle}
              onChange={(e) => setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, hubTitle: e.target.value } })}
            />
            <Input
              label="Hub Subtitle"
              value={config.learningEcosystem.hubSubtitle}
              onChange={(e) => setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, hubSubtitle: e.target.value } })}
            />
          </div>

          {/* Nodes List */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[#1C1815]">Connected Nodes ({config.learningEcosystem.nodes.length})</h3>
              <Button
                type="button"
                variant="outline"
                className="text-xs py-1 px-2.5"
                onClick={() =>
                  setConfig({
                    ...config,
                    learningEcosystem: {
                      ...config.learningEcosystem,
                      nodes: [
                        ...config.learningEcosystem.nodes,
                        { _key: generateKey('e'), name: 'New Node', href: '/courses', badge: 'Active', active: true },
                      ],
                    },
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Add Node
              </Button>
            </div>

            <div className="space-y-3">
              {config.learningEcosystem.nodes.map((node, idx) => (
                <div key={node._key} className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] p-3.5">
                  <Input
                    label="Node Name"
                    value={node.name}
                    className="sm:col-span-4 text-xs"
                    onChange={(e) => {
                      const updated = [...config.learningEcosystem.nodes];
                      updated[idx].name = e.target.value;
                      setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, nodes: updated } });
                    }}
                  />
                  <Input
                    label="Target Link (Href)"
                    value={node.href}
                    className="sm:col-span-4 text-xs"
                    onChange={(e) => {
                      const updated = [...config.learningEcosystem.nodes];
                      updated[idx].href = e.target.value;
                      setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, nodes: updated } });
                    }}
                  />
                  <Input
                    label="Badge Text"
                    value={node.badge || ''}
                    className="sm:col-span-3 text-xs"
                    onChange={(e) => {
                      const updated = [...config.learningEcosystem.nodes];
                      updated[idx].badge = e.target.value;
                      setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, nodes: updated } });
                    }}
                  />
                  <div className="sm:col-span-1 flex items-end justify-center pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 p-1.5"
                      onClick={() => {
                        const updated = config.learningEcosystem.nodes.filter((_, i) => i !== idx);
                        setConfig({ ...config, learningEcosystem: { ...config.learningEcosystem, nodes: updated } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VALUES */}
      {activeTab === 'values' && (
        <div className="space-y-6">
          <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1C1815]">Core Values — Header</h2>
                <p className="text-xs text-[#7B7368]">Configure section heading, eyebrow, and supporting text.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow Kicker"
                value={config.values.eyebrow}
                onChange={(e) => setConfig({ ...config, values: { ...config.values, eyebrow: e.target.value } })}
              />
              <Input
                label="Heading Highlight Words"
                value={config.values.headingHighlight || ''}
                onChange={(e) => setConfig({ ...config, values: { ...config.values, headingHighlight: e.target.value } })}
              />
              <Input
                label="Heading"
                value={config.values.heading}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, values: { ...config.values, heading: e.target.value } })}
              />
              <Textarea
                label="Values Description"
                value={config.values.description || ''}
                rows={2}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, values: { ...config.values, description: e.target.value } })}
              />
            </div>
          </div>

          {/* Dynamic Values Cards CRUD Manager */}
          <ValuesCardsManager config={config} onUpdate={handleSectionCardUpdate} />
        </div>
      )}

      {/* TAB 7: PLATFORM FEATURES */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1C1815]">Platform Features — Header</h2>
                <p className="text-xs text-[#7B7368]">Configure section heading, eyebrow kicker, and description.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow Kicker"
                value={config.platformFeatures.eyebrow}
                onChange={(e) => setConfig({ ...config, platformFeatures: { ...config.platformFeatures, eyebrow: e.target.value } })}
              />
              <Input
                label="Heading Highlight Words"
                value={config.platformFeatures.headingHighlight || ''}
                onChange={(e) => setConfig({ ...config, platformFeatures: { ...config.platformFeatures, headingHighlight: e.target.value } })}
              />
              <Input
                label="Heading"
                value={config.platformFeatures.heading}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, platformFeatures: { ...config.platformFeatures, heading: e.target.value } })}
              />
              <Textarea
                label="Section Description"
                value={config.platformFeatures.description || ''}
                rows={2}
                className="sm:col-span-2"
                onChange={(e) => setConfig({ ...config, platformFeatures: { ...config.platformFeatures, description: e.target.value } })}
              />
            </div>
          </div>

          {/* Dynamic Platform Features Cards CRUD Manager */}
          <PlatformFeaturesCardsManager config={config} onUpdate={handleSectionCardUpdate} />
        </div>
      )}

      {/* TAB 8: IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1815]">Impact Numbers & Statistics</h2>
              <p className="text-xs text-[#7B7368]">Configure section heading, integrity note, and custom metric badges.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Eyebrow Kicker"
              value={config.impact.eyebrow}
              onChange={(e) => setConfig({ ...config, impact: { ...config.impact, eyebrow: e.target.value } })}
            />
            <Input
              label="Heading Highlight Words"
              value={config.impact.headingHighlight || ''}
              onChange={(e) => setConfig({ ...config, impact: { ...config.impact, headingHighlight: e.target.value } })}
            />
            <Input
              label="Section Heading"
              value={config.impact.heading}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, impact: { ...config.impact, heading: e.target.value } })}
            />
            <Textarea
              label="Description Subtitle"
              value={config.impact.description}
              rows={2}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, impact: { ...config.impact, description: e.target.value } })}
            />
            <Input
              label="Data Integrity Bottom Note"
              value={config.impact.note || ''}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, impact: { ...config.impact, note: e.target.value } })}
            />
          </div>

          <div className="border-t border-[#ECE6DE] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[#1C1815]">Custom Highlight Stats</h3>
              <Button
                type="button"
                variant="outline"
                className="text-xs py-1 px-2.5"
                onClick={() =>
                  setConfig({
                    ...config,
                    impact: {
                      ...config.impact,
                      customStats: [
                        ...(config.impact.customStats || []),
                        { _key: generateKey('is'), label: 'New Metric', value: '100%', active: true },
                      ],
                    },
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Add Custom Stat
              </Button>
            </div>

            <div className="space-y-3">
              {config.impact.customStats?.map((cs, idx) => (
                <div key={cs._key} className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] p-3.5">
                  <Input
                    label="Stat Label"
                    value={cs.label}
                    className="sm:col-span-6 text-xs"
                    onChange={(e) => {
                      const updated = [...(config.impact.customStats || [])];
                      updated[idx].label = e.target.value;
                      setConfig({ ...config, impact: { ...config.impact, customStats: updated } });
                    }}
                  />
                  <Input
                    label="Stat Value"
                    value={cs.value}
                    className="sm:col-span-5 text-xs"
                    onChange={(e) => {
                      const updated = [...(config.impact.customStats || [])];
                      updated[idx].value = e.target.value;
                      setConfig({ ...config, impact: { ...config.impact, customStats: updated } });
                    }}
                  />
                  <div className="sm:col-span-1 flex items-end justify-center pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 p-1.5"
                      onClick={() => {
                        const updated = (config.impact.customStats || []).filter((_, i) => i !== idx);
                        setConfig({ ...config, impact: { ...config.impact, customStats: updated } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: FUTURE VISION */}
      {activeTab === 'future' && (
        <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1815]">Future Vision & Horizon</h2>
              <p className="text-xs text-[#7B7368]">Configure future roadmap steps and showcase preview image.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Eyebrow Kicker"
              value={config.futureVision.eyebrow}
              onChange={(e) => setConfig({ ...config, futureVision: { ...config.futureVision, eyebrow: e.target.value } })}
            />
            <Input
              label="Heading Highlight Words"
              value={config.futureVision.headingHighlight || ''}
              onChange={(e) => setConfig({ ...config, futureVision: { ...config.futureVision, headingHighlight: e.target.value } })}
            />
            <Input
              label="Section Heading"
              value={config.futureVision.heading}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, futureVision: { ...config.futureVision, heading: e.target.value } })}
            />
            <Textarea
              label="Description Subtitle"
              value={config.futureVision.description}
              rows={2}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, futureVision: { ...config.futureVision, description: e.target.value } })}
            />
          </div>

          {/* Future Workspace Image */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <h3 className="font-display text-sm font-bold text-[#1C1815]">Future Preview Graphic Image</h3>
            <p className="text-xs text-[#7B7368] mb-3">Upload a new workspace photo or enter an image URL.</p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-[#ECE6DE] bg-[#FAF7F2]">
                {config.futureVision.imageUrl ? (
                  <Image src={config.futureVision.imageUrl} alt="Future preview" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <Input
                  label="Image URL"
                  value={config.futureVision.imageUrl || ''}
                  onChange={(e) => setConfig({ ...config, futureVision: { ...config.futureVision, imageUrl: e.target.value } })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  disabled={uploadingTarget === 'future'}
                  onClick={() => futureImageInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-[#8C6228]" />
                  {uploadingTarget === 'future' ? 'Uploading...' : 'Upload Image to Cloudinary'}
                </Button>
              </div>
            </div>
          </div>

          {/* Dynamic Future Vision Roadmap Steps CRUD Manager */}
          <FutureVisionStepsManager config={config} onUpdate={handleSectionCardUpdate} />
        </div>
      )}

      {/* TAB 10: ABOUT CTA */}
      {activeTab === 'cta' && (
        <div className="space-y-6 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1815]">Call to Action Banner</h2>
              <p className="text-xs text-[#7B7368]">Configure final CTA text, buttons, and verified badges.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Eyebrow Kicker"
              value={config.cta.eyebrow}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, eyebrow: e.target.value } })}
            />
            <Input
              label="Heading Highlight Words"
              value={config.cta.headingHighlight || ''}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, headingHighlight: e.target.value } })}
            />
            <Input
              label="CTA Heading"
              value={config.cta.heading}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, heading: e.target.value } })}
            />
            <Textarea
              label="CTA Description"
              value={config.cta.description}
              rows={2}
              className="sm:col-span-2"
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, description: e.target.value } })}
            />
            <Input
              label="Primary Button Text"
              value={config.cta.primaryButtonText}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, primaryButtonText: e.target.value } })}
            />
            <Input
              label="Primary Button Link"
              value={config.cta.primaryButtonLink}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, primaryButtonLink: e.target.value } })}
            />
            <Input
              label="Secondary Button Text"
              value={config.cta.secondaryButtonText}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, secondaryButtonText: e.target.value } })}
            />
            <Input
              label="Secondary Button Link"
              value={config.cta.secondaryButtonLink}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, secondaryButtonLink: e.target.value } })}
            />
          </div>

          {/* CTA Banner Ambient Image Section */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <h3 className="font-display text-sm font-bold text-[#1C1815]">Banner Ambient Image (Optional)</h3>
            <p className="text-xs text-[#7B7368] mb-3">Upload a subtle background banner or enter an image URL.</p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative h-28 w-48 shrink-0 overflow-hidden rounded-xl border border-[#ECE6DE] bg-[#FAF7F2]">
                {config.cta.bannerImageUrl ? (
                  <Image src={config.cta.bannerImageUrl} alt="CTA preview" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">No Image (Default Dark)</div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <Input
                  label="Banner Image URL"
                  value={config.cta.bannerImageUrl || ''}
                  placeholder="https://... or /image.jpg"
                  onChange={(e) => setConfig({ ...config, cta: { ...config.cta, bannerImageUrl: e.target.value } })}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    disabled={uploadingTarget === 'cta'}
                    onClick={() => ctaImageInputRef.current?.click()}
                  >
                    <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-[#8C6228]" />
                    {uploadingTarget === 'cta' ? 'Uploading...' : 'Upload Image to Cloudinary'}
                  </Button>
                  {config.cta.bannerImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs text-red-600 hover:bg-red-50"
                      onClick={() => setConfig({ ...config, cta: { ...config.cta, bannerImageUrl: '' } })}
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Badges */}
          <div className="border-t border-[#ECE6DE] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[#1C1815]">Trust Badges</h3>
              <Button
                type="button"
                variant="outline"
                className="text-xs py-1 px-2.5"
                onClick={() =>
                  setConfig({
                    ...config,
                    cta: {
                      ...config.cta,
                      badges: [...(config.cta.badges || []), { _key: generateKey('ct'), text: 'New Trust Badge', icon: 'award', active: true }],
                    },
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Add Badge
              </Button>
            </div>

            <div className="space-y-2">
              {config.cta.badges?.map((badge, idx) => (
                <div key={badge._key} className="flex items-center gap-2 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] p-2.5">
                  <Input
                    value={badge.text}
                    placeholder="Badge Text"
                    className="flex-1 text-xs"
                    onChange={(e) => {
                      const updated = [...config.cta.badges];
                      updated[idx].text = e.target.value;
                      setConfig({ ...config, cta: { ...config.cta, badges: updated } });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 p-1.5"
                    onClick={() => {
                      const updated = config.cta.badges.filter((_, i) => i !== idx);
                      setConfig({ ...config, cta: { ...config.cta, badges: updated } });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-4 z-40 flex items-center justify-between rounded-2xl border border-[#c4a05a]/50 bg-[#1C1815] px-6 py-3.5 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#c4a05a] animate-pulse" />
          <p className="text-xs font-semibold text-slate-200">
            Editing {activeTab.toUpperCase()} Section
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={busy}
            className="text-slate-300 hover:text-white hover:bg-white/10 text-xs"
          >
            Reset
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="bg-[#c4a05a] text-[#1C1815] hover:bg-[#b08b3c] font-bold text-xs px-5 shadow-md"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {busy ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
