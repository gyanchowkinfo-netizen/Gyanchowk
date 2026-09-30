'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  Pencil,
  Plus,
  Table as TableIcon,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import type {
  AboutPageConfig,
  AboutVisionConfig,
  AboutValuesConfig,
  AboutPlatformConfig,
  AboutFutureVisionConfig,
} from '@/lib/types';

export const ACCENT_COLOR_OPTIONS = [
  { value: 'blue', label: 'Sky Blue', hex: '#0284C7', badgeBg: '#E0F2FE', badgeText: '#075985' },
  { value: 'amber', label: 'Warm Amber', hex: '#F59E0B', badgeBg: '#FEF3C7', badgeText: '#92400E' },
  { value: 'rose', label: 'Vibrant Rose', hex: '#E11D48', badgeBg: '#FFE4E6', badgeText: '#9F1239' },
  { value: 'green', label: 'Emerald Green', hex: '#059669', badgeBg: '#D1FAE5', badgeText: '#065F46' },
  { value: 'violet', label: 'Royal Violet', hex: '#7C3AED', badgeBg: '#EDE9FE', badgeText: '#5B21B6' },
  { value: 'cyan', label: 'Cyan Blue', hex: '#0891B2', badgeBg: '#CFFAFE', badgeText: '#155E75' },
  { value: 'indigo', label: 'Royal Indigo', hex: '#4F46E5', badgeBg: '#EEF2FF', badgeText: '#3730A3' },
  { value: 'teal', label: 'Deep Teal', hex: '#0D9488', badgeBg: '#CCFBF1', badgeText: '#115E59' },
  { value: 'coral', label: 'Coral Red', hex: '#EF4444', badgeBg: '#FEE2E2', badgeText: '#991B1B' },
  { value: 'orange', label: 'Bright Orange', hex: '#F97316', badgeBg: '#FFEDD5', badgeText: '#9A3412' },
];

function getAccentMeta(key?: string) {
  const found = ACCENT_COLOR_OPTIONS.find((a) => a.value === key?.toLowerCase());
  return found || ACCENT_COLOR_OPTIONS[0];
}

function generateKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* =========================================================================
   1. OUR VISION STAGES MANAGER
   ========================================================================= */
export function VisionStagesManager({
  config,
  onUpdate,
}: {
  config: AboutPageConfig;
  onUpdate: (updated: AboutPageConfig, message: string) => Promise<void>;
}) {
  const stages = config.vision.stages || [];
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; title: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingIndex(null);
    setFormTitle('');
    setFormBody('');
    setFormActive(true);
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const s = stages[idx];
    setEditingIndex(idx);
    setFormTitle(s.title);
    setFormBody(s.body);
    setFormActive(s.active !== false);
    setModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      let updatedStages = [...stages];
      if (editingIndex !== null) {
        updatedStages[editingIndex] = {
          ...updatedStages[editingIndex],
          title: formTitle.trim(),
          body: formBody.trim(),
          active: formActive,
          order: editingIndex + 1,
        };
      } else {
        updatedStages.push({
          _key: generateKey('v'),
          title: formTitle.trim(),
          body: formBody.trim(),
          active: formActive,
          order: updatedStages.length + 1,
        });
      }
      const updatedConfig = {
        ...config,
        vision: { ...config.vision, stages: updatedStages },
      };
      await onUpdate(updatedConfig, editingIndex !== null ? 'Stage updated successfully' : 'Stage added successfully');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    const updatedStages = stages.filter((_, i) => i !== deleteTarget.index);
    const updatedConfig = {
      ...config,
      vision: { ...config.vision, stages: updatedStages },
    };
    await onUpdate(updatedConfig, 'Stage deleted successfully');
    setDeleteTarget(null);
  };

  const handleToggleActive = async (idx: number) => {
    const updatedStages = [...stages];
    updatedStages[idx] = {
      ...updatedStages[idx],
      active: updatedStages[idx].active === false ? true : false,
    };
    const updatedConfig = {
      ...config,
      vision: { ...config.vision, stages: updatedStages },
    };
    await onUpdate(updatedConfig, `Stage ${updatedStages[idx].active ? 'activated' : 'disabled'}`);
  };

  const handleMove = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const updatedStages = [...stages];
    const temp = updatedStages[idx];
    updatedStages[idx] = updatedStages[targetIdx];
    updatedStages[targetIdx] = temp;
    const updatedConfig = {
      ...config,
      vision: { ...config.vision, stages: updatedStages },
    };
    await onUpdate(updatedConfig, 'Stage order updated');
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0EBE2] pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#1C1815]">
            Our Vision Journey Cards ({stages.length})
          </h3>
          <p className="text-xs text-[#7B7368]">
            Manage the sequential journey stages displayed on the About page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Button type="button" variant="primary" onClick={openAddModal} className="text-xs py-1.5 px-3">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add New Stage
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stages.map((stage, idx) => {
            const accentMeta = ACCENT_COLOR_OPTIONS[idx % ACCENT_COLOR_OPTIONS.length];
            const stepNumber = String(idx + 1).padStart(2, '0');
            const isActive = stage.active !== false;

            return (
              <div
                key={stage._key || `vision-${idx}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#ECE6DE] bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-[#D5CBBB]"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: accentMeta.hex }}
                  aria-hidden="true"
                />

                {/* Top: Step + Status + Move */}
                <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE2] pb-3 mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2.5 items-center justify-center rounded-full bg-[#FAF7F2] border border-[#ECE6DE] font-mono text-xs font-bold text-[#1C1815]">
                      Step {stepNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(idx)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {isActive ? (
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

                    <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pl-2 pr-1 space-y-1.5 mb-4">
                  <h4 className="font-serif text-lg font-bold text-[#14233C] leading-snug">{stage.title}</h4>
                  <p className="text-xs sm:text-[13px] text-[#556070] leading-relaxed line-clamp-3">{stage.body}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-[#F0EBE2] pt-3 pl-2">
                  <span className="text-[11px] text-[#7B7368]">Step #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CBBB] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1815] shadow-xs hover:bg-[#FAF7F2] hover:border-[#1C1815] transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#B87B2E]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ index: idx, title: stage.title })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100 hover:border-red-300 transition-all"
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
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-[#ECE6DE]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#ECE6DE] text-[11px] uppercase text-[#7B7368]">
              <tr>
                <th className="px-4 py-3 w-16">Step</th>
                <th className="px-4 py-3 min-w-[150px]">Stage Title</th>
                <th className="px-4 py-3 min-w-[250px]">Description</th>
                <th className="px-4 py-3 w-24 text-center">Status</th>
                <th className="px-4 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DE]">
              {stages.map((stage, idx) => (
                <tr key={stage._key || idx} className="hover:bg-[#FAF7F2]/50">
                  <td className="px-4 py-3 font-mono font-bold">#{idx + 1}</td>
                  <td className="px-4 py-3 font-serif font-bold text-[#1C1815]">{stage.title}</td>
                  <td className="px-4 py-3 text-[#556070] line-clamp-2">{stage.body}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        stage.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {stage.active !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(idx)}
                        className="rounded border border-[#D5CBBB] p-1 text-[#1C1815] hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ index: idx, title: stage.title })}
                        className="rounded border border-red-200 p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-3">
              <h3 className="font-display text-lg font-bold text-[#1C1815]">
                {editingIndex !== null ? 'Edit Vision Stage' : 'Add New Vision Stage'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Stage Title *"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Student, Discovery, Mastery..."
              />
              <Textarea
                label="Stage Description *"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={3}
                placeholder="Describe what happens during this stage..."
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vision-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#8C6228] focus:ring-[#8C6228]"
                />
                <label htmlFor="vision-active-check" className="text-xs font-semibold text-[#1C1815]">
                  Active on live About page
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#ECE6DE] pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSaveModal} disabled={saving} className="text-xs">
                {saving ? 'Saving...' : 'Save Stage'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Vision Stage?"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Stage"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* =========================================================================
   2. OUR VALUES CARDS MANAGER
   ========================================================================= */
export function ValuesCardsManager({
  config,
  onUpdate,
}: {
  config: AboutPageConfig;
  onUpdate: (updated: AboutPageConfig, message: string) => Promise<void>;
}) {
  const items = config.values.items || [];
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formColor, setFormColor] = useState('blue');
  const [formActive, setFormActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; title: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingIndex(null);
    setFormTitle('');
    setFormBody('');
    setFormColor(ACCENT_COLOR_OPTIONS[items.length % ACCENT_COLOR_OPTIONS.length].value);
    setFormActive(true);
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const item = items[idx];
    setEditingIndex(idx);
    setFormTitle(item.title);
    setFormBody(item.body);
    setFormColor(item.colorVariant || 'blue');
    setFormActive(item.active !== false);
    setModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      let updatedItems = [...items];
      if (editingIndex !== null) {
        updatedItems[editingIndex] = {
          ...updatedItems[editingIndex],
          title: formTitle.trim(),
          body: formBody.trim(),
          colorVariant: formColor,
          active: formActive,
        };
      } else {
        updatedItems.push({
          _key: generateKey('va'),
          title: formTitle.trim(),
          body: formBody.trim(),
          colorVariant: formColor,
          active: formActive,
        });
      }
      const updatedConfig = {
        ...config,
        values: { ...config.values, items: updatedItems },
      };
      await onUpdate(updatedConfig, editingIndex !== null ? 'Value card updated' : 'Value card added');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    const updatedItems = items.filter((_, i) => i !== deleteTarget.index);
    const updatedConfig = {
      ...config,
      values: { ...config.values, items: updatedItems },
    };
    await onUpdate(updatedConfig, 'Value card deleted');
    setDeleteTarget(null);
  };

  const handleToggleActive = async (idx: number) => {
    const updatedItems = [...items];
    updatedItems[idx] = {
      ...updatedItems[idx],
      active: updatedItems[idx].active === false ? true : false,
    };
    const updatedConfig = {
      ...config,
      values: { ...config.values, items: updatedItems },
    };
    await onUpdate(updatedConfig, `Value ${updatedItems[idx].active ? 'activated' : 'disabled'}`);
  };

  const handleMove = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const updatedItems = [...items];
    const temp = updatedItems[idx];
    updatedItems[idx] = updatedItems[targetIdx];
    updatedItems[targetIdx] = temp;
    const updatedConfig = {
      ...config,
      values: { ...config.values, items: updatedItems },
    };
    await onUpdate(updatedConfig, 'Value card order updated');
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0EBE2] pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#1C1815]">
            Our Values Cards ({items.length})
          </h3>
          <p className="text-xs text-[#7B7368]">
            Manage the core value principles and their accent colors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Button type="button" variant="primary" onClick={openAddModal} className="text-xs py-1.5 px-3">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add New Value
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const accentMeta = getAccentMeta(item.colorVariant);
            const isActive = item.active !== false;

            return (
              <div
                key={item._key || `val-${idx}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#ECE6DE] bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-[#D5CBBB]"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: accentMeta.hex }}
                  aria-hidden="true"
                />

                {/* Top: Order + Accent Color Badge + Move */}
                <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE2] pb-3 mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2 items-center justify-center rounded-full bg-[#FAF7F2] border border-[#ECE6DE] font-mono text-xs font-bold text-[#1C1815]">
                      #{idx + 1}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: accentMeta.badgeBg, color: accentMeta.badgeText }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentMeta.hex }} />
                      {accentMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(idx)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {isActive ? (
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

                    <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pl-2 pr-1 space-y-1.5 mb-4">
                  <h4 className="font-serif text-lg font-bold text-[#14233C] leading-snug">{item.title}</h4>
                  <p className="text-xs sm:text-[13px] text-[#556070] leading-relaxed line-clamp-3">{item.body}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-[#F0EBE2] pt-3 pl-2">
                  <span className="text-[11px] text-[#7B7368]">Value #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CBBB] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1815] shadow-xs hover:bg-[#FAF7F2] hover:border-[#1C1815] transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#B87B2E]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ index: idx, title: item.title })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100 hover:border-red-300 transition-all"
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
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-[#ECE6DE]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#ECE6DE] text-[11px] uppercase text-[#7B7368]">
              <tr>
                <th className="px-4 py-3 w-16">#</th>
                <th className="px-4 py-3 w-28">Color</th>
                <th className="px-4 py-3 min-w-[150px]">Value Title</th>
                <th className="px-4 py-3 min-w-[250px]">Description</th>
                <th className="px-4 py-3 w-24 text-center">Status</th>
                <th className="px-4 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DE]">
              {items.map((item, idx) => {
                const meta = getAccentMeta(item.colorVariant);
                return (
                  <tr key={item._key || idx} className="hover:bg-[#FAF7F2]/50">
                    <td className="px-4 py-3 font-mono font-bold">#{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                        style={{ backgroundColor: meta.badgeBg, color: meta.badgeText }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.hex }} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-serif font-bold text-[#1C1815]">{item.title}</td>
                    <td className="px-4 py-3 text-[#556070] line-clamp-2">{item.body}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                          item.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {item.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(idx)}
                          className="rounded border border-[#D5CBBB] p-1 text-[#1C1815] hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ index: idx, title: item.title })}
                          className="rounded border border-red-200 p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-3">
              <h3 className="font-display text-lg font-bold text-[#1C1815]">
                {editingIndex !== null ? 'Edit Value Card' : 'Add New Value Card'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Value Title *"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Outcome Rigor, Empathy..."
              />
              <Textarea
                label="Description *"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={3}
                placeholder="Describe this value principle..."
              />

              {/* Accent Color Selection */}
              <div>
                <label className="text-xs font-semibold text-[#1C1815] block mb-2">Accent Color Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ACCENT_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormColor(opt.value)}
                      className={`flex items-center gap-1.5 rounded-lg border p-2 text-[11px] font-semibold transition-all ${
                        formColor === opt.value
                          ? 'border-[#1C1815] bg-[#FAF7F2] ring-2 ring-[#8C6228]/20'
                          : 'border-[#ECE6DE] hover:border-gray-300'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: opt.hex }} />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="value-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#8C6228] focus:ring-[#8C6228]"
                />
                <label htmlFor="value-active-check" className="text-xs font-semibold text-[#1C1815]">
                  Active on live About page
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#ECE6DE] pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSaveModal} disabled={saving} className="text-xs">
                {saving ? 'Saving...' : 'Save Card'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Value Card?"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Card"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* =========================================================================
   3. PLATFORM FEATURES CARDS MANAGER
   ========================================================================= */
export function PlatformFeaturesCardsManager({
  config,
  onUpdate,
}: {
  config: AboutPageConfig;
  onUpdate: (updated: AboutPageConfig, message: string) => Promise<void>;
}) {
  const items = config.platformFeatures.items || [];
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formHref, setFormHref] = useState('/courses');
  const [formBadge, setFormBadge] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; title: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingIndex(null);
    setFormTitle('');
    setFormBody('');
    setFormHref('/courses');
    setFormBadge('');
    setFormActive(true);
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const item = items[idx];
    setEditingIndex(idx);
    setFormTitle(item.title);
    setFormBody(item.body);
    setFormHref(item.href || '/courses');
    setFormBadge(item.badge && item.badge.toLowerCase() !== 'recorded' ? item.badge : '');
    setFormActive(item.active !== false);
    setModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      let updatedItems = [...items];
      if (editingIndex !== null) {
        updatedItems[editingIndex] = {
          ...updatedItems[editingIndex],
          title: formTitle.trim(),
          body: formBody.trim(),
          href: formHref.trim() || '/courses',
          badge: formBadge.trim().toLowerCase() !== 'recorded' ? formBadge.trim() : '',
          active: formActive,
        };
      } else {
        updatedItems.push({
          _key: generateKey('pf'),
          title: formTitle.trim(),
          body: formBody.trim(),
          href: formHref.trim() || '/courses',
          badge: formBadge.trim().toLowerCase() !== 'recorded' ? formBadge.trim() : '',
          active: formActive,
        });
      }
      const updatedConfig = {
        ...config,
        platformFeatures: { ...config.platformFeatures, items: updatedItems },
      };
      await onUpdate(updatedConfig, editingIndex !== null ? 'Feature card updated' : 'Feature card added');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    const updatedItems = items.filter((_, i) => i !== deleteTarget.index);
    const updatedConfig = {
      ...config,
      platformFeatures: { ...config.platformFeatures, items: updatedItems },
    };
    await onUpdate(updatedConfig, 'Feature card deleted');
    setDeleteTarget(null);
  };

  const handleToggleActive = async (idx: number) => {
    const updatedItems = [...items];
    updatedItems[idx] = {
      ...updatedItems[idx],
      active: updatedItems[idx].active === false ? true : false,
    };
    const updatedConfig = {
      ...config,
      platformFeatures: { ...config.platformFeatures, items: updatedItems },
    };
    await onUpdate(updatedConfig, `Feature ${updatedItems[idx].active ? 'activated' : 'disabled'}`);
  };

  const handleMove = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const updatedItems = [...items];
    const temp = updatedItems[idx];
    updatedItems[idx] = updatedItems[targetIdx];
    updatedItems[targetIdx] = temp;
    const updatedConfig = {
      ...config,
      platformFeatures: { ...config.platformFeatures, items: updatedItems },
    };
    await onUpdate(updatedConfig, 'Feature card order updated');
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0EBE2] pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#1C1815]">
            Platform Feature Cards ({items.length})
          </h3>
          <p className="text-xs text-[#7B7368]">
            Manage all platform capabilities, links, and tags displayed in the feature grid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Button type="button" variant="primary" onClick={openAddModal} className="text-xs py-1.5 px-3">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add New Feature
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const accentMeta = ACCENT_COLOR_OPTIONS[idx % ACCENT_COLOR_OPTIONS.length];
            const isActive = item.active !== false;
            const hasBadge = item.badge && item.badge.trim().toLowerCase() !== 'recorded';

            return (
              <div
                key={item._key || `feat-${idx}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#ECE6DE] bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-[#D5CBBB]"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: accentMeta.hex }}
                  aria-hidden="true"
                />

                {/* Top: Order + Badge/Link + Move */}
                <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE2] pb-3 mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2 items-center justify-center rounded-full bg-[#FAF7F2] border border-[#ECE6DE] font-mono text-xs font-bold text-[#1C1815]">
                      #{idx + 1}
                    </span>
                    {hasBadge && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                      {item.href || '/courses'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(idx)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {isActive ? (
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

                    <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pl-2 pr-1 space-y-1.5 mb-4">
                  <h4 className="font-serif text-lg font-bold text-[#14233C] leading-snug">{item.title}</h4>
                  <p className="text-xs sm:text-[13px] text-[#556070] leading-relaxed line-clamp-3">{item.body}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-[#F0EBE2] pt-3 pl-2">
                  <span className="text-[11px] text-[#7B7368]">Card #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CBBB] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1815] shadow-xs hover:bg-[#FAF7F2] hover:border-[#1C1815] transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#B87B2E]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ index: idx, title: item.title })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100 hover:border-red-300 transition-all"
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
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-[#ECE6DE]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#ECE6DE] text-[11px] uppercase text-[#7B7368]">
              <tr>
                <th className="px-4 py-3 w-16">#</th>
                <th className="px-4 py-3 w-28">Badge</th>
                <th className="px-4 py-3 min-w-[150px]">Feature Title</th>
                <th className="px-4 py-3 w-36">Link</th>
                <th className="px-4 py-3 min-w-[200px]">Description</th>
                <th className="px-4 py-3 w-24 text-center">Status</th>
                <th className="px-4 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DE]">
              {items.map((item, idx) => (
                <tr key={item._key || idx} className="hover:bg-[#FAF7F2]/50">
                  <td className="px-4 py-3 font-mono font-bold">#{idx + 1}</td>
                  <td className="px-4 py-3">
                    {item.badge && item.badge.toLowerCase() !== 'recorded' ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10.5px] font-bold">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-serif font-bold text-[#1C1815]">{item.title}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{item.href || '/courses'}</td>
                  <td className="px-4 py-3 text-[#556070] line-clamp-2">{item.body}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        item.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {item.active !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(idx)}
                        className="rounded border border-[#D5CBBB] p-1 text-[#1C1815] hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ index: idx, title: item.title })}
                        className="rounded border border-red-200 p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-3">
              <h3 className="font-display text-lg font-bold text-[#1C1815]">
                {editingIndex !== null ? 'Edit Platform Feature' : 'Add New Platform Feature'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Feature Title *"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Courses, Tests, Doubt Engine..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Target Link (Href)"
                  value={formHref}
                  onChange={(e) => setFormHref(e.target.value)}
                  placeholder="/courses or /teachers"
                />
                <Input
                  label="Badge Tag (Optional)"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. Fast HLS, Priority..."
                />
              </div>
              <Textarea
                label="Description *"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={3}
                placeholder="Describe this platform capability..."
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="feat-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#8C6228] focus:ring-[#8C6228]"
                />
                <label htmlFor="feat-active-check" className="text-xs font-semibold text-[#1C1815]">
                  Active on live About page
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#ECE6DE] pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSaveModal} disabled={saving} className="text-xs">
                {saving ? 'Saving...' : 'Save Feature'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Platform Feature?"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Feature"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* =========================================================================
   4. WHERE WE'RE GOING (FUTURE VISION) STEPS MANAGER
   ========================================================================= */
export function FutureVisionStepsManager({
  config,
  onUpdate,
}: {
  config: AboutPageConfig;
  onUpdate: (updated: AboutPageConfig, message: string) => Promise<void>;
}) {
  const steps = config.futureVision.steps || [];
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTag, setFormTag] = useState('Upcoming');
  const [formActive, setFormActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; title: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingIndex(null);
    setFormTitle('');
    setFormBody('');
    setFormTag('Upcoming');
    setFormActive(true);
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const s = steps[idx];
    setEditingIndex(idx);
    setFormTitle(s.title);
    setFormBody(s.body);
    setFormTag(s.tag || 'Upcoming');
    setFormActive(s.active !== false);
    setModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      let updatedSteps = [...steps];
      if (editingIndex !== null) {
        updatedSteps[editingIndex] = {
          ...updatedSteps[editingIndex],
          title: formTitle.trim(),
          body: formBody.trim(),
          tag: formTag.trim(),
          active: formActive,
        };
      } else {
        updatedSteps.push({
          _key: generateKey('fv'),
          title: formTitle.trim(),
          body: formBody.trim(),
          tag: formTag.trim(),
          active: formActive,
        });
      }
      const updatedConfig = {
        ...config,
        futureVision: { ...config.futureVision, steps: updatedSteps },
      };
      await onUpdate(updatedConfig, editingIndex !== null ? 'Milestone card updated' : 'Milestone card added');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    const updatedSteps = steps.filter((_, i) => i !== deleteTarget.index);
    const updatedConfig = {
      ...config,
      futureVision: { ...config.futureVision, steps: updatedSteps },
    };
    await onUpdate(updatedConfig, 'Milestone card deleted');
    setDeleteTarget(null);
  };

  const handleToggleActive = async (idx: number) => {
    const updatedSteps = [...steps];
    updatedSteps[idx] = {
      ...updatedSteps[idx],
      active: updatedSteps[idx].active === false ? true : false,
    };
    const updatedConfig = {
      ...config,
      futureVision: { ...config.futureVision, steps: updatedSteps },
    };
    await onUpdate(updatedConfig, `Milestone ${updatedSteps[idx].active ? 'activated' : 'disabled'}`);
  };

  const handleMove = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const updatedSteps = [...steps];
    const temp = updatedSteps[idx];
    updatedSteps[idx] = updatedSteps[targetIdx];
    updatedSteps[targetIdx] = temp;
    const updatedConfig = {
      ...config,
      futureVision: { ...config.futureVision, steps: updatedSteps },
    };
    await onUpdate(updatedConfig, 'Milestone card order updated');
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0EBE2] pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#1C1815]">
            Where We&apos;re Going — Roadmap Cards ({steps.length})
          </h3>
          <p className="text-xs text-[#7B7368]">
            Manage upcoming milestones and future horizons displayed on the About page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1C1815] shadow-2xs' : 'text-[#7B7368] hover:text-[#1C1815]'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Button type="button" variant="primary" onClick={openAddModal} className="text-xs py-1.5 px-3">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add New Milestone
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, idx) => {
            const accentMeta = ACCENT_COLOR_OPTIONS[(idx + 2) % ACCENT_COLOR_OPTIONS.length];
            const isActive = step.active !== false;

            return (
              <div
                key={step._key || `fut-${idx}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#ECE6DE] bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-[#D5CBBB]"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: accentMeta.hex }}
                  aria-hidden="true"
                />

                {/* Top: Order + Tag Pill + Move */}
                <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE2] pb-3 mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2 items-center justify-center rounded-full bg-[#FAF7F2] border border-[#ECE6DE] font-mono text-xs font-bold text-[#1C1815]">
                      #{idx + 1}
                    </span>
                    {step.tag && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-[10.5px] font-bold">
                        {step.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(idx)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {isActive ? (
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

                    <div className="inline-flex rounded-lg border border-[#ECE6DE] bg-[#FAF7F2] p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === steps.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="rounded p-1 text-[#7B7368] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pl-2 pr-1 space-y-1.5 mb-4">
                  <h4 className="font-serif text-lg font-bold text-[#14233C] leading-snug">{step.title}</h4>
                  <p className="text-xs sm:text-[13px] text-[#556070] leading-relaxed line-clamp-3">{step.body}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-[#F0EBE2] pt-3 pl-2">
                  <span className="text-[11px] text-[#7B7368]">Milestone #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CBBB] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1815] shadow-xs hover:bg-[#FAF7F2] hover:border-[#1C1815] transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#B87B2E]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ index: idx, title: step.title })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100 hover:border-red-300 transition-all"
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
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-[#ECE6DE]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#ECE6DE] text-[11px] uppercase text-[#7B7368]">
              <tr>
                <th className="px-4 py-3 w-16">#</th>
                <th className="px-4 py-3 w-28">Tag</th>
                <th className="px-4 py-3 min-w-[150px]">Milestone Title</th>
                <th className="px-4 py-3 min-w-[250px]">Description</th>
                <th className="px-4 py-3 w-24 text-center">Status</th>
                <th className="px-4 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DE]">
              {steps.map((step, idx) => (
                <tr key={step._key || idx} className="hover:bg-[#FAF7F2]/50">
                  <td className="px-4 py-3 font-mono font-bold">#{idx + 1}</td>
                  <td className="px-4 py-3">
                    {step.tag ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 text-[10.5px] font-bold">
                        {step.tag}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-serif font-bold text-[#1C1815]">{step.title}</td>
                  <td className="px-4 py-3 text-[#556070] line-clamp-2">{step.body}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        step.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {step.active !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(idx)}
                        className="rounded border border-[#D5CBBB] p-1 text-[#1C1815] hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ index: idx, title: step.title })}
                        className="rounded border border-red-200 p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#ECE6DE] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-3">
              <h3 className="font-display text-lg font-bold text-[#1C1815]">
                {editingIndex !== null ? 'Edit Milestone Card' : 'Add New Milestone Card'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Milestone Title *"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Better learning, AI Assistant..."
              />
              <Input
                label="Milestone Tag"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="e.g. Upcoming, Phase 2, Growth..."
              />
              <Textarea
                label="Description *"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={3}
                placeholder="Describe what is planned for this horizon..."
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="future-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#8C6228] focus:ring-[#8C6228]"
                />
                <label htmlFor="future-active-check" className="text-xs font-semibold text-[#1C1815]">
                  Active on live About page
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#ECE6DE] pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSaveModal} disabled={saving} className="text-xs">
                {saving ? 'Saving...' : 'Save Milestone'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Milestone Card?"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Milestone"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
