'use client';

const STUDENT_IMAGE = '/test-prime-student.png';
const LEGACY_STUDENT = ['/test-prime-student.svg', 'pgxz33fwtqe6vimvqfmf'];

function studentSrc(imageSrc?: string) {
  if (!imageSrc) return STUDENT_IMAGE;
  if (LEGACY_STUDENT.some((token) => imageSrc.includes(token))) return STUDENT_IMAGE;
  return imageSrc;
}

export function TestSubscriptionVisual({
  imageSrc,
  imageAlt,
}: {
  imageSrc?: string;
  imageAlt?: string;
}) {
  const src = studentSrc(imageSrc);

  return (
    <div className="gc-test-prime-visual">
      <div className="gc-test-prime-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="gc-test-prime-student"
          src={src}
          alt={imageAlt || 'Student preparing with Gyan Chowk Test Prime'}
          width={1024}
          height={897}
          onError={(event) => {
            if (event.currentTarget.src.endsWith(STUDENT_IMAGE)) return;
            event.currentTarget.src = STUDENT_IMAGE;
          }}
        />
      </div>
    </div>
  );
}
