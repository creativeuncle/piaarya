import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { HeartIcon, RulerIcon } from '@hugeicons/core-free-icons';
import { fetchProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { recordView } from '../hooks/useRecentlyViewed';
import ProductGallery from '../components/product/ProductGallery';
import VariantSelector from '../components/product/VariantSelector';
import SizeChartModal from '../components/product/SizeChartModal';
import PincodeChecker from '../components/product/PincodeChecker';
import RelatedProducts from '../components/product/RelatedProducts';
import RecentlyViewedProducts from '../components/product/RecentlyViewedProducts';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then((data) => {
        setProduct(data);
        recordView(data._id);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 text-sm py-20">Loading...</p>;
  if (error) return <p className="text-center text-red-600 text-sm py-20">{error}</p>;
  if (!product) return null;

  const hasVariants = product.variants?.length > 0;
  const price = selectedVariant?.price || product.price;
  const stock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const canAddToCart = !hasVariants || Boolean(selectedVariant);
  const inStock = stock > 0;

  function handleAddToCart() {
    const variantLabel = selectedVariant
      ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(' / ')
      : '';
    addToCart({
      productId: product._id,
      variantSku: selectedVariant?.sku || '',
      variantLabel,
      name: product.name,
      image: selectedVariant?.image || product.media?.[0]?.url,
      price,
      quantity,
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  }

  return (
    <>
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
      <ProductGallery media={selectedVariant?.image ? [{ url: selectedVariant.image, type: 'image', altText: product.name }, ...product.media] : product.media} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

        <div className="flex items-center gap-3 mt-3">
          <span className="text-2xl font-semibold text-gray-900">₹{price}</span>
          {product.compareAtPrice > price && (
            <span className="text-lg text-gray-400 line-through">₹{product.compareAtPrice}</span>
          )}
        </div>

        {hasVariants && (
          <div className="mt-6">
            <VariantSelector variants={product.variants} onChange={setSelectedVariant} />
            <button onClick={() => setShowSizeChart(true)} className="mt-3 text-sm text-gray-600 underline flex items-center gap-1">
              <HugeiconsIcon icon={RulerIcon} size={16} strokeWidth={1.5} />
              Size Chart
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600">−</button>
            <span className="px-3 text-sm">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-gray-600">+</button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || !inStock}
            className="flex-1 bg-gray-900 text-white font-semibold py-3 rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!inStock ? 'Out of Stock' : !canAddToCart ? 'Select Options' : addedMessage ? 'Added!' : 'Add to Cart'}
          </button>

          <button
            onClick={() => toggle(product._id)}
            aria-label="Toggle wishlist"
            className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md"
          >
            <HugeiconsIcon
              icon={HeartIcon}
              size={20}
              strokeWidth={1.5}
              className={isWishlisted(product._id) ? 'text-red-500' : 'text-gray-500'}
              fill={isWishlisted(product._id) ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <PincodeChecker />
        </div>

        {product.description && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-2 text-gray-500 w-1/3">{key}</td>
                    <td className="py-2 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSizeChart && <SizeChartModal onClose={() => setShowSizeChart(false)} />}
    </div>

    <RelatedProducts categoryId={product.category?._id} excludeProductId={product._id} />
    <RecentlyViewedProducts excludeProductId={product._id} />
    </>
  );
}
