import { useEffect, useState } from 'react';

const SLIDES = [
  {
    title: 'New Season Arrivals',
    subtitle: 'Fresh styles, up to 30% off',
    image: 'https://picsum.photos/seed/hero1/1600/700',
    cta: 'Shop New In',
  },
  {
    title: 'Best Sellers',
    subtitle: 'Customer favourites, back in stock',
    image: 'https://picsum.photos/seed/hero2/1600/700',
    cta: 'Shop Best Sellers',
  },
  {
    title: 'Bundle & Save',
    subtitle: 'More value with every bundle',
    image: 'https://picsum.photos/seed/hero3/1600/700',
    cta: 'Shop Bundles',
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[70vh] min-h-[420px] overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">{slide.title}</h1>
            <p className="mt-3 text-lg text-gray-100">{slide.subtitle}</p>
            <button className="mt-6 bg-white text-gray-900 font-semibold px-6 py-3 rounded-md hover:bg-gray-100">
              {slide.cta}
            </button>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
