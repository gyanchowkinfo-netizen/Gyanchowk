'use client';

import { FormEvent, useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Award,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput, Select, Textarea } from '@/components/ui/Input';
import { AuthError } from '@/components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength';

const INDIAN_STATES = [
  'Delhi NCR',
  'Uttar Pradesh',
  'Bihar',
  'Rajasthan',
  'Maharashtra',
  'Madhya Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Odisha',
  'Jharkhand',
  'Assam',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Goa',
  'Other / Outside India',
];

const TEACHER_SUBJECTS = [
  'Physics (JEE / NEET)',
  'Chemistry (Organic & Inorganic)',
  'Mathematics & Calculus',
  'Biology & Life Sciences',
  'Computer Science & Programming',
  'History & General Studies',
  'English & Reasoning',
  'Commerce & Economics',
  'Other Specialization',
];

function RegisterContent() {
  const router = useRouter();
  const search = useSearchParams();
  const setUser = useAuth((s) => s.setUser);

  const initialRole = search.get('role') === 'teacher' ? 'teacher' : 'student';
  const initialMode = search.get('mode') === 'signin' ? 'signin' : 'register';
  const initialRef = search.get('ref') ?? '';

  const [mode, setMode] = useState<'register' | 'signin'>(initialMode);
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Delhi NCR');
  const [referralCode, setReferralCode] = useState(initialRef);

  // Teacher specific
  const [subject, setSubject] = useState(TEACHER_SUBJECTS[0]);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Sync role if url query changes
  useEffect(() => {
    if (search.get('role') === 'teacher') setRole('teacher');
  }, [search]);

  // 1. Submit Registration
  async function onRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!agreedToTerms) {
      setError('Please check the box to agree to Gyan Chowk\'s Terms of Service and Code of Academic Conduct.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || undefined,
        state: state.trim() || undefined,
        referralCode: role === 'student' ? (referralCode.trim() || undefined) : undefined,
        headline: role === 'teacher' ? (headline.trim() || `${subject} Faculty`) : undefined,
        bio: role === 'teacher' ? bio.trim() : undefined,
      };

      const data = await api<{ message: string; verifyToken?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Auto-verify in development/mock if token returned
      if (data.verifyToken) {
        try {
          await api('/api/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token: data.verifyToken }),
          });
        } catch {
          // ignore background token verification error
        }
      }

      // Automatically transition to the Sign-in section
      setMode('signin');
      setSuccessMessage(
        role === 'teacher'
          ? '🎉 Teacher account created successfully! Signing you in to your faculty portal...'
          : '🎉 Account created successfully! Signing you in to your student dashboard...',
      );

      // Attempt instant automatic sign in
      setAutoLoggingIn(true);
      try {
        const loginData = await api<{
          user: { role: 'student' | 'teacher' | 'admin'; name: string; email: string; id: string; status: string };
        }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        setUser(loginData.user);
        const destination = loginData.user.role === 'teacher' ? '/teacher' : '/student';
        setTimeout(() => {
          router.push(destination);
        }, 1200);
      } catch (loginErr) {
        // If automatic login doesn't complete, user stays on the prefilled sign in section
        setAutoLoggingIn(false);
        setSuccessMessage('🎉 Account created! Please click "Sign In" below with your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  // 2. Submit Manual Sign-In
  async function onSignInSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api<{
        user: { role: 'student' | 'teacher' | 'admin'; name: string; email: string; id: string; status: string };
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      setUser(data.user);
      const destination =
        data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/teacher' : '/student';
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 antialiased selection:bg-amber-100 selection:text-amber-900">
      <main className="w-full max-w-xl mx-auto space-y-6">
        {/* Form Title & Subtitle */}
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
            {mode === 'signin' ? 'Welcome To Gyan Chowk' : 'Create Your Account'}
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            {mode === 'signin'
              ? 'Sign in to access your courses, mock test analysis, and workspace.'
              : 'Select your role below for an individual, dedicated registration experience.'}
          </p>
        </div>

        {/* Alert Messages */}
        {error ? <AuthError>{error}</AuthError> : null}
        {successMessage ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/90 p-4 text-sm text-emerald-900 shadow-sm flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{successMessage}</p>
              {autoLoggingIn ? (
                <p className="mt-1 text-xs text-emerald-700 animate-pulse">
                  Connecting to your session... Redirecting now.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* =====================================================================
            SIGN IN SECTION (Automatic after registration or manual switch)
           ===================================================================== */}
        {mode === 'signin' ? (
          <form onSubmit={onSignInSubmit} className="space-y-4 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="space-y-1.5">
              <Input
                label="Email address"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <PasswordInput
                label="Password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-stone-500">Secure AES-256 session</span>
              <Link
                href="/forgot-password"
                className="font-medium text-stone-700 hover:text-stone-900 underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading || autoLoggingIn}
              className="w-full !rounded-xl !py-3 !text-sm !font-semibold shadow-md mt-2"
            >
              {autoLoggingIn ? 'Signing you in...' : 'Sign In to Portal'}
            </Button>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setMode('register');
                }}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium"
              >
                Need a student or teacher account? <span className="font-semibold text-amber-800 underline">Register here</span>
              </button>
            </div>
          </form>
        ) : (
          /* =====================================================================
              REGISTRATION SECTION: Individual Student & Teacher Experiences
             ===================================================================== */
          <div className="space-y-6">
            {/* Individual Segmented Selector: Student vs Teacher */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* 1. Student Card Tab */}
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setError('');
                }}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${role === 'student'
                  ? 'border-stone-900 bg-white shadow-md ring-2 ring-stone-900/10'
                  : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100/80 hover:border-stone-300'
                  }`}
                suppressHydrationWarning
              >
                <div className="flex w-full items-center justify-between mb-2">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${role === 'student' ? 'bg-stone-900 text-amber-200' : 'bg-stone-200 text-stone-600'
                      }`}
                  >
                    <GraduationCap size={18} />
                  </div>
                  {role === 'student' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 size={11} /> Selected
                    </span>
                  ) : null}
                </div>
                <h2 className="font-semibold text-sm text-stone-900">Student Account</h2>
                <p className="mt-0.5 text-xs text-stone-500 leading-snug">
                  Learn recorded modules, practice & compete in state ranks.
                </p>
              </button>

              {/* 2. Teacher Card Tab */}
              <button
                type="button"
                onClick={() => {
                  setRole('teacher');
                  setError('');
                }}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${role === 'teacher'
                  ? 'border-stone-900 bg-white shadow-md ring-2 ring-stone-900/10'
                  : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100/80 hover:border-stone-300'
                  }`}
                suppressHydrationWarning
              >
                <div className="flex w-full items-center justify-between mb-2">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${role === 'teacher' ? 'bg-stone-900 text-amber-200' : 'bg-stone-200 text-stone-600'
                      }`}
                  >
                    <Award size={18} />
                  </div>
                  {role === 'teacher' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 size={11} /> Selected
                    </span>
                  ) : null}
                </div>
                <h2 className="font-semibold text-sm text-stone-900">Teacher / Faculty</h2>
                <p className="mt-0.5 text-xs text-stone-500 leading-snug">
                  Publish video courses, mentor students & host practice sets.
                </p>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={onRegisterSubmit} className="space-y-4 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
              {/* Common Field: Full Name */}
              <div className="space-y-1.5">
                <Input
                  name="name"
                  required
                  label={role === 'teacher' ? 'Full name & title *' : 'Full name *'}
                  placeholder={role === 'teacher' ? 'e.g. Dr. Alok Nath' : 'e.g. Ananya Sharma'}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Common Field: Email Address */}
              <div className="space-y-1.5">
                <Input
                  name="email"
                  type="email"
                  required
                  label={role === 'teacher' ? 'Official / Teaching email *' : 'Email address *'}
                  placeholder={role === 'teacher' ? 'faculty@institution.edu or personal' : 'student@example.com'}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <PasswordInput
                    name="password"
                    required
                    minLength={8}
                    label="Password *"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <PasswordInput
                    name="confirmPassword"
                    required
                    minLength={8}
                    label="Confirm password *"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword && confirmPassword !== password ? 'Passwords do not match' : undefined}
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={password} />

              {/* ===============================================================
                  STUDENT-SPECIFIC DETAILS
                 =============================================================== */}
              {role === 'student' ? (
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  {/* State (For State-wise Rank) & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Select
                        name="state"
                        label="State (for state leaderboard)"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Input
                        name="phone"
                        label="Mobile number (optional)"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-1.5">
                    <Input
                      name="referralCode"
                      label="Referral code (optional)"
                      placeholder="e.g. GYAN2024"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <p className="text-[11px] text-stone-500">
                      Have a coupon or friend invitation? Enter it here for bonus wallet credit.
                    </p>
                  </div>
                </div>
              ) : (
                /* ===============================================================
                    TEACHER / FACULTY-SPECIFIC DETAILS
                   =============================================================== */
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  {/* Academic Subject / Specialization */}
                  <div className="space-y-1.5">
                    <Select
                      name="subject"
                      label="Primary Subject / Department *"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      {TEACHER_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Professional Headline */}
                  <div className="space-y-1.5">
                    <Input
                      name="headline"
                      required
                      label="Professional headline / Title *"
                      placeholder="e.g. Senior Faculty · Ex-Allen/Aakash (10+ yrs)"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>

                  {/* Short Bio & Teaching Qualifications */}
                  <div className="space-y-1.5">
                    <Textarea
                      name="bio"
                      required
                      label="Teaching bio & credentials *"
                      placeholder="Mention your university degrees, coaching institute history, and exams you specialize in..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  {/* Phone (Required for Teacher verification) & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Input
                        name="phone"
                        required
                        label="Contact phone (for verification) *"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Select
                        name="state"
                        label="State / Region *"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Verification Notice Card */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                      <ShieldCheck size={15} className="text-amber-700" /> Faculty Verification Note
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      After registration, you will have immediate access to your teacher dashboard to organize courses. Full catalog publishing will activate once credentials are approved by our academic admin team.
                    </p>
                  </div>
                </div>
              )}

              {/* Terms Agreement Checkbox with Terms Link */}
              <div className="pt-1">
                <label
                  htmlFor="terms-agree"
                  className="flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed cursor-pointer select-none"
                >
                  <input
                    id="terms-agree"
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-stone-900 focus:ring-amber-500 accent-stone-900 cursor-pointer"
                    suppressHydrationWarning
                  />
                  <span>
                    By clicking Register, you agree to Gyan Chowk&apos;s Terms of Service and Code of Academic Conduct.{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      className="font-bold text-amber-800 underline underline-offset-2 hover:text-amber-950"
                      suppressHydrationWarning
                    >
                      Terms
                    </button>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full !rounded-xl !py-3 !text-sm !font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  {role === 'student' ? 'Create Student Account' : 'Submit Faculty Registration'}
                  <ArrowRight size={16} />
                </Button>
              </div>

              {/* Already have an account? Sign in below Create Student Account */}
              <p className="text-center text-sm text-stone-600 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMessage('');
                    setMode('signin');
                  }}
                  className="font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-4"
                  suppressHydrationWarning
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        )}
      </main>

      {/* Terms of Service & Academic Conduct Modal */}
      {showTermsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-900">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-stone-900">Gyan Chowk Terms of Service</h3>
                  <p className="text-[11px] text-stone-500">Platform Agreement & Academic Conduct</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close terms"
                suppressHydrationWarning
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/60">
                <p className="font-semibold text-stone-900 mb-1">1. Educational Content & Non-Redistribution</p>
                <p>
                  Gyan Chowk provides high-quality recorded masterclasses, mock test series, doubt clearing, and mentor guidance. Course enrollment is personal and non-transferable. Video playback URLs and practice materials must not be distributed, recorded, or commercially re-sold.
                </p>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/60">
                <p className="font-semibold text-stone-900 mb-1">2. Code of Academic Conduct</p>
                <p>
                  Students agree to uphold honesty during chapter tests and All-India mock exams. Any automated cheating, question scraping, or disruptive behavior in doubt forums will lead to immediate account suspension and cancellation of certificates.
                </p>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/60">
                <p className="font-semibold text-stone-900 mb-1">3. Faculty Standards & Verification</p>
                <p>
                  Teacher profiles and course curricula require verification and approval from Gyan Chowk academic administrators. Faculty members ensure factual accuracy, curriculum standards, and timely feedback on doubts.
                </p>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/60">
                <p className="font-semibold text-stone-900 mb-1">4. Privacy & Payment Safety</p>
                <p>
                  Your learning analytics, test rankings, and payment records are securely stored to personalize your preparation. We do not sell user data. Verified refund and wallet credit policies apply to eligible course purchases.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
              <Link
                href="/terms-and-conditions"
                target="_blank"
                className="text-xs font-medium text-amber-800 underline underline-offset-2 hover:text-amber-950"
              >
                Open Full Legal Document ↗
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-black transition-colors"
                suppressHydrationWarning
              >
                I Agree & Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
