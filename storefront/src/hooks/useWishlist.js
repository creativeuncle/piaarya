import { useEffect, useState } from 'react';

const STORAGE_KEY = 'piaarya_wishlist';

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [productIds, setProductIds] = useState(loadWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  }, [productIds]);

  function isWishlisted(productId) {
    return productIds.includes(productId);
  }

  function toggle(productId) {
    setProductIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }

  return { productIds, isWishlisted, toggle };
}
