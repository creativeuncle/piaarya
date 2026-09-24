import { getActiveTheme } from '../lib/theme';
import { getTheme } from '../themes';

export default async function HomePage() {
  const themeKey = await getActiveTheme();
  const { Home } = getTheme(themeKey);
  return <Home />;
}
