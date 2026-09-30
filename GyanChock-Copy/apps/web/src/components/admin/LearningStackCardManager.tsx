'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Layers,
  LayoutGrid,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Table as TableIcon,
  Trash2,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ConfirmDialog, Modal } from '@/components/ui/Overlay';
import { EmptyState } from '@/components/ui/States';

export type LearningStackAccent =
  | 'amber'
  | 'violet'
  | 'green'
  | 'coral'
  | 'orange'
  | 'blue'
  | 'indigo'
  | 'teal'
  | 'pink';

export type LearningStackCard = {
  _id: string;
  title: string;
  description: string;
  accentColor: LearningStackAccent;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const ACCENT_COLOR_OPTIONS: Array<{
  value: LearningStackAccent;
  label: string;
  hex: string;
  badgeBg: string;
  badgeText: string;
}> = [
  { value: 'amber', label: 'Warm Amber', hex: '#F59E0B', badgeBg: '#FEF3C7', badgeText: '#92400E' },
  { value: 'violet', label: 'Violet', hex: '#7C3AED', badgeBg: '#EDE9FE', badgeText: '#5B21B6' },
  { value: 'green', label: 'Forest Green', hex: '#059669', badgeBg: '#D1FAE5', badgeText: '#065F46' },
  { value: 'coral', label: 'Coral Red', hex: '#EF4444', badgeBg: '#FEE2E2', badgeText: '#991B1B' },
  { value: 'orange', label: 'Vibrant Orange', hex: '#F97316', badgeBg: '#FFEDD5', badgeText: '#9A3412' },
  { value: 'blue', label: 'Sky Blue', hex: '#0284C7', badgeBg: '#E0F2FE', badgeText: '#075985' },
  { value: 'indigo', label: 'Royal Indigo', hex: '#4F46E5', badgeBg: '#EEF2FF', badgeText: '#3730A3' },
  { value: 'teal', label: 'Deep Teal', hex: '#0D9488', badgeBg: '#CCFBF1', badgeText: '#115E59' },
  { value: 'pink', label: 'Rose Pink', hex: '#DB2777', badgeBg: '#FCE7F3', badgeText: '#9D174D' },
];

export function LearningStackCardManager() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['learning-stack-cards-admin'],
    queryFn: () => api<{ cards: LearningStackCard[] }>('/api/learning-stack/admin/cards'),
  });

  const cards = data?.cards ?? [];

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<LearningStackCard | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAccent, setFormAccent] = useState<LearningStackAccent>('amber');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<LearningStackCard | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reset Dialog State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const openAddModal = () => {
    setEditingCard(null);
    setFormTitle('');
    setFormDesc('');
    setFormAccent('amber');
    setFormOrder(cards.length > 0 ? Math.max(...cards.map((c) => c.displayOrder)) + 1 : 1);
    setFormActive(true);
    setModalOpen(true);
  };

  const openEditModal = (card: LearningStackCard) => {
    setEditingCard(card);
    setFormTitle(card.title);
    setFormDesc(card.description);
    setFormAccent(card.accentColor);
    setFormOrder(card.displayOrder);
    setFormActive(card.isActive);
    setModalOpen(true);
  };

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['learning-stack-cards-admin'] }),
      queryClient.invalidateQueries({ queryKey: ['learning-stack-cards-public'] }),
      queryClient.invalidateQueries({ queryKey: ['about-page-cms'] }),
      queryClient.invalidateQueries({ queryKey: ['about-page-cms-admin'] }),
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Card title is required');
      return;
    }
    if (!formDesc.trim()) {
      toast.error('Card description is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCard) {
        await api(`/api/learning-stack/admin/cards/${editingCard._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formTitle.trim(),
            description: formDesc.trim(),
            accentColor: formAccent,
            displayOrder: Number(formOrder),
            isActive: formActive,
          }),
        });
        toast.success('Card updated successfully');
      } else {
        await api('/api/learning-stack/admin/cards', {
          method: 'POST',
          body: JSON.stringify({
            title: formTitle.trim(),
            description: formDesc.trim(),
            accentColor: formAccent,
            displayOrder: Number(formOrder),
            isActive: formActive,
          }),
        });
        toast.success('New card created successfully');
      }

      await invalidateAll();
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/learning-stack/admin/cards/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      toast.success('Card deleted successfully');
      await invalidateAll();
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete card');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (card: LearningStackCard) => {
    try {
      await api(`/api/learning-stack/admin/cards/${card._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !card.isActive }),
      });
      toast.success(`Card ${!card.isActive ? 'enabled' : 'disabled'}`);
      await invalidateAll();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update status');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const newCards = [...cards];
    const [moved] = newCards.splice(index, 1);
    newCards.splice(targetIndex, 0, moved);

    const orders = newCards.map((c, idx) => ({
      id: c._id,
      displayOrder: idx + 1,
    }));

    try {
      await api('/api/learning-stack/admin/cards/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ orders }),
      });
      toast.success('Display order updated');
      await invalidateAll();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to reorder cards');
    }
  };

  const handleResetToDefault = async () => {
    setResetting(true);
    try {
      await api('/api/learning-stack/admin/cards/reset', { method: 'POST' });
      toast.success('Reset to 11 default reference cards successfully');
      await invalidateAll();
      setResetDialogOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to reset cards');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#ECE6DE] bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF7F2] text-[#9A6B2F] border border-[#ECE6DE]">
              <Layers className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-bold text-[#1C1815]">
              Why Gyan Chowk / Learning Stack Cards
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#7B7368]">
            Manage the editorial cards displayed in the &quot;Why Gyan Chowk&quot; section on the About Page and Home Page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-[#1C1815] shadow-2xs'
                  : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#1C1815] shadow-2xs'
                  : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            className="text-xs text-[#7B7368] hover:text-[#1C1815] py-1.5 px-3"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="text-xs py-1.5 px-3"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={openAddModal}
            className="text-xs py-1.5 px-3.5"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add New Card
          </Button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#ECE6DE] bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#7B7368]">Total Cards</p>
          <p className="mt-1 text-2xl font-bold text-[#1C1815]">{cards.length}</p>
        </div>
        <div className="rounded-xl border border-[#ECE6DE] bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">Active Cards</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {cards.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#ECE6DE] bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-amber-600">Disabled Cards</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {cards.filter((c) => !c.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#ECE6DE] bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#7B7368]">Card Style</p>
          <p className="mt-1 text-sm font-semibold text-[#1C1815]">No Icons • Colored Accents</p>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-8 space-y-3 rounded-2xl border border-[#ECE6DE] bg-white">
          <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-600 rounded-2xl border border-red-200 bg-red-50">
          Failed to load learning stack cards. Please try refreshing.
        </div>
      ) : cards.length === 0 ? (
        <div className="p-8 rounded-2xl border border-[#ECE6DE] bg-white">
          <EmptyState
            title="No learning stack cards yet"
            body="Click 'Add New Card' or 'Reset Defaults' to populate the reference cards."
          />
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW (PROMINENT EDIT & DELETE BUTTONS) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, idx) => {
            const accentMeta =
              ACCENT_COLOR_OPTIONS.find((a) => a.value === card.accentColor) ??
              ACCENT_COLOR_OPTIONS[0];

            return (
              <div
                key={card._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#ECE6DE] bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-[#D5CBBB]"
              >
                {/* Left accent color indicator bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: accentMeta.hex }}
                  aria-hidden="true"
                />

                {/* Card Top: Order + Status + Move controls */}
                <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE2] pb-3 mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2 items-center justify-center rounded-full bg-[#FAF7F2] border border-[#ECE6DE] font-mono text-xs font-bold text-[#1C1815]">
                      #{card.displayOrder}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: accentMeta.badgeBg,
                        color: accentMeta.badgeText,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: accentMeta.hex }}
                      />
                      {accentMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status toggle button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(card)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        card.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {card.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-zinc-400" />
                          Disabled
                        </>
                      )}
                    </button>

                    {/* Move up & down */}
                    <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === cards.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="pl-2 pr-1 space-y-1.5 mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#14233C] leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#556070] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card Bottom: PROMINENT EDIT & DELETE BUTTONS */}
                <div className="flex items-center justify-between border-t border-[#F0EBE2] pt-3 pl-2">
                  <span className="text-[11px] text-[#7B7368]">
                    {card.updatedAt
                      ? `Updated ${new Date(card.updatedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : 'Default reference item'}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* EDIT BUTTON (PENCIL) */}
                    <button
                      type="button"
                      onClick={() => openEditModal(card)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CBBB] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1815] shadow-xs hover:bg-[#FAF7F2] hover:border-[#1C1815] transition-all"
                      title="Edit card details"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#B87B2E]" />
                      <span>Edit</span>
                    </button>

                    {/* DELETE BUTTON (TRASH) */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(card)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100 hover:border-red-300 transition-all"
                      title="Delete card"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW (WITH STICKY ACTIONS) ================= */
        <div className="overflow-hidden rounded-2xl border border-[#ECE6DE] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#ECE6DE] bg-[#FAF7F2] text-[11px] font-semibold uppercase tracking-wider text-[#7B7368]">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">Order</th>
                  <th className="px-4 py-3.5 w-28">Accent</th>
                  <th className="px-4 py-3.5 min-w-[180px]">Card Title</th>
                  <th className="px-4 py-3.5 min-w-[260px]">Description</th>
                  <th className="px-4 py-3.5 w-24 text-center">Status</th>
                  <th className="sticky right-0 bg-[#FAF7F2] px-4 py-3.5 w-48 text-right shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE2]">
                {cards.map((card, idx) => {
                  const accentMeta =
                    ACCENT_COLOR_OPTIONS.find((a) => a.value === card.accentColor) ??
                    ACCENT_COLOR_OPTIONS[0];

                  return (
                    <tr
                      key={card._id}
                      className="group transition-colors hover:bg-[#FDFBF7]"
                    >
                      {/* Order */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="rounded p-1 text-[#7B7368] hover:bg-[#EDE7DE] disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-mono text-xs font-semibold text-[#1C1815] min-w-[1.2rem]">
                            {card.displayOrder}
                          </span>
                          <button
                            type="button"
                            disabled={idx === cards.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="rounded p-1 text-[#7B7368] hover:bg-[#EDE7DE] disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Accent Color */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                          style={{
                            backgroundColor: accentMeta.badgeBg,
                            color: accentMeta.badgeText,
                          }}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: accentMeta.hex }}
                          />
                          {accentMeta.label}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 font-serif font-bold text-sm text-[#14233C]">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-1 rounded-full shrink-0"
                            style={{ backgroundColor: accentMeta.hex }}
                          />
                          <span>{card.title}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-[#5F656D] max-w-sm line-clamp-2">
                        {card.description}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(card)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                            card.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                          }`}
                        >
                          {card.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Sticky Actions Column */}
                      <td className="sticky right-0 bg-white group-hover:bg-[#FDFBF7] px-4 py-3 text-right shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* EDIT BUTTON (PENCIL) */}
                          <button
                            type="button"
                            onClick={() => openEditModal(card)}
                            className="inline-flex items-center gap-1 rounded-md border border-[#D5CBBB] bg-white px-2.5 py-1 text-xs font-semibold text-[#1C1815] hover:bg-[#FAF7F2] hover:border-[#1C1815] shadow-2xs transition-colors"
                            title="Edit Card"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#B87B2E]" />
                            <span>Edit</span>
                          </button>

                          {/* DELETE BUTTON (TRASH) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(card)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 hover:border-red-300 shadow-2xs transition-colors"
                            title="Delete Card"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editingCard ? 'Edit Learning Stack Card' : 'Add New Learning Stack Card'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Card Title *"
            placeholder="e.g. Recorded Video Learning"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description *"
            placeholder="e.g. HLS lessons you can pause, resume and revisit on your own time."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            rows={3}
            required
          />

          {/* Accent Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1815] mb-2">
              Left Accent Color *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_COLOR_OPTIONS.map((opt) => {
                const isSelected = formAccent === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormAccent(opt.value)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#1C1815] ring-1 ring-[#1C1815] bg-[#FAF7F2]'
                        : 'border-[#ECE6DE] hover:border-[#D1C9BE] bg-white'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: opt.hex }}
                    />
                    <span className="text-xs font-medium text-[#1C1815] truncate">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Display Order"
              value={formOrder}
              onChange={(e) => setFormOrder(Number(e.target.value))}
              min={1}
              max={9999}
            />

            <div className="flex flex-col justify-end pb-1.5">
              <label className="text-xs font-semibold text-[#1C1815] mb-2">
                Card Visibility
              </label>
              <button
                type="button"
                onClick={() => setFormActive(!formActive)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  formActive
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-300 bg-zinc-100 text-zinc-600'
                }`}
              >
                <span>{formActive ? 'Active (Visible)' : 'Disabled (Hidden)'}</span>
                {formActive ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Form action buttons */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-[#ECE6DE] pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingCard ? 'Update Card' : 'Save Card'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Learning Stack Card"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This card will be permanently removed from the website.`}
        confirmLabel="Delete Card"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset to Default Cards"
        body="Are you sure you want to reset all cards back to the 11 default reference learning stack cards? Any custom modifications will be replaced."
        confirmLabel="Reset to Defaults"
        loading={resetting}
        onConfirm={handleResetToDefault}
        onClose={() => setResetDialogOpen(false)}
      />
    </div>
  );
}
