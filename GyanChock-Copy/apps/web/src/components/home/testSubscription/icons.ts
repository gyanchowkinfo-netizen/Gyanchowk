import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  Files,
  GraduationCap,
  Landmark,
  Layers,
  Library,
  LineChart,
  PenLine,
  Target,
  Timer,
  TrainFront,
  TrendingUp,
} from 'lucide-react';
import type { TestSubscriptionIcon } from '@/lib/types';

export const TEST_SUBSCRIPTION_ICON_MAP: Record<TestSubscriptionIcon, LucideIcon> = {
  ClipboardCheck,
  BookOpen,
  Layers,
  LibraryBig: Library,
  Files,
  TrendingUp,
  Target,
  Timer,
  PenLine,
  ChartNoAxesCombined: LineChart,
  GraduationCap,
  BarChart3,
  Landmark,
  Building2,
  TrainFront,
  Award,
};

export const TEST_SUBSCRIPTION_ICON_OPTIONS: Array<{ value: TestSubscriptionIcon; label: string }> = [
  { value: 'ClipboardCheck', label: 'Mock tests' },
  { value: 'BookOpen', label: 'Open book' },
  { value: 'Layers', label: 'Exam layers' },
  { value: 'LibraryBig', label: 'Library' },
  { value: 'Files', label: 'Paper files' },
  { value: 'TrendingUp', label: 'Improvement' },
  { value: 'Target', label: 'Accuracy' },
  { value: 'Timer', label: 'Timed practice' },
  { value: 'PenLine', label: 'Questions' },
  { value: 'ChartNoAxesCombined', label: 'Analytics' },
  { value: 'BarChart3', label: 'Progress chart' },
  { value: 'GraduationCap', label: 'UPSC / exams' },
  { value: 'Landmark', label: 'Banking' },
  { value: 'Building2', label: 'Institutions' },
  { value: 'TrainFront', label: 'Railways' },
  { value: 'Award', label: 'Achievement' },
];

export function testSubscriptionIcon(name?: string): LucideIcon {
  if (name && name in TEST_SUBSCRIPTION_ICON_MAP) {
    return TEST_SUBSCRIPTION_ICON_MAP[name as TestSubscriptionIcon];
  }
  return ClipboardCheck;
}
