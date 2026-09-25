import { Suspense } from 'react';
import { getActiveTheme } from '../../lib/theme';
import { getTheme } from '../../themes';

export default async function ProductsPage() {
  const themeKey = await getActiveTheme();
  const { ProductListing } = getTheme(themeKey);
  return (
    <Suspense fallback={null}>
      <ProductListing />
    </Suspense>
  );
}
