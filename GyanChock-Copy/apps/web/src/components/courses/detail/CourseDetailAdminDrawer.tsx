'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  HelpCircle,
  Award,
  Video,
  CheckCircle,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { uploadCloudinaryImage } from '@/lib/upload';
import type {
  CourseDetail,
  CourseHighlight,
  CourseFeature,
  CourseIncludeItem,
  CourseCurriculumModule,
  CourseBannerItem,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface CourseDetailAdminDrawerProps {
  course: CourseDetail;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

type TabType =
  | 'hero_banner'
  | 'pricing_stats'
  | 'highlights_includes'
  | 'features_outcomes'
  | 'curriculum'
  | 'instructor'
  | 'faqs_cta'
  | 'visibility';

export function CourseDetailAdminDrawer({
  course,
  open,
  onClose,
  onUpdated,
}: CourseDetailAdminDrawerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('hero_banner');
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingInstructor, setUploadingInstructor] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Premium Course');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('12 Months');
  const [level, setLevel] = useState('Advanced');
  const [price, setPrice] = useState('4999');
  const [comparePrice, setComparePrice] = useState('8999');
  const [discountPercent, setDiscountPercent] = useState('40');
  const [validityDays, setValidityDays] = useState('365');
  const [enrollmentCount, setEnrollmentCount] = useState('25000');

  // Banner State
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerPublicId, setBannerPublicId] = useState('');
  const [banners, setBanners] = useState<CourseBannerItem[]>([]);

  // Highlights State
  const [highlights, setHighlights] = useState<CourseHighlight[]>([]);

  // Includes State
  const [includes, setIncludes] = useState<CourseIncludeItem[]>([]);

  // Features State
  const [features, setFeatures] = useState<CourseFeature[]>([]);

  // Outcomes State
  const [outcomes, setOutcomes] = useState<string[]>([]);

  // Curriculum State
  const [curriculum, setCurriculum] = useState<CourseCurriculumModule[]>([]);

  // Instructor State
  const [instructorName, setInstructorName] = useState('');
  const [instructorRole, setInstructorRole] = useState('');
  const [instructorQualification, setInstructorQualification] = useState('');
  const [instructorExperience, setInstructorExperience] = useState('');
  const [instructorExpertise, setInstructorExpertise] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorAvatarUrl, setInstructorAvatarUrl] = useState('');

  // FAQs State
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  // Final CTA State
  const [finalCtaTitle, setFinalCtaTitle] = useState('Ready to start learning?');
  const [finalCtaSubtitle, setFinalCtaSubtitle] = useState(
    'Join the course and start your learning journey with expert guidance.',
  );
  const [finalCtaButtonText, setFinalCtaButtonText] = useState('Enroll Now');
  const [finalCtaEnabled, setFinalCtaEnabled] = useState(true);

  // Section Visibility State
  const [visibility, setVisibility] = useState({
    overview: true,
    whatYouLearn: true,
    features: true,
    includes: true,
    syllabus: true,
    instructors: true,
    faqs: true,
    finalCta: true,
  });

  // Section Order State
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'overview',
    'whatYouLearn',
    'features',
    'includes',
    'syllabus',
    'instructors',
    'faqs',
    'finalCta',
  ]);

  // Sync state on open
  useEffect(() => {
    if (!course || !open) return;

    setTitle(course.title || '');
    setSubtitle(course.subtitle || '');
    setDescription(course.description || '');
    setBadge(course.badge || 'Premium Course');
    setCategory(course.category || '');
    setDuration(course.duration || '12 Months');
    setLevel(course.level || 'Advanced');
    setPrice(String(course.price ?? 4999));
    setComparePrice(String(course.comparePrice ?? (course.price ? Math.round(course.price * 1.6) : 8999)));
    setDiscountPercent(String(course.discountPercent ?? 40));
    setValidityDays(String(course.validityDays ?? 365));
    setEnrollmentCount(String(course.enrollmentCount ?? 25000));

    // Banner
    setBannerUrl(course.banner?.url || course.thumbnail?.url || '');
    setBannerPublicId(course.banner?.publicId || '');
    setBanners(course.banners || []);

    // Highlights
    setHighlights(
      course.highlights?.length
        ? course.highlights.map((h) => {
            if (
              h.title === 'Recorded Class' ||
              h.subtitle === 'Interactive Sessions' ||
              (h.title === 'Live Classes' && h.subtitle === 'Interactive Sessions')
            ) {
              return {
                ...h,
                title: 'Study Material',
                subtitle: 'Comprehensive Notes',
                icon: 'book',
              };
            }
            return h;
          })
        : [
            { title: 'Study Material', subtitle: 'Comprehensive Notes', icon: 'book' },
            { title: 'Recorded Lectures', subtitle: 'Watch Anytime', icon: 'play' },
            { title: 'Doubt Support', subtitle: '24/7 Help', icon: 'help' },
          ],
    );

    // Includes
    setIncludes(
      course.includes?.length
        ? course.includes
        : [
            { title: 'Video Lectures', subtitle: '200+ Hours', icon: 'video' },
            { title: 'Mock Tests', subtitle: '50+ Tests', icon: 'test' },
            { title: 'Study Material', subtitle: 'PDF Notes + E-Books', icon: 'book' },
            { title: 'Doubt Sessions', subtitle: 'Live & Recorded', icon: 'chat' },
            { title: 'Validity', subtitle: `${course.validityDays ?? 365} Days`, icon: 'clock' },
          ],
    );

    // Features
    setFeatures(
      course.features?.length
        ? course.features
        : [
            { title: 'Complete Syllabus Coverage', description: 'NCERT + Advanced Level Concepts', icon: 'book' },
            { title: 'Regular Mock Tests', description: 'Build speed & accuracy', icon: 'test' },
            { title: 'Live & Recorded Classes', description: 'Flexible learning options', icon: 'video' },
            { title: 'Performance Analysis', description: 'Track your progress', icon: 'analytics' },
            { title: 'Expert Faculty', description: 'IIT/NIT Qualified Teachers', icon: 'faculty' },
            { title: 'Doubt Support', description: 'Get help anytime, anywhere', icon: 'doubt' },
          ],
    );

    // Outcomes
    setOutcomes(
      course.outcomes?.length
        ? course.outcomes
        : [
            'Master fundamental to advanced concepts required for competitive exams',
            'Learn structured problem-solving methodologies from top educators',
            'Practice with high-yield mock tests and video solutions',
            'Receive continuous mentor support and performance analytics',
          ],
    );

    // Curriculum
    setCurriculum(
      course.curriculum?.length
        ? course.curriculum
        : [
            {
              moduleTitle: 'Module 01: Core Foundations & Mechanics',
              moduleSubtitle: 'Units, Kinematics, Laws of Motion, Work Energy & Power',
              topics: [
                'Vectors, Dimensional Analysis & Measurements',
                'Kinematics in 1D & 2D Motion',
                'Newton’s Laws of Motion & Friction Dynamics',
                'Work, Energy, Power & Circular Dynamics',
              ],
            },
            {
              moduleTitle: 'Module 02: Advanced Concepts & Thermodynamics',
              moduleSubtitle: 'System of Particles, Rotational Motion & Thermal Physics',
              topics: [
                'Center of Mass, Momentum & Collisions',
                'Rotational Dynamics & Moment of Inertia',
                'Kinetic Theory of Gases & Laws of Thermodynamics',
                'Heat Transfer, Calorimetry & Thermal Expansion',
              ],
            },
            {
              moduleTitle: 'Module 03: Electromagnetism & Modern Physics',
              moduleSubtitle: 'Electrostatics, Magnetism, Optics & Quantum Theory',
              topics: [
                'Electric Charges, Fields & Gauss’s Law',
                'Current Electricity & Magnetic Effects of Current',
                'Electromagnetic Induction & Alternating Current',
                'Wave Optics, Ray Optics & Dual Nature of Matter',
              ],
            },
          ],
    );

    // Instructor
    const teacher = course.teachers?.[0];
    const info = course.instructorInfo;
    setInstructorName(info?.name || teacher?.name || course.teacherName || 'Senior Faculty Member');
    setInstructorRole(info?.role || teacher?.headline || `${course.category || 'Core'} Master Faculty`);
    setInstructorQualification(info?.qualification || (teacher as any)?.qualification || 'IIT / NIT Graduate');
    setInstructorExperience(info?.experience || (teacher as any)?.experience || '10+ Years Experience');
    setInstructorExpertise(
      info?.expertise ||
        (Array.isArray(teacher?.expertise) ? teacher.expertise.join(', ') : 'Concept Clarity, Problem Solving'),
    );
    setInstructorBio(
      info?.bio ||
        teacher?.bio ||
        'Renowned educator dedicated to conceptual clarity, mentorship, and high-yield problem solving.',
    );
    setInstructorAvatarUrl(
      info?.avatarUrl ||
        teacher?.avatar?.url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    );

    // FAQs
    setFaqs(
      course.faqs?.length
        ? course.faqs
        : [
            {
              question: 'Who should enroll in this course?',
              answer: 'This course is designed for students seeking strong conceptual clarity and top rankings.',
            },
            {
              question: 'Will I get access to recorded lectures?',
              answer: 'Yes, all live classes are recorded in HD and accessible 24/7 along with lecture notes.',
            },
            {
              question: 'How long is the course validity?',
              answer: `You receive ${course.validityDays ?? 365} days of unlimited access from date of enrollment.`,
            },
          ],
    );

    // Final CTA
    setFinalCtaTitle(course.finalCta?.title || 'Ready to start learning?');
    setFinalCtaSubtitle(
      course.finalCta?.subtitle ||
        'Join the course and start your learning journey with expert guidance.',
    );
    setFinalCtaButtonText(course.finalCta?.buttonText || 'Enroll Now');
    setFinalCtaEnabled(course.finalCta?.enabled !== false);

    // Visibility
    setVisibility({
      overview: course.sectionVisibility?.overview !== false,
      whatYouLearn: course.sectionVisibility?.whatYouLearn !== false,
      features: course.sectionVisibility?.features !== false,
      includes: course.sectionVisibility?.includes !== false,
      syllabus: course.sectionVisibility?.syllabus !== false,
      instructors: course.sectionVisibility?.instructors !== false,
      faqs: course.sectionVisibility?.faqs !== false,
      finalCta: course.sectionVisibility?.finalCta !== false,
    });

    if (course.sectionOrder?.length) {
      setSectionOrder(course.sectionOrder);
    }
  }, [course, open]);

  if (!open) return null;

  // Handle Banner Upload
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const media = await uploadCloudinaryImage(file, 'banners');
      setBannerUrl(media.url);
      setBannerPublicId(media.publicId);
      toast.success('Course banner image uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingBanner(false);
    }
  }

  // Handle Instructor Avatar Upload
  async function handleInstructorAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInstructor(true);
    try {
      const media = await uploadCloudinaryImage(file, 'cms');
      setInstructorAvatarUrl(media.url);
      toast.success('Instructor photo uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingInstructor(false);
    }
  }

  // Save all changes
  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        badge: badge.trim(),
        category: category.trim(),
        duration: duration.trim(),
        level: level.trim(),
        price: Number(price) || 0,
        comparePrice: Number(comparePrice) || 0,
        discountPercent: Number(discountPercent) || 0,
        validityDays: Number(validityDays) || 365,
        enrollmentCount: Number(enrollmentCount) || 0,
        banner: bannerUrl ? { url: bannerUrl, publicId: bannerPublicId } : undefined,
        banners,
        highlights,
        includes,
        features,
        outcomes,
        curriculum,
        instructorInfo: {
          name: instructorName.trim(),
          role: instructorRole.trim(),
          qualification: instructorQualification.trim(),
          experience: instructorExperience.trim(),
          expertise: instructorExpertise.trim(),
          bio: instructorBio.trim(),
          avatarUrl: instructorAvatarUrl.trim(),
        },
        faqs,
        finalCta: {
          title: finalCtaTitle.trim(),
          subtitle: finalCtaSubtitle.trim(),
          buttonText: finalCtaButtonText.trim(),
          enabled: finalCtaEnabled,
        },
        sectionVisibility: visibility,
        sectionOrder,
      };

      await api(`/api/courses/${course._id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      await queryClient.invalidateQueries({ queryKey: ['course', course.slug] });
      await queryClient.invalidateQueries({ queryKey: ['courses'] });

      toast.success('Course Detail page updated successfully!');
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  // Helper for reordering section items
  function moveSectionItem(index: number, direction: 'up' | 'down') {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionOrder(newOrder);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                Course Detail Manager
              </span>
              <h2 className="text-lg font-bold text-slate-900 truncate max-w-md">
                {course.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize course hero, banners, pricing, curriculum, instructors, FAQs & layout order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-500 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 overflow-x-auto no-scrollbar gap-1 text-xs font-semibold text-slate-600">
          {[
            { id: 'hero_banner', label: 'Hero & Banner' },
            { id: 'pricing_stats', label: 'Pricing & Stats' },
            { id: 'highlights_includes', label: 'Highlights & Includes' },
            { id: 'features_outcomes', label: 'Features & Outcomes' },
            { id: 'curriculum', label: 'Curriculum' },
            { id: 'instructor', label: 'Instructor' },
            { id: 'faqs_cta', label: 'FAQs & CTA' },
            { id: 'visibility', label: 'Visibility & Order' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'px-3.5 py-2.5 border-b-2 transition whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900 bg-white font-bold rounded-t-lg'
                  : 'border-transparent hover:text-slate-900 hover:bg-slate-100/60',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: HERO & BANNER */}
          {activeTab === 'hero_banner' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. JEE Main & Advanced"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Premium Course"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Complete Preparation Program"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Engineering, IT, Foundation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Course Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="Comprehensive description of the course curriculum, educator guidance, and study approach..."
                />
              </div>

              {/* Banner Upload & Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Main Course Banner Visual
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-slate-900">
                    {bannerUrl ? (
                      <Image
                        src={bannerUrl}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No Banner
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-slate-500">
                      Upload a high-resolution 16:9 banner image (JPG, PNG, WebP) displaying on the hero left column.
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                        <span>{uploadingBanner ? 'Uploading…' : 'Upload Banner'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          className="hidden"
                          disabled={uploadingBanner}
                        />
                      </label>
                      {bannerUrl && (
                        <button
                          type="button"
                          onClick={() => setBannerUrl('')}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STATS */}
          {activeTab === 'pricing_stats' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="4999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Price / Struck-through (₹)
                  </label>
                  <input
                    type="number"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="8999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="365"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. 12 Months"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Advanced / Beginner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrolled Students Count
                </label>
                <input
                  type="number"
                  value={enrollmentCount}
                  onChange={(e) => setEnrollmentCount(e.target.value)}
                  className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="25482"
                />
              </div>
            </div>
          )}

          {/* TAB 3: HIGHLIGHTS & INCLUDES */}
          {activeTab === 'highlights_includes' && (
            <div className="space-y-6">
              {/* Highlights */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Hero 3 Highlights (Icons & Subtitles)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setHighlights([
                        ...highlights,
                        { title: 'New Highlight', subtitle: 'Support Details', icon: 'video' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Highlight</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
                    >
                      <input
                        type="text"
                        value={h.title}
                        onChange={(e) => {
                          const updated = [...highlights];
                          updated[idx].title = e.target.value;
                          setHighlights(updated);
                        }}
                        className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        placeholder="Title (e.g. Live Classes)"
                      />
                      <input
                        type="text"
                        value={h.subtitle || ''}
                        onChange={(e) => {
                          const updated = [...highlights];
                          updated[idx].subtitle = e.target.value;
                          setHighlights(updated);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600"
                        placeholder="Subtitle (e.g. Interactive Sessions)"
                      />
                      <button
                        type="button"
                        onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Includes */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Course Includes Card Items
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setIncludes([
                        ...includes,
                        { title: 'New Include Item', subtitle: 'Detail note', icon: 'book' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {includes.map((inc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
                    >
                      <input
                        type="text"
                        value={inc.title}
                        onChange={(e) => {
                          const updated = [...includes];
                          updated[idx].title = e.target.value;
                          setIncludes(updated);
                        }}
                        className="w-1/3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        placeholder="Title (e.g. Video Lectures)"
                      />
                      <input
                        type="text"
                        value={inc.subtitle || ''}
                        onChange={(e) => {
                          const updated = [...includes];
                          updated[idx].subtitle = e.target.value;
                          setIncludes(updated);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600"
                        placeholder="Subtitle (e.g. 200+ Hours)"
                      />
                      <button
                        type="button"
                        onClick={() => setIncludes(includes.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES & OUTCOMES */}
          {activeTab === 'features_outcomes' && (
            <div className="space-y-6">
              {/* Features Grid */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Course Features & Benefits (2x3 Grid)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFeatures([
                        ...features,
                        {
                          title: 'New Benefit',
                          description: 'Description of the feature benefit',
                          icon: 'book',
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Benefit</span>
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                        className="absolute right-2 top-2 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                          Feature Heading
                        </label>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[idx].title = e.target.value;
                            setFeatures(updated);
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={feat.description}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[idx].description = e.target.value;
                            setFeatures(updated);
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    &quot;What You&apos;ll Learn&quot; Outcomes
                  </h4>
                  <button
                    type="button"
                    onClick={() => setOutcomes([...outcomes, 'New learning objective'])}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Outcome</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {outcomes.map((out, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={out}
                        onChange={(e) => {
                          const updated = [...outcomes];
                          updated[idx] = e.target.value;
                          setOutcomes(updated);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setOutcomes(outcomes.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Syllabus Modules & Topics
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add modules and define topics covered under each accordion.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurriculum([
                      ...curriculum,
                      {
                        moduleTitle: `Module ${String(curriculum.length + 1).padStart(2, '0')}: New Module`,
                        moduleSubtitle: 'Foundational concepts',
                        topics: ['Topic 1', 'Topic 2'],
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="space-y-4">
                {curriculum.map((mod, mIdx) => (
                  <div
                    key={mIdx}
                    className="rounded-2xl border border-slate-300/80 bg-white p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold shrink-0">
                        {mIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={mod.moduleTitle}
                        onChange={(e) => {
                          const updated = [...curriculum];
                          updated[mIdx].moduleTitle = e.target.value;
                          setCurriculum(updated);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        placeholder="e.g. Module 01: Physics"
                      />
                      <button
                        type="button"
                        onClick={() => setCurriculum(curriculum.filter((_, i) => i !== mIdx))}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete module"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={mod.moduleSubtitle || ''}
                      onChange={(e) => {
                        const updated = [...curriculum];
                        updated[mIdx].moduleSubtitle = e.target.value;
                        setCurriculum(updated);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500"
                      placeholder="Module subtitle / topics summary"
                    />

                    {/* Topics List */}
                    <div className="border-t border-slate-100 pt-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                          Topics ({mod.topics.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...curriculum];
                            updated[mIdx].topics.push(`New Topic ${mod.topics.length + 1}`);
                            setCurriculum(updated);
                          }}
                          className="text-[11px] font-semibold text-amber-700 hover:underline"
                        >
                          + Add Topic
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {mod.topics.map((t, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={t}
                              onChange={(e) => {
                                const updated = [...curriculum];
                                updated[mIdx].topics[tIdx] = e.target.value;
                                setCurriculum(updated);
                              }}
                              className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...curriculum];
                                updated[mIdx].topics = updated[mIdx].topics.filter(
                                  (_, i) => i !== tIdx,
                                );
                                setCurriculum(updated);
                              }}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INSTRUCTOR */}
          {activeTab === 'instructor' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher / Faculty Name *
                  </label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Dr. Aryan Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role / Headline
                  </label>
                  <input
                    type="text"
                    value={instructorRole}
                    onChange={(e) => setInstructorRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Senior Master Physics Faculty"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={instructorQualification}
                    onChange={(e) => setInstructorQualification(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. B.Tech, IIT Bombay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={instructorExperience}
                    onChange={(e) => setInstructorExperience(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. 12+ Years Teaching Experience"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expertise Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={instructorExpertise}
                  onChange={(e) => setInstructorExpertise(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. Mechanics, Problem Solving, Advanced Revision"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Faculty Biography
                </label>
                <textarea
                  rows={3}
                  value={instructorBio}
                  onChange={(e) => setInstructorBio(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Avatar Upload */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Educator Photo
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-100">
                    {instructorAvatarUrl ? (
                      <Image
                        src={instructorAvatarUrl}
                        alt="Instructor Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>{uploadingInstructor ? 'Uploading…' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInstructorAvatarUpload}
                        className="hidden"
                        disabled={uploadingInstructor}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FAQS & CTA */}
          {activeTab === 'faqs_cta' && (
            <div className="space-y-6">
              {/* FAQs */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Frequently Asked Questions
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFaqs([
                        ...faqs,
                        { question: 'New Question?', answer: 'Detailed helpful answer.' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        className="absolute right-2 top-2 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const updated = [...faqs];
                          updated[idx].question = e.target.value;
                          setFaqs(updated);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800"
                        placeholder="Question"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = [...faqs];
                          updated[idx].answer = e.target.value;
                          setFaqs(updated);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                        placeholder="Answer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final CTA */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Final Enrollment CTA Banner
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={finalCtaEnabled}
                      onChange={(e) => setFinalCtaEnabled(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Enable CTA Banner</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Title
                  </label>
                  <input
                    type="text"
                    value={finalCtaTitle}
                    onChange={(e) => setFinalCtaTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Subtitle
                  </label>
                  <input
                    type="text"
                    value={finalCtaSubtitle}
                    onChange={(e) => setFinalCtaSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={finalCtaButtonText}
                    onChange={(e) => setFinalCtaButtonText(e.target.value)}
                    className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: VISIBILITY & ORDER */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              {/* Section Visibility */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Section Visibility Toggles
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    { key: 'overview', label: 'About Course & Description' },
                    { key: 'whatYouLearn', label: "What You'll Learn Outcomes" },
                    { key: 'features', label: 'Course Features & Benefits' },
                    { key: 'includes', label: 'Course Includes Card' },
                    { key: 'syllabus', label: 'Syllabus & Curriculum' },
                    { key: 'instructors', label: 'Instructor Profile' },
                    { key: 'faqs', label: 'Frequently Asked Questions' },
                    { key: 'finalCta', label: 'Final Enrollment CTA' },
                  ].map(({ key, label }) => {
                    const isVisible = visibility[key as keyof typeof visibility] !== false;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setVisibility({
                              ...visibility,
                              [key]: !isVisible,
                            })
                          }
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold text-[11px] transition',
                            isVisible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600',
                          )}
                        >
                          {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{isVisible ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section Order */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Section Rendering Order
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Reorder how sections appear from top to bottom on the Course Detail Page.
                </p>

                <div className="space-y-2">
                  {sectionOrder.map((sec, idx) => (
                    <div
                      key={sec}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {idx + 1}
                        </span>
                        <span className="capitalize">{sec.replace(/([A-Z])/g, ' $1')}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSectionItem(idx, 'up')}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sectionOrder.length - 1}
                          onClick={() => moveSectionItem(idx, 'down')}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <p className="text-xs text-slate-500">
            Changes are saved directly to database and update immediately.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-500 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
