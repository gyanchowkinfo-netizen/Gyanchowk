'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HelpCircle, Move } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const STORAGE_KEY = 'gyan_doubt_floater_pos';
const BUTTON_SIZE = 64;
const PADDING = 12;

export function DoubtToggleWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    hasMoved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });

  // Load saved position or set default position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const clampedX = Math.max(PADDING, Math.min(window.innerWidth - BUTTON_SIZE - PADDING, parsed.x));
          const clampedY = Math.max(PADDING, Math.min(window.innerHeight - BUTTON_SIZE - PADDING, parsed.y));
          setPosition({ x: clampedX, y: clampedY });
          return;
        }
      }
    } catch {
      // Ignore local storage errors
    }

    // Default position: floating on the right edge, vertically centered
    const defaultX = Math.max(PADDING, window.innerWidth - BUTTON_SIZE - 20);
    const defaultY = Math.max(PADDING, Math.floor(window.innerHeight / 2 - BUTTON_SIZE / 2));
    setPosition({ x: defaultX, y: defaultY });
  }, []);

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const maxX = Math.max(PADDING, window.innerWidth - BUTTON_SIZE - PADDING);
        const maxY = Math.max(PADDING, window.innerHeight - BUTTON_SIZE - PADDING);
        return {
          x: Math.max(PADDING, Math.min(maxX, prev.x)),
          y: Math.max(PADDING, Math.min(maxY, prev.y)),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide if already on doubts page to prevent clutter
  if (pathname.includes('/doubts')) {
    return null;
  }

  // Determine dashboard destination based on user role
  const doubtHref = user
    ? user.role === 'teacher'
      ? '/teacher/doubts'
      : user.role === 'admin'
      ? '/admin/doubts'
      : '/student/doubts'
    : '/student/doubts';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary button (left click or touch)
    if (e.button !== 0) return;

    const currentX = position?.x ?? (window.innerWidth - BUTTON_SIZE - 20);
    const currentY = position?.y ?? Math.floor(window.innerHeight / 2 - BUTTON_SIZE / 2);

    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: currentX,
      startPosY: currentY,
      hasMoved: false,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // Small movement threshold (5px) to separate intentional drag from click
    if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
      dragRef.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragRef.current.hasMoved) {
      const rawX = dragRef.current.startPosX + dx;
      const rawY = dragRef.current.startPosY + dy;

      const maxX = Math.max(PADDING, window.innerWidth - BUTTON_SIZE - PADDING);
      const maxY = Math.max(PADDING, window.innerHeight - BUTTON_SIZE - PADDING);

      const clampedX = Math.max(PADDING, Math.min(maxX, rawX));
      const clampedY = Math.max(PADDING, Math.min(maxY, rawY));

      setPosition({ x: clampedX, y: clampedY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const wasMoved = dragRef.current.hasMoved;
    dragRef.current.active = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture release fails
    }

    if (wasMoved && position) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch {
        // Ignore local storage errors
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If the floater was dragged, prevent navigation
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <aside
      className="fixed z-40 select-none print:hidden touch-none"
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : { right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }
      }
      aria-label="Quick Doubt Access"
      suppressHydrationWarning
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'} transition-transform duration-100 ease-out`}
      >
        <Link
          href={doubtHref}
          onClick={handleClick}
          draggable={false}
          className="group relative flex flex-col items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-stone-900 text-amber-200 border-2 border-amber-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.32)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.4)] hover:bg-black active:scale-95 transition-all duration-200"
          aria-label="Ask a Doubt (Drag to reposition)"
          title="Click to open Doubt portal, or drag to move anywhere"
        >
          {/* Pulsing Active Status Dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5" aria-hidden>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-stone-900" />
          </span>

          {/* Center Icon */}
          <HelpCircle
            size={22}
            className="text-amber-300 transition-transform duration-200 group-hover:rotate-12"
            aria-hidden
          />

          {/* Label */}
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200 group-hover:text-amber-100 transition-colors">
            Doubt
          </span>

          {/* Drag Indicator Overlay on Hover */}
          <span className="sr-only">Draggable floating doubt button</span>
        </Link>
      </div>
    </aside>
  );
}
