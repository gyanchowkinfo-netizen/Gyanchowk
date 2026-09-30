'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  X,
  Save,
  ImagePlus,
  Trash2,
  Plus,
  Star,
  User,
  BookOpen,
  Award,
  MessageSquare,
  Sparkles,
  Search,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import type { TeacherCardData } from '@/lib/types';

type FormTab =
  | 'basic'
  | 'professional'
  | 'media'
  | 'stats'
  | 'quote'
  | 'doubt'
  | 'achievements'
  | 'reviews'
  | 'courses'
  | 'seo';

export function TeacherEditModal({
  teacher,
  open,
  onClose,
  onSaved,
}: {
  teacher?: TeacherCardData | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(teacher?._id);

  const [activeTab, setActiveTab] = useState<FormTab>('basic');

  // Basic info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('5+ Years');
  const [education, setEducation] = useState('');
  const [location, setLocation] = useState('Online / New Delhi');
  const [languagesStr, setLanguagesStr] = useState('English, Hindi');

  // Professional
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [methodology, setMethodology] = useState('');
  const [certificationsStr, setCertificationsStr] = useState('');

  // Media
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImagePublicId, setProfileImagePublicId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImagePublicId, setCoverImagePublicId] = useState('');

  // Stats
  const [courseCount, setCourseCount] = useState('0');
  const [enrollmentCount, setEnrollmentCount] = useState('17');
  const [reviewCount, setReviewCount] = useState('38');
  const [rating, setRating] = useState('5.0');

  // Quote
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Doubt CTA
  const [doubtTitle, setDoubtTitle] = useState('Have doubts?');
  const [doubtDesc, setDoubtDesc] = useState('');
  const [doubtBtnText, setDoubtBtnText] = useState('Ask a Question');
  const [doubtBtnUrl, setDoubtBtnUrl] = useState('/doubts');
  const [doubtVisible, setDoubtVisible] = useState(true);

  // Key Achievements
  const [achievements, setAchievements] = useState<
    Array<{ title: string; value?: string; label?: string; description?: string }>
  >([]);

  // Reviews
  const [reviews, setReviews] = useState<
    Array<{
      studentName: string;
      studentAvatar?: string;
      roleOrExam?: string;
      rating: number;
      comment: string;
      date?: string;
    }>
  >([]);

  // Custom Courses
  const [customCourses, setCustomCourses] = useState<
    Array<{
      title: string;
      subject?: string;
      modulesCount?: number;
      durationHours?: number;
      rating?: number;
      thumbnail?: string;
      url?: string;
    }>
  >([]);

  // Status & SEO
  const [status, setStatus] = useState<'draft' | 'pending' | 'approved' | 'published' | 'archived'>('published');
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('1');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Upload & Save states
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingCourseLogoIndex, setUploadingCourseLogoIndex] = useState<number | null>(null);
  const [uploadingReviewAvatarIndex, setUploadingReviewAvatarIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    if (teacher) {
      setName(teacher.name || '');
      setSlug(teacher.slug || '');
      setEmail((teacher as any).email || '');
      setPhone((teacher as any).phone || '');
      setDesignation(teacher.designation || teacher.headline || '');
      setSubject(teacher.subject || teacher.subjects?.[0] || 'Chemistry');
      setSubjectsStr(teacher.subjects?.join(', ') || teacher.subject || '');
      setSpecialization(teacher.specialization || '');
      setExperience(teacher.experience || '5+ Years');
      setEducation(teacher.education || (teacher.qualifications && teacher.qualifications[0]) || '');
      setLocation(teacher.location || 'Online / New Delhi');
      setLanguagesStr(teacher.languages?.join(', ') || 'English, Hindi');

      setTagline(teacher.tagline || '');
      setBio(teacher.bio || teacher.details || '');
      setMethodology(teacher.teachingMethodology || '');
      setCertificationsStr(teacher.certifications?.join(', ') || '');

      setProfileImageUrl(teacher.profileImage?.url || teacher.avatar?.url || '');
      setProfileImagePublicId(teacher.profileImage?.publicId || teacher.avatar?.publicId || '');
      setCoverImageUrl(teacher.coverImage?.url || '');
      setCoverImagePublicId(teacher.coverImage?.publicId || '');

      const stats = teacher.stats || {};
      setCourseCount(String(stats.courseCount ?? teacher.courseCount ?? 0));
      setEnrollmentCount(String(stats.enrollmentCount ?? teacher.enrollmentCount ?? 17));
      setReviewCount(String(stats.reviewCount ?? teacher.ratingCount ?? 38));
      setRating(String(stats.rating ?? teacher.ratingAvg ?? 5.0));

      setQuoteText(teacher.quote?.text || '');
      setQuoteAuthor(teacher.quote?.author || teacher.name || '');
      setQuoteVisible(teacher.quote?.visible !== false);

      setDoubtTitle(teacher.doubtCTA?.title || 'Have doubts?');
      setDoubtDesc(teacher.doubtCTA?.description || `Ask ${teacher.name} directly in doubt section`);
      setDoubtBtnText(teacher.doubtCTA?.buttonText || 'Ask a Question');
      setDoubtBtnUrl(teacher.doubtCTA?.buttonUrl || '/doubts');
      setDoubtVisible(teacher.doubtCTA?.visible !== false);

      setAchievements(teacher.achievements ? [...teacher.achievements] : []);
      setReviews(teacher.reviews ? [...teacher.reviews] : []);
      setCustomCourses(teacher.customCourses ? [...teacher.customCourses] : []);

      setStatus((teacher.status as any) || 'published');
      setFeatured(Boolean(teacher.featured));
      setDisplayOrder(String(teacher.displayOrder ?? 1));
      setSeoTitle(teacher.seo?.title || '');
      setSeoDescription(teacher.seo?.description || '');
    } else {
      // New Teacher Defaults
      setName('');
      setSlug('');
      setEmail('');
      setPhone('');
      setDesignation('Expert Faculty');
      setSubject('Chemistry');
      setSubjectsStr('Chemistry, Organic Chemistry');
      setSpecialization('Concept Specialist');
      setExperience('5+ Years');
      setEducation('Educator');
      setLocation('Online / New Delhi');
      setLanguagesStr('English, Hindi');

      setTagline('');
      setBio('');
      setMethodology('');
      setCertificationsStr('');

      setProfileImageUrl('');
      setProfileImagePublicId('');
      setCoverImageUrl('');
      setCoverImagePublicId('');

      setCourseCount('0');
      setEnrollmentCount('0');
      setReviewCount('0');
      setRating('5.0');

      setQuoteText('');
      setQuoteAuthor('');
      setQuoteVisible(true);

      setDoubtTitle('Have doubts?');
      setDoubtDesc('');
      setDoubtBtnText('Ask a Question');
      setDoubtBtnUrl('/doubts');
      setDoubtVisible(true);

      setAchievements([]);
      setReviews([]);
      setCustomCourses([]);

      setStatus('published');
      setFeatured(false);
      setDisplayOrder('99');
      setSeoTitle('');
      setSeoDescription('');
    }
    setActiveTab('basic');
  }, [open, teacher]);

  async function handleProfileUpload(file: File) {
    setUploadingProfile(true);
    try {
      const res = await uploadCloudinaryImage(file, 'cms');
      setProfileImageUrl(res.url);
      setProfileImagePublicId(res.publicId);
      toast.success('Profile image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingProfile(false);
    }
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const res = await uploadCloudinaryImage(file, 'cms');
      setCoverImageUrl(res.url);
      setCoverImagePublicId(res.publicId);
      toast.success('Cover image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Teacher name is required');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    try {
      const parsedSubjects = subjectsStr
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedLanguages = languagesStr
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedCertifications = certificationsStr
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        designation: designation.trim(),
        subject: subject.trim() || parsedSubjects[0] || 'General Studies',
        subjects: parsedSubjects.length > 0 ? parsedSubjects : [subject.trim()],
        specialization: specialization.trim(),
        experience: experience.trim(),
        education: education.trim(),
        location: location.trim(),
        languages: parsedLanguages,
        tagline: tagline.trim(),
        bio: bio.trim(),
        teachingMethodology: methodology.trim(),
        certifications: parsedCertifications,
        profileImage: profileImageUrl ? { url: profileImageUrl, publicId: profileImagePublicId } : undefined,
        coverImage: coverImageUrl ? { url: coverImageUrl, publicId: coverImagePublicId } : undefined,
        stats: {
          courseCount: Math.max(0, parseInt(courseCount, 10) || 0),
          enrollmentCount: Math.max(0, parseInt(enrollmentCount, 10) || 0),
          reviewCount: Math.max(0, parseInt(reviewCount, 10) || 0),
          rating: Math.max(1, Math.min(5, parseFloat(rating) || 5.0)),
        },
        quote: quoteText.trim()
          ? {
              text: quoteText.trim(),
              author: quoteAuthor.trim() || name.trim(),
              visible: quoteVisible,
            }
          : undefined,
        doubtCTA: {
          title: doubtTitle.trim() || 'Have doubts?',
          description: doubtDesc.trim() || `Ask ${name} directly in doubt section`,
          buttonText: doubtBtnText.trim() || 'Ask a Question',
          buttonUrl: doubtBtnUrl.trim() || '/doubts',
          visible: doubtVisible,
        },
        achievements,
        reviews,
        customCourses,
        status,
        featured,
        displayOrder: parseInt(displayOrder, 10) || 1,
        seo: {
          title: seoTitle.trim(),
          description: seoDescription.trim(),
        },
      };

      if (isEditing && teacher?._id) {
        await api(`/api/admin/teachers/${teacher._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Teacher updated successfully');
      } else {
        await api('/api/admin/teachers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Teacher created successfully');
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-teachers-list'] });
      await queryClient.invalidateQueries({ queryKey: ['teachers-list'] });
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  // Achievement Helpers
  function addAchievement() {
    setAchievements((prev) => [...prev, { title: 'New Achievement', value: '100+', label: 'Students' }]);
  }
  function updateAchievement(idx: number, patch: any) {
    setAchievements((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function removeAchievement(idx: number) {
    setAchievements((prev) => prev.filter((_, i) => i !== idx));
  }

  // Review Helpers
  function addReview() {
    setReviews((prev) => [
      ...prev,
      {
        studentName: 'Student Name',
        studentAvatar: '',
        roleOrExam: 'UPSC Aspirant',
        rating: 5,
        comment: 'Great teaching style and conceptual clarity.',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        approved: true,
        featured: true,
      },
    ]);
  }
  function updateReview(idx: number, patch: any) {
    setReviews((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function removeReview(idx: number) {
    setReviews((prev) => prev.filter((_, i) => i !== idx));
  }
  async function handleReviewAvatarUpload(idx: number, file: File) {
    setUploadingReviewAvatarIndex(idx);
    try {
      const res = await uploadCloudinaryImage(file, 'avatars');
      updateReview(idx, { studentAvatar: res.url });
      toast.success('Student photo uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingReviewAvatarIndex(null);
    }
  }

  // Custom Course Helpers
  function addCourse() {
    setCustomCourses((prev) => [
      ...prev,
      {
        title: '',
        subject: subject || 'Chemistry',
        modulesCount: 10,
        durationHours: 35,
        rating: 5,
        url: '/courses',
        thumbnail: '',
      },
    ]);
  }
  function updateCourse(idx: number, patch: any) {
    setCustomCourses((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function removeCourse(idx: number) {
    setCustomCourses((prev) => prev.filter((_, i) => i !== idx));
  }
  function moveCourse(idx: number, direction: 'up' | 'down') {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === customCourses.length - 1)) {
      return;
    }
    const target = direction === 'up' ? idx - 1 : idx + 1;
    const next = [...customCourses];
    const temp = next[idx];
    next[idx] = next[target];
    next[target] = temp;
    setCustomCourses(next);
  }
  async function handleCourseLogoUpload(idx: number, file: File) {
    setUploadingCourseLogoIndex(idx);
    try {
      const res = await uploadCloudinaryImage(file, 'courses');
      updateCourse(idx, { thumbnail: res.url });
      toast.success('Course logo image updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingCourseLogoIndex(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Teacher: ${teacher?.name}` : 'Add New Teacher'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh] w-full max-w-3xl">
        {/* Navigation Tabs */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-stone-200 pb-2 mb-4 shrink-0 text-xs font-semibold">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'professional', label: 'Professional' },
            { id: 'media', label: 'Images' },
            { id: 'stats', label: 'Statistics' },
            { id: 'quote', label: 'Quote / Highlight' },
            { id: 'doubt', label: 'Doubt Section' },
            { id: 'achievements', label: `Achievements (${achievements.length})` },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'courses', label: `Courses (${customCourses.length})` },
            { id: 'seo', label: 'Status & SEO' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as FormTab)}
              className={`rounded-lg px-3 py-1.5 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riju" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    URL Slug (e.g. /teachers/riju)
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@gyanchowk.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Chemistry"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Designation</label>
                  <Input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Chemistry Expert"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  All Subjects (comma separated pills)
                </label>
                <Input
                  value={subjectsStr}
                  onChange={(e) => setSubjectsStr(e.target.value)}
                  placeholder="Chemistry, Organic Chemistry, Inorganic Chemistry, Physical Chemistry"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Experience</label>
                  <Input
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 8+ Years"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Education</label>
                  <Input
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. M.Sc. Chemistry"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Online / New Delhi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Languages (comma separated)
                </label>
                <Input
                  value={languagesStr}
                  onChange={(e) => setLanguagesStr(e.target.value)}
                  placeholder="English, Hindi"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL */}
          {activeTab === 'professional' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Short Tagline</label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Make Chemistry simple, logical and interesting. Learn with concepts, not just notes."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Biography / About</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Riju is a passionate Chemistry educator with over 8 years of teaching experience..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teaching Methodology</label>
                <Textarea
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  rows={3}
                  placeholder="Interactive concept breakdown with live problem-solving and visualization techniques..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Certifications (comma separated)
                </label>
                <Input
                  value={certificationsStr}
                  onChange={(e) => setCertificationsStr(e.target.value)}
                  placeholder="CSIR NET Qualified, GATE Chemistry"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA / IMAGES */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50/50">
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Profile Photo (Teacher Portrait)
                </label>
                <p className="text-[11px] text-stone-500 mb-3">
                  Recommended size: 600x700px vertical portrait. Supports JPG, PNG, WebP.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {profileImageUrl ? (
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={profileImageUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImageUrl('');
                          setProfileImagePublicId('');
                        }}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-4 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50">
                    <ImagePlus className="h-4 w-4 text-stone-500" />
                    <span>{uploadingProfile ? 'Uploading...' : 'Upload Portrait Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingProfile}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleProfileUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cover Image */}
              <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50/50">
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Cover / Banner Image (Optional)
                </label>
                <p className="text-[11px] text-stone-500 mb-3">
                  Wide aspect banner for teacher header background if enabled.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {coverImageUrl ? (
                    <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImageUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageUrl('');
                          setCoverImagePublicId('');
                        }}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-4 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50">
                    <ImagePlus className="h-4 w-4 text-stone-500" />
                    <span>{uploadingCover ? 'Uploading...' : 'Upload Cover Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleCoverUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATISTICS */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Courses Count</label>
                <Input
                  type="number"
                  value={courseCount}
                  onChange={(e) => setCourseCount(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Verified Enrollments Count
                </label>
                <Input
                  type="number"
                  value={enrollmentCount}
                  onChange={(e) => setEnrollmentCount(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Course Reviews Count</label>
                <Input
                  type="number"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Average Rating (1.0 - 5.0)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 5: QUOTE / HIGHLIGHT */}
          {activeTab === 'quote' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quote-vis"
                  checked={quoteVisible}
                  onChange={(e) => setQuoteVisible(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="quote-vis" className="text-xs font-semibold text-stone-800">
                  Show Quote Card on Teacher Profile
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Quote Text</label>
                <Textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  rows={3}
                  placeholder="Good teaching is not just about information, it's about transformation."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Author Attribution</label>
                <Input
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="e.g. Riju"
                />
              </div>
            </div>
          )}

          {/* TAB 6: DOUBT CTA */}
          {activeTab === 'doubt' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="doubt-vis"
                  checked={doubtVisible}
                  onChange={(e) => setDoubtVisible(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="doubt-vis" className="text-xs font-semibold text-stone-800">
                  Show Q&A / Doubt CTA Box
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Box Title</label>
                  <Input
                    value={doubtTitle}
                    onChange={(e) => setDoubtTitle(e.target.value)}
                    placeholder="Have doubts?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Button Text</label>
                  <Input
                    value={doubtBtnText}
                    onChange={(e) => setDoubtBtnText(e.target.value)}
                    placeholder="Ask a Question"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                  <Input
                    value={doubtDesc}
                    onChange={(e) => setDoubtDesc(e.target.value)}
                    placeholder="Ask Riju directly in doubt section"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Button URL</label>
                  <Input
                    value={doubtBtnUrl}
                    onChange={(e) => setDoubtBtnUrl(e.target.value)}
                    placeholder="/doubts"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KEY ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-600">
                  Add custom achievement milestones for this teacher.
                </p>
                <Button type="button" onClick={addAchievement}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Achievement
                </Button>
              </div>

              <div className="space-y-3">
                {achievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/50 p-3"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <Input
                        value={item.title}
                        onChange={(e) => updateAchievement(idx, { title: e.target.value })}
                        placeholder="Title (e.g. Verified Students)"
                      />
                      <Input
                        value={item.value || ''}
                        onChange={(e) => updateAchievement(idx, { value: e.target.value })}
                        placeholder="Value (e.g. 500+)"
                      />
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateAchievement(idx, { description: e.target.value })}
                        placeholder="Short description"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAchievement(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-stone-900">
                      Manage Student Reviews ({reviews.length})
                    </p>
                    {reviews.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        {(
                          reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (reviews.length || 1)
                        ).toFixed(1)}{' '}
                        Avg Rating
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Real-life testimonials and ratings displayed on the teacher&apos;s profile.
                  </p>
                </div>
                <Button type="button" onClick={addReview}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Review
                </Button>
              </div>

              <div className="space-y-3.5">
                {reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3 transition hover:border-amber-300 hover:bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-900">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-800">
                          {rev.studentName || 'Untitled Review'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                          {(rev.rating || 5).toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(rev as any).approved !== false}
                            onChange={(e) => updateReview(idx, { approved: e.target.checked })}
                            className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeReview(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Student Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={rev.studentName}
                          onChange={(e) => updateReview(idx, { studentName: e.target.value })}
                          placeholder="e.g. Amit Kumar"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Target Exam / Goal
                        </label>
                        <Input
                          value={rev.roleOrExam || ''}
                          onChange={(e) => updateReview(idx, { roleOrExam: e.target.value })}
                          placeholder="e.g. UPSC Aspirant"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Star Rating (1 - 5)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={String(rev.rating)}
                          onChange={(e) => updateReview(idx, { rating: parseFloat(e.target.value) || 5 })}
                          placeholder="Rating"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Date Displayed
                        </label>
                        <Input
                          value={rev.date || ''}
                          onChange={(e) => updateReview(idx, { date: e.target.value })}
                          placeholder="e.g. 15 Aug 2025"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Student Avatar Photo
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition">
                            <Upload className="h-3 w-3 text-stone-500" />
                            <span>
                              {uploadingReviewAvatarIndex === idx ? 'Uploading...' : 'Upload Photo'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingReviewAvatarIndex === idx}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleReviewAvatarUpload(idx, file);
                              }}
                            />
                          </label>
                          {rev.studentAvatar ? (
                            <span className="text-xs text-emerald-600 font-medium">✓ Photo attached</span>
                          ) : (
                            <span className="text-[11px] text-stone-400">Optional</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Review Testimonial Text
                      </label>
                      <Textarea
                        value={rev.comment}
                        onChange={(e) => updateReview(idx, { comment: e.target.value })}
                        placeholder="Write student feedback or experience..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    Featured Courses on Profile
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Manage course details, update logo / thumbnail image, reorder, or delete.
                  </p>
                </div>
                <Button type="button" onClick={addCourse}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Course
                </Button>
              </div>

              {customCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center bg-stone-50">
                  <BookOpen className="mx-auto h-7 w-7 text-stone-400 mb-1.5" />
                  <p className="text-xs font-semibold text-stone-700">No featured courses added</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Click &quot;Add Course&quot; to showcase courses on this teacher&apos;s page.
                  </p>
                  <div className="mt-3">
                    <Button type="button" onClick={addCourse}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Course
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {customCourses.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3 transition hover:border-amber-300 hover:bg-white"
                    >
                      {/* Course Card Header */}
                      <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-900">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-stone-800">
                            {c.title || 'Untitled Course'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveCourse(idx, 'up')}
                            disabled={idx === 0}
                            title="Move up"
                            className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCourse(idx, 'down')}
                            disabled={idx === customCourses.length - 1}
                            title="Move down"
                            className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCourse(idx)}
                            title="Delete course"
                            className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700 ml-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Course Details Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Course Title <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={c.title}
                            onChange={(e) => updateCourse(idx, { title: e.target.value })}
                            placeholder="e.g. Organic Chemistry Complete Course"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Subject
                          </label>
                          <Input
                            value={c.subject || ''}
                            onChange={(e) => updateCourse(idx, { subject: e.target.value })}
                            placeholder="e.g. Chemistry"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Modules Count
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={String(c.modulesCount ?? 10)}
                              onChange={(e) =>
                                updateCourse(idx, {
                                  modulesCount: parseInt(e.target.value, 10) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Duration (Hours)
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={String(c.durationHours ?? 40)}
                              onChange={(e) =>
                                updateCourse(idx, {
                                  durationHours: parseInt(e.target.value, 10) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Course Link / URL
                          </label>
                          <Input
                            value={c.url || ''}
                            onChange={(e) => updateCourse(idx, { url: e.target.value })}
                            placeholder="e.g. /courses/organic-chemistry"
                          />
                        </div>
                      </div>

                      {/* Course Logo / Thumbnail Management */}
                      <div className="rounded-xl border border-stone-200/80 bg-white p-3">
                        <label className="block text-[11px] font-bold text-stone-700 mb-2">
                          Course Logo / Thumbnail Image
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                          {c.thumbnail ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                              <Image
                                src={c.thumbnail}
                                alt="Logo preview"
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                              <button
                                type="button"
                                onClick={() => updateCourse(idx, { thumbnail: '' })}
                                title="Remove logo"
                                className="absolute right-0.5 top-0.5 rounded-full bg-red-600 p-0.5 text-white shadow hover:bg-red-700"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50">
                              <ImagePlus className="h-3.5 w-3.5 text-stone-500" />
                              <span>
                                {uploadingCourseLogoIndex === idx
                                  ? 'Uploading...'
                                  : c.thumbnail
                                  ? 'Replace Logo Image'
                                  : 'Upload Logo Image'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingCourseLogoIndex === idx}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void handleCourseLogoUpload(idx, file);
                                }}
                              />
                            </label>
                            <p className="text-[10px] text-stone-400">
                              Square logo image or icon recommended
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: STATUS & SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status</label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-stone-800">Featured Teacher</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">SEO Title</label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Riju — Chemistry Expert | Gyan Chowk"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">SEO Description</label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  placeholder="Learn Chemistry with Riju on Gyan Chowk. Master concepts through simple explanations."
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-stone-200 pt-4 shrink-0">
          <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Saving...' : isEditing ? 'Update Teacher' : 'Create Teacher'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
