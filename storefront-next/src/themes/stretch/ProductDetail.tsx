'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { HeartIcon, RulerIcon, ArrowLeft02Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { fetchProduct } from '../../lib/api/products';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../hooks/useWishlist';
import { recordView } from '../../hooks/useRecentlyViewed';
import ProductGallery from './product/ProductGallery';
import VariantSelector from './product/VariantSelector';
import SizeChartModal from '../supercharged/product/SizeChartModal';
import PincodeChecker from '../supercharged/product/PincodeChecker';
import RelatedProducts from './product/RelatedProducts';
import RecentlyViewedProducts from './product/RecentlyViewedProducts';
import ProductReviews from './product/ProductReviews';
import Accordion from './product/Accordion';
import { DISPLAY_FONT, EYEBROW } from './styles';
import type { Product, ProductVariant } from '../../types';

export default function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
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

  useEffect(() => {
    document.title = product ? `${product.seoTitle || product.name} | Piaarya` : 'Piaarya';
    return () => {
      document.title = 'Piaarya';
    };
  }, [product]);

  if (loading) return <p className="text-center text-white/50 text-sm py-20 bg-[#41473d]">Loading...</p>;
  if (error) return <p className="text-center text-red-300 text-sm py-20 bg-[#41473d]">{error}</p>;
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
      <section className="bg-[#41473d] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
            Back to Shop
          </Link>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14 items-start">
            <div className="md:sticky md:top-24">
              <ProductGallery
                media={
                  selectedVariant?.image
                    ? [{ url: selectedVariant.image, type: 'image', altText: product.name }, ...(product.media || [])]
                    : product.media
                }
              />
            </div>

            <div>
              <p className={EYEBROW}>{product.category?.name || 'Stretch'}</p>
              <h1 className={`${DISPLAY_FONT} mt-2 text-3xl text-white md:text-4xl`}>{product.name}</h1>

              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-medium text-white">{formatPrice(price)}</span>
                {product.compareAtPrice > price && (
                  <span className="text-lg text-white/40 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>

              <hr className="my-6 border-white/15" />

              {hasVariants && (
                <div className="mb-6">
                  <VariantSelector variants={product.variants} onChange={setSelectedVariant} />
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="mt-3 text-sm text-white/70 underline flex items-center gap-1 hover:text-white"
                  >
                    <HugeiconsIcon icon={RulerIcon} size={16} />
                    Size Chart
                  </button>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Quantity</p>
                <div className="mt-3 inline-flex items-center gap-4 rounded-full border-2 border-white/30 px-4 py-2">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="text-white">
                    −
                  </button>
                  <span className="w-4 text-center text-sm text-white">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="text-white">
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || !inStock}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-white py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed sm:flex-initial sm:px-10"
                >
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
                  {!inStock ? 'Out of Stock' : !canAddToCart ? 'Select Options' : addedMessage ? 'Added!' : 'Add to Cart'}
                </button>

                <button
                  onClick={() => toggle(product._id)}
                  aria-label="Toggle wishlist"
                  className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-white/30"
                >
                  <HugeiconsIcon
                    icon={HeartIcon}
                    size={20}
                    className={isWishlisted(product._id) ? 'text-white' : 'text-white/50'}
                    fill={isWishlisted(product._id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              <p className="mt-4 text-xs text-white/50">
                {inStock ? 'In stock, ready to ship in 1–2 business days.' : 'Currently out of stock.'}
              </p>

              <div className="mt-8 border-t border-white/15 pt-6">
                <PincodeChecker />
              </div>

              <div className="mt-2">
                {product.description && (
                  <Accordion title="Description" defaultOpen>
                    <p className="whitespace-pre-line">{product.description}</p>
                  </Accordion>
                )}

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <Accordion title="Specifications">
                    <dl className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <dt className="text-white/50">{key}</dt>
                          <dd className="text-white">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Accordion>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showSizeChart && <SizeChartModal onClose={() => setShowSizeChart(false)} />}

      <ProductReviews productId={product._id} />
      <RelatedProducts categoryId={product.category?._id} excludeProductId={product._id} />
      <RecentlyViewedProducts excludeProductId={product._id} />
    </>
  );
}
