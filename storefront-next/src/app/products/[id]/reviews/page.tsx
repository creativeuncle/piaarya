import { getActiveTheme } from '../../../../lib/theme';
import { getTheme } from '../../../../themes';

export default async function ProductReviewsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const themeKey = await getActiveTheme();
  const { ProductReviewsPage } = getTheme(themeKey);
  return <ProductReviewsPage id={id} />;
}
