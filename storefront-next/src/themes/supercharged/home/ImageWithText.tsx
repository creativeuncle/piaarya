type Props = {
  imageUrl?: string;
  heading?: string;
  text?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export default function ImageWithText({
  imageUrl = 'https://picsum.photos/seed/imagewithtext/800/800',
  heading = 'Pair large text with an image',
  text = 'Give focus to your chosen product, collection, or blog post. Add details on availability, style, or even provide a review.',
  buttonLabel,
  buttonLink,
}: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden">
        <img src={imageUrl} alt={heading} className="w-full h-full object-cover" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
        <p className="text-gray-600 mb-6">{text}</p>
        {buttonLabel && (
          <a
            href={buttonLink || '#'}
            className="inline-block border border-gray-900 text-gray-900 text-sm font-medium px-6 py-3 rounded-md hover:bg-gray-900 hover:text-white transition-colors"
          >
            {buttonLabel}
          </a>
        )}
      </div>
    </section>
  );
}
