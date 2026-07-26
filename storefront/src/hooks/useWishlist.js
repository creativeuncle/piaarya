import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlist';

const STORAGE_KEY = 'piaarya_wishlist';

function loadLocalWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const { isAuthenticated, token } = useAuth();
  const [productIds, setProductIds] = useState(loadLocalWishlist);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMyWishlist(token)
      .then((entries) => setProductIds(entries.map((entry) => entry.product?._id || entry.product)))
      .catch(() => {});
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  }, [productIds, isAuthenticated]);

  function isWishlisted(productId) {
    return productIds.includes(productId);
  }

  async function toggle(productId) {
    const alreadyWishlisted = productIds.includes(productId);
    setProductIds((prev) => (alreadyWishlisted ? prev.filter((id) => id !== productId) : [...prev, productId]));

    if (!isAuthenticated) return;
    try {
      if (alreadyWishlisted) await apiRemoveFromWishlist(token, productId);
      else await apiAddToWishlist(token, productId);
    } catch {
      setProductIds((prev) => (alreadyWishlisted ? [...prev, productId] : prev.filter((id) => id !== productId)));
    }
  }

  return { productIds, isWishlisted, toggle };
}
