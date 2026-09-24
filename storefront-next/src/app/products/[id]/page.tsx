import { getActiveTheme } from '../../../lib/theme';
import { getTheme } from '../../../themes';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const themeKey = await getActiveTheme();
  const { ProductDetail } = getTheme(themeKey);
  return <ProductDetail id={id} />;
}
