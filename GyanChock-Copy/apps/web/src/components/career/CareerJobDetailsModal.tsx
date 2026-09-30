'use client';

import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  CheckCircle2,
  Share2,
  ExternalLink,
  Building,
} from 'lucide-react';
import type { CareerJob } from '@/lib/types';
import { toast } from '@/lib/toast';

interface CareerJobDetailsModalProps {
  job: CareerJob | null;
  onClose: () => void;
}

export function CareerJobDetailsModal({ job, onClose }: CareerJobDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (job) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [job, onClose]);

  if (!job) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const applyUrl =
    job.applyLink && job.applyLink.trim().length > 0
      ? job.applyLink
      : `mailto:careers@gyanchowk.com?subject=Application for ${encodeURIComponent(job.title)}&body=Dear Hiring Team at Gyan Chowk,%0D%0A%0D%0AI would like to express my interest in the ${encodeURIComponent(job.title)} position (${encodeURIComponent(job.department)} - ${encodeURIComponent(job.location)}).%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0ABest regards,%0D%0A[Your Name]`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase">
              {job.department}
            </span>
            <h2 id="job-title" className="font-display font-medium text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {job.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Meta Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <MapPin className="w-4 h-4 text-blue-600" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <Building className="w-4 h-4 text-blue-600" />
            {job.workMode || 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <Clock className="w-4 h-4 text-blue-600" />
            {job.employmentType || 'Full-time'}
          </span>
          {job.experience && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <Briefcase className="w-4 h-4 text-blue-600" />
              {job.experience}
            </span>
          )}
          {job.salaryRange && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              {job.salaryRange}
            </span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About the Role</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Responsibilities</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Requirements</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Qualifications */}
        {job.qualifications && job.qualifications.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Qualifications</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {job.qualifications.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-800 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Position</span>
          </button>

          <a
            href={applyUrl}
            target={job.applyLink ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
