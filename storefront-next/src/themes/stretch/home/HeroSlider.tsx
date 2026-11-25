import { DISPLAY_FONT, EYEBROW, PILL_BUTTON } from '../styles';

export default function HeroSlider() {
  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-[#F7EFDD]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7EFDD] via-[#E4D2A6] to-[#EEDFBE]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className={EYEBROW}>New Season</p>
        <h1 className={`${DISPLAY_FONT} mt-3 max-w-2xl text-4xl leading-[1.1] text-[#3A2E1D] md:text-6xl`}>
          Clothing built for movement, made to last.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#3A2E1D]/70">
          Considered essentials in durable, natural fabrics — cut for everyday wear, designed to outlast trends.
        </p>
        <a href="/products" className={`mt-7 ${PILL_BUTTON}`}>
          Shop Now
        </a>
      </div>
    </section>
  );
}
