'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { SearchSuggestionsDropdown } from '@/components/search/SearchSuggestionsDropdown';

interface NavbarSearchProps {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  variant?: 'desktop' | 'mobile';
}

export function NavbarSearch({
  className = '',
  autoFocus = false,
  onNavigate,
  variant = 'desktop',
}: NavbarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (clean) {
      setFocused(false);
      inputRef.current?.blur();
      router.push(`/courses?q=${encodeURIComponent(clean)}`);
      if (onNavigate) onNavigate();
    }
  };

  const handleSelect = (href: string) => {
    setFocused(false);
    inputRef.current?.blur();
    router.push(href);
    if (onNavigate) onNavigate();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`group flex items-center gap-2 rounded-full border border-gc-line bg-white/95 px-3.5 shadow-xs backdrop-blur-sm transition-all duration-200 focus-within:border-gc-black/60 focus-within:bg-white focus-within:shadow-md ${
          variant === 'mobile' ? 'h-11 w-full text-base' : 'h-10 w-full text-sm'
        }`}
      >
        <Search
          size={variant === 'mobile' ? 18 : 16}
          className="shrink-0 text-gc-mute transition-colors duration-200 group-focus-within:text-blue-600"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search courses, exams, teachers..."
          aria-label="Search courses, exams and teachers"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 border-none bg-transparent text-slate-900 placeholder:text-gc-mist focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            title="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </form>

      {/* Instant Suggestions Dropdown directly beneath search bar */}
      <SearchSuggestionsDropdown
        query={query}
        open={focused && query.trim().length >= 1}
        onSelect={handleSelect}
        onClose={() => setFocused(false)}
      />
    </div>
  );
}
