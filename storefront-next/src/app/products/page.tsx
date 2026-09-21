import { Suspense } from 'react';
import ProductListingClient from './ProductListingClient';

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductListingClient />
    </Suspense>
  );
}
