'use client';

import Link from 'next/link';
import { HomeFeaturedCoursesEditor } from '@/components/admin/HomeFeaturedCoursesEditor';

export default function CatalogueCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gc-black">Catalogue Courses</h1>
        <p className="mt-1 max-w-2xl text-sm text-gc-mute">
          Manage homepage catalogue cards: title, Target Exam, foundation, language, start date, pricing, cover image,
          publish/feature, edit and delete.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/admin/courses" className="text-[color:var(--brand-blue)] hover:underline">
            Full course admin
          </Link>
          <span className="mx-2 text-gc-mute">·</span>
          <Link href="/admin/cms" className="text-[color:var(--brand-blue)] hover:underline">
            Also on CMS
          </Link>
        </p>
      </div>
      <HomeFeaturedCoursesEditor />
    </div>
  );
}
