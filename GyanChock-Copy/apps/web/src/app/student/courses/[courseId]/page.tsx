'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/States';

export default function StudentCourseRedirectPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params?.courseId) {
      router.replace(`/student/learning/${params.courseId}`);
    }
  }, [params?.courseId, router]);

  return <LoadingState label="Entering course classroom…" />;
}
