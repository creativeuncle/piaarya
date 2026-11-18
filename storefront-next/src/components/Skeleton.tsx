// Shared, theme-agnostic skeleton placeholders for the storefront. Every
// theme's section components (Home sections, ProductListing, ProductDetail,
// etc.) import these instead of writing their own loading UI, so a new theme
// gets consistent skeletons for free by reusing them — the shape (card, row,
// grid, pill, detail layout) matches what each kind of section actually
// renders once data arrives, and `tone` picks light or dark blocks to suit
// the theme's background.

type Tone = 'light' | 'dark';

function toneClass(tone: Tone) {
  return tone === 'dark' ? 'bg-white/10' : 'bg-gray-100';
}

export function SkeletonBlock({ className = '', tone = 'light' as Tone }: { className?: string; tone?: Tone }) {
  return <div className={`animate-pulse rounded ${toneClass(tone)} ${className}`} />;
}

// Matches ProductCard: square image, name line, price line.
export function SkeletonProductCard({
  className = 'shrink-0 w-64',
  tone = 'light' as Tone,
}: {
  className?: string;
  tone?: Tone;
}) {
  return (
    <div className={className}>
      <SkeletonBlock tone={tone} className="aspect-square rounded-md mb-3" />
      <SkeletonBlock tone={tone} className="h-4 w-3/4 rounded-full mb-2" />
      <SkeletonBlock tone={tone} className="h-4 w-1/3 rounded-full" />
    </div>
  );
}

// A horizontal run of product cards — for carousels (Trending, Explore,
// Related, Recently Viewed).
export function SkeletonProductRow({
  count = 4,
  tone = 'light' as Tone,
  cardClassName,
}: {
  count?: number;
  tone?: Tone;
  cardClassName?: string;
}) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} tone={tone} className={cardClassName} />
      ))}
    </div>
  );
}

// A product grid — for ProductListing.
export function SkeletonProductGrid({
  count = 8,
  tone = 'light' as Tone,
  className = 'grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10',
}: {
  count?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} tone={tone} className="w-full" />
      ))}
    </div>
  );
}

// Matches CategoriesSlider's circular category tile.
export function SkeletonCategoryPill({ tone = 'light' as Tone }: { tone?: Tone }) {
  return (
    <div className="shrink-0 w-56 text-center">
      <SkeletonBlock tone={tone} className="aspect-square rounded-full mb-3" />
      <SkeletonBlock tone={tone} className="h-4 w-2/3 mx-auto rounded-full" />
    </div>
  );
}

export function SkeletonCategoryRow({ count = 5, tone = 'light' as Tone }: { count?: number; tone?: Tone }) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCategoryPill key={i} tone={tone} />
      ))}
    </div>
  );
}

// Matches ReviewsSection's review card.
export function SkeletonReviewCard({ tone = 'light' as Tone }: { tone?: Tone }) {
  return (
    <div className={`shrink-0 w-80 rounded-lg p-6 ${tone === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
      <SkeletonBlock tone={tone} className="h-4 w-24 rounded-full mb-4" />
      <SkeletonBlock tone={tone} className="h-3 w-full rounded-full mb-2" />
      <SkeletonBlock tone={tone} className="h-3 w-5/6 rounded-full mb-4" />
      <SkeletonBlock tone={tone} className="h-3 w-1/3 rounded-full" />
    </div>
  );
}

export function SkeletonReviewRow({ count = 3, tone = 'light' as Tone }: { count?: number; tone?: Tone }) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonReviewCard key={i} tone={tone} />
      ))}
    </div>
  );
}

// Matches ProductDetail's two-column layout: gallery + title/price/actions/description.
export function SkeletonProductDetail({ tone = 'light' as Tone }: { tone?: Tone }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      <SkeletonBlock tone={tone} className="aspect-square rounded-md" />
      <div>
        <SkeletonBlock tone={tone} className="h-6 w-2/3 rounded-full mb-4" />
        <SkeletonBlock tone={tone} className="h-5 w-1/4 rounded-full mb-6" />
        <SkeletonBlock tone={tone} className="h-12 w-full rounded-md mb-6" />
        <SkeletonBlock tone={tone} className="h-4 w-full rounded-full mb-2" />
        <SkeletonBlock tone={tone} className="h-4 w-full rounded-full mb-2" />
        <SkeletonBlock tone={tone} className="h-4 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

// A single line — for simple inline/text loading spots.
export function SkeletonLine({ className = 'h-4 w-40', tone = 'light' as Tone }: { className?: string; tone?: Tone }) {
  return <SkeletonBlock tone={tone} className={`${className} rounded-full`} />;
}

// A short stack of lines — for list-style pages (orders, addresses, etc.)
// before their real rows arrive.
export function SkeletonList({
  rows = 3,
  tone = 'light' as Tone,
}: {
  rows?: number;
  tone?: Tone;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock tone={tone} className="h-12 w-12 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine tone={tone} className="h-3.5 w-1/2" />
            <SkeletonLine tone={tone} className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
