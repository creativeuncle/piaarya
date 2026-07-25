import { Link } from 'react-router-dom';

const BADGE_LABELS = {
  bestseller: 'Best Seller',
  new: 'New In',
  bundle: 'Bundle',
};

export default function ProductCard({ product, className = 'shrink-0 w-64 snap-start' }) {
  const image = product.media?.[0]?.url;
  const badge = product.tags?.find((t) => BADGE_LABELS[t]);

  return (
    <Link to={`/products/${product._id}`} className={`block ${className}`}>
      <div className="relative bg-gray-100 aspect-square overflow-hidden rounded-md mb-3">
        {badge && (
          <span className="absolute top-2 left-2 bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide">
            {BADGE_LABELS[badge]}
          </span>
        )}
        {image ? (
          <img src={image} alt={product.media[0].altText || product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>
      <p className="text-sm text-gray-900 font-medium truncate">{product.name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm text-gray-900 font-semibold">₹{product.price}</span>
        {product.compareAtPrice > product.price && (
          <span className="text-sm text-gray-400 line-through">₹{product.compareAtPrice}</span>
        )}
      </div>
    </Link>
  );
}
