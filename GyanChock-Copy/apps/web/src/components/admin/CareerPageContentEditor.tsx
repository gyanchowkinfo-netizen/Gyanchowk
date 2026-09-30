'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/image';
import Image from 'next/image';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  X,
  ExternalLink,
  Search,
  Eye,
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  Layers,
  Heart,
  Users,
  Award,
  BookOpen,
  Send,
  Building,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { uploadCloudinaryImage } from '@/lib/upload';
import type {
  CareerPageConfig,
  CareerJob,
  CareerWhyCard,
  CareerLifeCard,
  CareerTestimonialItem,
} from '@/lib/types';
import { DEFAULT_CAREER_PAGE_CONFIG, normalizeCareerPageConfig } from '@/lib/types';

export function CareerPageContentEditor() {
  const queryClient = useQueryClient();
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const lifeImageInputRef = useRef<HTMLInputElement>(null);
  const testimonialImageInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<
    'hero' | 'why' | 'jobs' | 'life' | 'testimonials' | 'cta'
  >('hero');

  // Page config query
  const configQuery = useQuery({
    queryKey: ['career-admin-config'],
    queryFn: () => api<{ config?: CareerPageConfig }>('/api/career/admin/page-config'),
  });

  // Jobs query
  const jobsQuery = useQuery({
    queryKey: ['career-admin-jobs'],
    queryFn: () => api<{ items?: CareerJob[]; total?: number }>('/api/career/admin/jobs'),
  });

  const [config, setConfig] = useState<CareerPageConfig>(DEFAULT_CAREER_PAGE_CONFIG);
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Job Search / Filters
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobDeptFilter, setJobDeptFilter] = useState('All Departments');

  // Job Modal State
  const [editingJob, setEditingJob] = useState<CareerJob | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [deleteConfirmJobId, setDeleteConfirmJobId] = useState<string | null>(null);

  // Why Card Modal State
  const [editingWhyCard, setEditingWhyCard] = useState<CareerWhyCard | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  // Life Card Modal State
  const [editingLifeCard, setEditingLifeCard] = useState<CareerLifeCard | null>(null);
  const [isLifeModalOpen, setIsLifeModalOpen] = useState(false);

  // Testimonial Modal State
  const [editingTestimonial, setEditingTestimonial] = useState<CareerTestimonialItem | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Reset Confirm Dialog
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (configQuery.data?.config) {
      setConfig(normalizeCareerPageConfig(configQuery.data.config));
    }
  }, [configQuery.data]);

  // Save Page Config
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await api('/api/career/admin/page-config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      toast.success('Career page settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['career-admin-config'] });
      queryClient.invalidateQueries({ queryKey: ['career-page-config'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingConfig(false);
    }
  };

  // Reset to Defaults
  const handleResetConfig = async () => {
    setSavingConfig(true);
    try {
      await api('/api/career/admin/reset-page-config', { method: 'POST' });
      setConfig(DEFAULT_CAREER_PAGE_CONFIG);
      toast.success('Reset to default career page configuration');
      setIsResetConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['career-admin-config'] });
      queryClient.invalidateQueries({ queryKey: ['career-page-config'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setSavingConfig(false);
    }
  };

  // Upload Image Handler
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'hero' | 'life' | 'testimonial'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    try {
      const res = await uploadCloudinaryImage(file, 'cms');
      if (target === 'hero') {
        setConfig((prev) => ({
          ...prev,
          hero: { ...prev.hero, imageUrl: res.url },
        }));
      } else if (target === 'life' && editingLifeCard) {
        setEditingLifeCard((prev) => (prev ? { ...prev, imageUrl: res.url } : null));
      } else if (target === 'testimonial' && editingTestimonial) {
        setEditingTestimonial((prev) => (prev ? { ...prev, photoUrl: res.url } : null));
      }
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingTarget(null);
      if (e.target) e.target.value = '';
    }
  };

  // Job Actions
  const handleSaveJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingJob) return;
    setSavingJob(true);

    try {
      if (editingJob._id) {
        // Update existing job
        await api(`/api/career/admin/jobs/${editingJob._id}`, {
          method: 'PUT',
          body: JSON.stringify(editingJob),
        });
        toast.success('Job opening updated successfully');
      } else {
        // Create new job
        await api('/api/career/admin/jobs', {
          method: 'POST',
          body: JSON.stringify(editingJob),
        });
        toast.success('Job opening created successfully');
      }
      setIsJobModalOpen(false);
      setEditingJob(null);
      queryClient.invalidateQueries({ queryKey: ['career-admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['career-jobs-list'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save job opening');
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await api(`/api/career/admin/jobs/${id}`, { method: 'DELETE' });
      toast.success('Job opening deleted');
      setDeleteConfirmJobId(null);
      queryClient.invalidateQueries({ queryKey: ['career-admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['career-jobs-list'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  const handleToggleJobStatus = async (job: CareerJob) => {
    const newStatus = job.status === 'published' ? 'draft' : 'published';
    try {
      await api(`/api/career/admin/jobs/${job._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Job marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['career-admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['career-jobs-list'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Why Cards Actions
  const handleSaveWhyCard = () => {
    if (!editingWhyCard) return;
    const cards = [...config.whyWorkWithUs.cards];
    const index = cards.findIndex((c) => c.id === editingWhyCard.id);
    if (index >= 0) {
      cards[index] = editingWhyCard;
    } else {
      cards.push(editingWhyCard);
    }
    setConfig((prev) => ({
      ...prev,
      whyWorkWithUs: { ...prev.whyWorkWithUs, cards },
    }));
    setIsWhyModalOpen(false);
    setEditingWhyCard(null);
    toast.success('Benefit card updated in draft (Save All to publish)');
  };

  const handleDeleteWhyCard = (id: string) => {
    const cards = config.whyWorkWithUs.cards.filter((c) => c.id !== id);
    setConfig((prev) => ({
      ...prev,
      whyWorkWithUs: { ...prev.whyWorkWithUs, cards },
    }));
    toast.success('Benefit card removed (Save All to publish)');
  };

  // Life Cards Actions
  const handleSaveLifeCard = () => {
    if (!editingLifeCard) return;
    const cards = [...config.lifeAtGyanChowk.cards];
    const index = cards.findIndex((c) => c.id === editingLifeCard.id);
    if (index >= 0) {
      cards[index] = editingLifeCard;
    } else {
      cards.push(editingLifeCard);
    }
    setConfig((prev) => ({
      ...prev,
      lifeAtGyanChowk: { ...prev.lifeAtGyanChowk, cards },
    }));
    setIsLifeModalOpen(false);
    setEditingLifeCard(null);
    toast.success('Life item updated in draft (Save All to publish)');
  };

  const handleDeleteLifeCard = (id: string) => {
    const cards = config.lifeAtGyanChowk.cards.filter((c) => c.id !== id);
    setConfig((prev) => ({
      ...prev,
      lifeAtGyanChowk: { ...prev.lifeAtGyanChowk, cards },
    }));
    toast.success('Life item removed (Save All to publish)');
  };

  // Testimonial Actions
  const handleSaveTestimonial = () => {
    if (!editingTestimonial) return;
    const items = [...config.testimonials.items];
    const index = items.findIndex((t) => t.id === editingTestimonial.id);
    if (index >= 0) {
      items[index] = editingTestimonial;
    } else {
      items.push(editingTestimonial);
    }
    setConfig((prev) => ({
      ...prev,
      testimonials: { ...prev.testimonials, items },
    }));
    setIsTestimonialModalOpen(false);
    setEditingTestimonial(null);
    toast.success('Testimonial updated in draft (Save All to publish)');
  };

  const handleDeleteTestimonial = (id: string) => {
    const items = config.testimonials.items.filter((t) => t.id !== id);
    setConfig((prev) => ({
      ...prev,
      testimonials: { ...prev.testimonials, items },
    }));
    toast.success('Testimonial removed (Save All to publish)');
  };

  // Filtered jobs for admin list
  const allJobs = jobsQuery.data?.items ?? [];
  const filteredAdminJobs = allJobs.filter((job) => {
    if (jobStatusFilter !== 'all' && job.status !== jobStatusFilter) return false;
    if (jobDeptFilter !== 'All Departments' && job.department !== jobDeptFilter) return false;
    if (jobSearch.trim()) {
      const q = jobSearch.toLowerCase();
      const inTitle = job.title.toLowerCase().includes(q);
      const inDept = job.department.toLowerCase().includes(q);
      const inLoc = job.location.toLowerCase().includes(q);
      if (!inTitle && !inDept && !inLoc) return false;
    }
    return true;
  });

  const adminDepartments = Array.from(new Set(allJobs.map((j) => j.department).filter(Boolean))).sort();

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Page Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your career hero, benefit cards, open job listings, life at Gyan Chowk, and testimonials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/career"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <span>View Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingConfig ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-2xl shadow-xs">
        {[
          { key: 'hero', label: '🌟 Hero Section' },
          { key: 'why', label: '💡 Why Work With Us' },
          { key: 'jobs', label: '💼 Open Positions (Jobs)' },
          { key: 'life', label: '🏢 Life at Gyan Chowk' },
          { key: 'testimonials', label: '💬 Team Testimonials' },
          { key: 'cta', label: '🚀 Career CTA' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 font-semibold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Career Hero Section</h2>
              <p className="text-xs text-slate-500">Configure the top hero banner, typography, and benefit badges.</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hero.active}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, active: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Section Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Text fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eyebrow Badge Text</label>
                <input
                  type="text"
                  value={config.hero.badge}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="JOIN OUR TEAM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Main Heading</label>
                <textarea
                  rows={2}
                  value={config.hero.heading}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, heading: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-bold"
                  placeholder="Build Your Future With Us"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Supporting Description</label>
                <textarea
                  rows={3}
                  value={config.hero.description}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, description: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={config.hero.ctaText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaText: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CTA Button Link</label>
                  <input
                    type="text"
                    value={config.hero.ctaLink}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaLink: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 3 Benefits Management */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">3 Highlight Benefits</label>
                {config.hero.benefits.map((b, idx) => (
                  <div key={b.id || idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="text"
                      value={b.text}
                      onChange={(e) => {
                        const benefits = [...config.hero.benefits];
                        benefits[idx].text = e.target.value;
                        setConfig((prev) => ({ ...prev, hero: { ...prev.hero, benefits } }));
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={b.active}
                        onChange={(e) => {
                          const benefits = [...config.hero.benefits];
                          benefits[idx].active = e.target.checked;
                          setConfig((prev) => ({ ...prev, hero: { ...prev.hero, benefits } }));
                        }}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Image Preview & Upload */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hero Image</label>
              
              <div className="relative aspect-[4/3] w-full max-w-md rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                {config.hero.imageUrl ? (
                  <Image
                    src={config.hero.imageUrl}
                    alt={config.hero.imageAlt || 'Hero Preview'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No Image Uploaded</span>
                )}
                {uploadingTarget === 'hero' && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold">
                    Uploading image...
                  </div>
                )}
              </div>

              <div className="space-y-2 max-w-md">
                <input
                  type="file"
                  ref={heroImageInputRef}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'hero')}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => heroImageInputRef.current?.click()}
                    disabled={uploadingTarget === 'hero'}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload / Replace Image</span>
                  </button>
                  {config.hero.imageUrl !== '/career-hero.jpg' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, imageUrl: '/career-hero.jpg' },
                        }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Default
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mt-2">Image Alt Text</label>
                  <input
                    type="text"
                    value={config.hero.imageAlt}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, imageAlt: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs mt-1"
                    placeholder="Build your future with Gyan Chowk"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WHY WORK WITH US */}
      {/* ========================================================================= */}
      {activeTab === 'why' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Why Work With Us Cards</h2>
              <p className="text-xs text-slate-500">Manage the 5 horizontal benefit cards and section headings.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.whyWorkWithUs.active}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whyWorkWithUs: { ...prev.whyWorkWithUs, active: e.target.checked },
                    }))
                  }
                  className="rounded text-blue-600 cursor-pointer"
                />
                <span>Active</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setEditingWhyCard({
                    id: `w-${Date.now()}`,
                    icon: 'rocket',
                    title: 'New Benefit',
                    description: 'Description of this career benefit',
                    order: config.whyWorkWithUs.cards.length + 1,
                    active: true,
                  });
                  setIsWhyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Benefit Card</span>
              </button>
            </div>
          </div>

          {/* Section Heading Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eyebrow</label>
              <input
                type="text"
                value={config.whyWorkWithUs.eyebrow}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    whyWorkWithUs: { ...prev.whyWorkWithUs, eyebrow: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section Heading</label>
              <input
                type="text"
                value={config.whyWorkWithUs.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    whyWorkWithUs: { ...prev.whyWorkWithUs, heading: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <input
                type="text"
                value={config.whyWorkWithUs.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    whyWorkWithUs: { ...prev.whyWorkWithUs, description: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Cards List Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Icon</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.whyWorkWithUs.cards.map((card, idx) => (
                  <tr key={card.id || idx} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-500">{card.order || idx + 1}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono text-[11px]">
                        {card.icon}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{card.title}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{card.description}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          card.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {card.active ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWhyCard({ ...card });
                          setIsWhyModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWhyCard(card.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OPEN POSITIONS (JOBS CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'jobs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Job Openings Management</h2>
              <p className="text-xs text-slate-500">
                Create, update, publish/unpublish, and manage job openings across departments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingJob({
                  title: '',
                  department: 'Engineering',
                  location: 'Remote / Delhi',
                  workMode: 'Hybrid',
                  employmentType: 'Full-time',
                  experience: '1-3 years',
                  salaryRange: '',
                  description: '',
                  responsibilities: [],
                  requirements: [],
                  qualifications: [],
                  skills: [],
                  icon: 'code',
                  applyLink: '',
                  status: 'published',
                  displayOrder: allJobs.length + 1,
                });
                setIsJobModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Job Opening</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search jobs by title, department, location..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={jobDeptFilter}
              onChange={(e) => setJobDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <option value="All Departments">All Departments</option>
              {adminDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Job Title</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Location & Mode</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdminJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No jobs match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAdminJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900">
                        {job.title}
                        {job.experience && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            Exp: {job.experience}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {job.department}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{job.location}</div>
                        <span className="text-[10px] text-slate-400 font-medium">{job.workMode || 'Remote'} · {job.employmentType || 'Full-time'}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-500">{job.displayOrder || 0}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleJobStatus(job)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            job.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {job.status === 'published' ? '● Published' : `○ ${job.status}`}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingJob({ ...job });
                            setIsJobModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                          title="Edit Job"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmJobId(job._id || null)}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIFE AT GYAN CHOWK */}
      {/* ========================================================================= */}
      {activeTab === 'life' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Life at Gyan Chowk Section</h2>
              <p className="text-xs text-slate-500">Manage culture photos, icons, and descriptions.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.lifeAtGyanChowk.active}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      lifeAtGyanChowk: { ...prev.lifeAtGyanChowk, active: e.target.checked },
                    }))
                  }
                  className="rounded text-blue-600 cursor-pointer"
                />
                <span>Active</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setEditingLifeCard({
                    id: `l-${Date.now()}`,
                    icon: 'users',
                    title: 'New Culture Highlight',
                    description: 'Description of company culture item',
                    imageUrl: '/career-life-1.jpg',
                    order: config.lifeAtGyanChowk.cards.length + 1,
                    active: true,
                  });
                  setIsLifeModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Life Item</span>
              </button>
            </div>
          </div>

          {/* Section Headings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eyebrow</label>
              <input
                type="text"
                value={config.lifeAtGyanChowk.eyebrow}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    lifeAtGyanChowk: { ...prev.lifeAtGyanChowk, eyebrow: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Heading</label>
              <input
                type="text"
                value={config.lifeAtGyanChowk.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    lifeAtGyanChowk: { ...prev.lifeAtGyanChowk, heading: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <input
                type="text"
                value={config.lifeAtGyanChowk.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    lifeAtGyanChowk: { ...prev.lifeAtGyanChowk, description: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.lifeAtGyanChowk.cards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-slate-200">
                  {card.imageUrl && (
                    <Image src={card.imageUrl} alt={card.title} fill className="object-cover" />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                    Order {card.order || idx + 1}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{card.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold ${
                        card.active ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {card.active ? '● Active' : '○ Inactive'}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLifeCard({ ...card });
                          setIsLifeModalOpen(true);
                        }}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLifeCard(card.id)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TEAM TESTIMONIALS */}
      {/* ========================================================================= */}
      {activeTab === 'testimonials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Team Testimonials Carousel</h2>
              <p className="text-xs text-slate-500">Manage employee stories, quotes, photos, and designations.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.testimonials.active}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      testimonials: { ...prev.testimonials, active: e.target.checked },
                    }))
                  }
                  className="rounded text-blue-600 cursor-pointer"
                />
                <span>Active</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setEditingTestimonial({
                    id: `t-${Date.now()}`,
                    name: 'Employee Name',
                    designation: 'Role Title',
                    quote: 'Quote about working at Gyan Chowk',
                    photoUrl: '/career-testimonial-1.jpg',
                    order: config.testimonials.items.length + 1,
                    active: true,
                  });
                  setIsTestimonialModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Testimonial</span>
              </button>
            </div>
          </div>

          {/* Section Headings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eyebrow</label>
              <input
                type="text"
                value={config.testimonials.eyebrow}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, eyebrow: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Heading</label>
              <input
                type="text"
                value={config.testimonials.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, heading: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          {/* Testimonials List */}
          <div className="space-y-3">
            {config.testimonials.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    {item.photoUrl && (
                      <Image src={item.photoUrl} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.name}{' '}
                      <span className="text-xs text-slate-400 font-normal">({item.designation})</span>
                    </h4>
                    <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold ${
                      item.active ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTestimonial({ ...item });
                      setIsTestimonialModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(item.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CAREER CTA */}
      {/* ========================================================================= */}
      {activeTab === 'cta' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Career Bottom CTA Banner</h2>
              <p className="text-xs text-slate-500">Configure the dark navy bottom banner and action button.</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.cta.active}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    cta: { ...prev.cta, active: e.target.checked },
                  }))
                }
                className="rounded text-blue-600 cursor-pointer"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Heading</label>
              <input
                type="text"
                value={config.cta.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    cta: { ...prev.cta, heading: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={config.cta.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    cta: { ...prev.cta, description: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Button Text</label>
                <input
                  type="text"
                  value={config.cta.buttonText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cta: { ...prev.cta, buttonText: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Button Link</label>
                <input
                  type="text"
                  value={config.cta.buttonLink}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cta: { ...prev.cta, buttonLink: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT JOB */}
      {/* ========================================================================= */}
      {isJobModalOpen && editingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsJobModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingJob._id ? 'Edit Job Opening' : 'Add New Job Opening'}
              </h3>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="e.g. Remote / Delhi"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Work Mode</label>
                  <select
                    value={editingJob.workMode || 'Remote'}
                    onChange={(e) => setEditingJob({ ...editingJob, workMode: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Employment Type</label>
                  <select
                    value={editingJob.employmentType || 'Full-time'}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, employmentType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Experience</label>
                  <input
                    type="text"
                    value={editingJob.experience || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="e.g. 1-3 years"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={editingJob.salaryRange || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="e.g. ₹6-10 LPA"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={editingJob.status}
                    onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-blue-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  placeholder="Overview of the role..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Responsibilities (one per line)
                </label>
                <textarea
                  rows={3}
                  value={(editingJob.responsibilities || []).join('\n')}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      responsibilities: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  placeholder="Build APIs\nCollaborate with design team"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Requirements (one per line)
                </label>
                <textarea
                  rows={3}
                  value={(editingJob.requirements || []).join('\n')}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      requirements: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  placeholder="2+ years React experience\nGood communication skills"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={(editingJob.skills || []).join(', ')}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Application Link (optional)</label>
                  <input
                    type="text"
                    value={editingJob.applyLink || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, applyLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="https://... or empty for mailto"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingJob.displayOrder || 0}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  {savingJob ? 'Saving...' : 'Save Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WHY WORK WITH US CARD */}
      {/* ========================================================================= */}
      {isWhyModalOpen && editingWhyCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsWhyModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Benefit Card</h3>
              <button
                type="button"
                onClick={() => setIsWhyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={editingWhyCard.title}
                  onChange={(e) => setEditingWhyCard({ ...editingWhyCard, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingWhyCard.description}
                  onChange={(e) =>
                    setEditingWhyCard({ ...editingWhyCard, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Icon</label>
                  <select
                    value={editingWhyCard.icon}
                    onChange={(e) => setEditingWhyCard({ ...editingWhyCard, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="rocket">Rocket</option>
                    <option value="trending-up">Trending Up</option>
                    <option value="users">Users / Team</option>
                    <option value="lightbulb">Lightbulb / Innovation</option>
                    <option value="star">Star / Benefits</option>
                    <option value="heart">Heart</option>
                    <option value="award">Award</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingWhyCard.order}
                    onChange={(e) =>
                      setEditingWhyCard({ ...editingWhyCard, order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={editingWhyCard.active}
                  onChange={(e) => setEditingWhyCard({ ...editingWhyCard, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Active</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWhyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveWhyCard}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIFE AT GYAN CHOWK CARD */}
      {/* ========================================================================= */}
      {isLifeModalOpen && editingLifeCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsLifeModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Life at Gyan Chowk Item</h3>
              <button
                type="button"
                onClick={() => setIsLifeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={editingLifeCard.title}
                  onChange={(e) => setEditingLifeCard({ ...editingLifeCard, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingLifeCard.description}
                  onChange={(e) =>
                    setEditingLifeCard({ ...editingLifeCard, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Card Image</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {editingLifeCard.imageUrl && (
                      <Image
                        src={editingLifeCard.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={lifeImageInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'life')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => lifeImageInputRef.current?.click()}
                    disabled={uploadingTarget === 'life'}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    {uploadingTarget === 'life' ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Icon</label>
                  <select
                    value={editingLifeCard.icon}
                    onChange={(e) => setEditingLifeCard({ ...editingLifeCard, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="users">Users / Team</option>
                    <option value="book-open">Book / Learning</option>
                    <option value="heart">Heart / Culture</option>
                    <option value="send">Send / Impact</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingLifeCard.order}
                    onChange={(e) =>
                      setEditingLifeCard({ ...editingLifeCard, order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={editingLifeCard.active}
                  onChange={(e) => setEditingLifeCard({ ...editingLifeCard, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Active</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLifeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLifeCard}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TESTIMONIAL ITEM */}
      {/* ========================================================================= */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsTestimonialModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Team Testimonial</h3>
              <button
                type="button"
                onClick={() => setIsTestimonialModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={editingTestimonial.name}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingTestimonial.designation}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, designation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Testimonial Quote</label>
                <textarea
                  rows={3}
                  value={editingTestimonial.quote}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Employee Photo</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {editingTestimonial.photoUrl && (
                      <Image
                        src={editingTestimonial.photoUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={testimonialImageInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'testimonial')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => testimonialImageInputRef.current?.click()}
                    disabled={uploadingTarget === 'testimonial'}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    {uploadingTarget === 'testimonial' ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingTestimonial.order}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      order: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={editingTestimonial.active}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, active: e.target.checked })
                  }
                  className="rounded text-blue-600"
                />
                <span>Active</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTestimonial}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG FOR JOB */}
      {/* ========================================================================= */}
      {deleteConfirmJobId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setDeleteConfirmJobId(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Job Opening?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this job opening? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmJobId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteJob(deleteConfirmJobId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET TO DEFAULTS CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {isResetConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsResetConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reset to Defaults?</h3>
            <p className="text-xs text-slate-500">
              This will restore all default section content, headings, and benefit cards matching the design reference.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetConfig}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
