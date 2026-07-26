import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fetchMyWishlist, removeFromWishlist } from '../../api/wishlist';

export default function Wishlist() {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetchMyWishlist(token)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleRemove(productId) {
    await removeFromWishlist(token, productId);
    setEntries((prev) => prev.filter((entry) => entry.product?._id !== productId));
  }

  function handleAddToCart(product) {
    addToCart({
      productId: product._id,
      variantSku: '',
      variantLabel: '',
      name: product.name,
      image: product.media?.[0]?.url,
      price: product.price,
      quantity: 1,
    });
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Wishlist</h1>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && entries.length === 0 && (
        <p className="text-sm text-gray-500">
          You haven't added anything to your wishlist yet.{' '}
          <Link to="/products" className="underline text-gray-900">
            Browse products
          </Link>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => {
          const product = entry.product;
          if (!product) return null;
          return (
            <div key={entry._id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
              <Link to={`/products/${product._id}`} className="block w-full aspect-square bg-gray-100 overflow-hidden">
                {product.media?.[0]?.url && (
                  <img src={product.media[0].url} alt={product.name} className="w-full h-full object-cover" />
                )}
              </Link>

              <div className="p-4 flex-1 flex flex-col">
                <Link to={`/products/${product._id}`} className="text-sm font-medium text-gray-900 hover:underline">
                  {product.name}
                </Link>
                {product.category?.name && <p className="text-xs text-gray-500 mt-0.5">{product.category.name}</p>}
                <p className="text-sm text-gray-900 font-semibold mt-1">₹{product.price}</p>
              </div>

              <div className="p-4 pt-0 flex flex-col gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-gray-800"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  className="w-full border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-md hover:bg-gray-50"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
