import { DISPLAY_FONT, EYEBROW, PILL_BUTTON } from '../styles';

export default function HeroSlider() {
  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-[#41473d]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#41473d] via-[#4d5445] to-[#646c5f]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className={EYEBROW}>New Season</p>
        <h1 className={`${DISPLAY_FONT} mt-3 max-w-2xl text-4xl leading-[1.1] text-white md:text-6xl`}>
          Clothing built for movement, made to last.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
          Considered essentials in durable, natural fabrics — cut for everyday wear, designed to outlast trends.
        </p>
        <a href="/products" className={`mt-7 ${PILL_BUTTON}`}>
          Shop Now
        </a>
      </div>
    </section>
  );
}
