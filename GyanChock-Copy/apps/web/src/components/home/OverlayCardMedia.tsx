import Image from 'next/image';
import { overlayImageFor } from './overlayImages';

export function OverlayCardMedia({ title }: { title: string }) {
  return (
    <span className="gc-overlay-card-media" aria-hidden="true">
      <Image
        src={overlayImageFor(title)}
        alt=""
        fill
        sizes="(min-width: 1280px) 260px, (min-width: 640px) 40vw, 50vw"
        className="gc-overlay-card-photo"
      />
      <span className="gc-overlay-card-veil" />
    </span>
  );
}
