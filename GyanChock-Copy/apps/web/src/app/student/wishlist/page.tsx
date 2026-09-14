'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CourseCard } from '@/components/public/CourseCard';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import type { CourseCardData } from '@/lib/types';

export default function WishlistPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api<{ items: CourseCardData[] }>('/api/learning/wishlist'),
  });
  async function remove(id: string) {
    await api(`/api/learning/wishlist/${id}`, { method: 'DELETE' });
    toast.success('Removed');
    await refetch();
  }
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-gc-black">Wishlist</h1>
      {isLoading ? <LoadingState /> : null}
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No saved courses" action={{ href: '/courses', label: 'Discover courses' }} />
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        {(data?.items ?? []).map((c) => (
          <div key={c._id} className="space-y-2">
            <CourseCard course={c} />
            <Button variant="ghost" onClick={() => void remove(c._id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
