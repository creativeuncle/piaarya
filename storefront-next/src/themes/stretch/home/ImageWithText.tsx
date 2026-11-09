import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { DARK_BG, DISPLAY_FONT, EYEBROW, PILL_BUTTON } from '../styles';

type Props = {
  imageUrl?: string;
  heading?: string;
  text?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export default function ImageWithText({
  imageUrl = 'https://picsum.photos/seed/stretch-collection/900/1100',
  heading = 'Fabrics chosen first, styles designed around them.',
  text = 'Every piece starts with the material — organic cotton, responsibly sourced wool, recycled fibers — then we cut it for how you actually move through your day.',
  buttonLabel = 'Shop the Collection',
  buttonLink = '/products',
}: Props) {
  return (
    <section className={`${DARK_BG} py-16 md:py-20`}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-10 md:flex-row md:gap-14 md:px-10 md:py-14">
        <div className="aspect-[4/5] w-full max-w-sm shrink-0 overflow-hidden rounded-3xl md:w-1/2">
          <img src={imageUrl} alt={heading} className="h-full w-full object-cover" />
        </div>

        <div className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-left">
          <p className={EYEBROW}>The Collection</p>
          <h2 className={`${DISPLAY_FONT} mt-3 text-3xl leading-tight text-white md:text-4xl`}>{heading}</h2>
          {text && <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">{text}</p>}
          {buttonLabel && (
            <a href={buttonLink || '#'} className={`mt-7 ${PILL_BUTTON}`}>
              {buttonLabel}
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
