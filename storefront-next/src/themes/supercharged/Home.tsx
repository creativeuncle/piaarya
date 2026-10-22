import { getPageLayout } from '../../lib/pageLayout';
import HomeSectionsClient from './home/HomeSectionsClient';
import HeroSlider from './home/HeroSlider';
import ExploreProducts from './home/ExploreProducts';
import CategoriesSlider from './home/CategoriesSlider';
import TrendingProducts from './home/TrendingProducts';
import VideoSection from './home/VideoSection';
import ReviewsSection from './home/ReviewsSection';
import FeatureBar from './home/FeatureBar';

export default async function Home() {
  const sections = await getPageLayout('home');

  // Layout fetch failed (no DB yet, backend unreachable) — render the
  // original fixed order so the storefront never breaks over this.
  if (sections.length === 0) {
    return (
      <>
        <HeroSlider />
        <ExploreProducts />
        <CategoriesSlider />
        <TrendingProducts />
        <VideoSection />
        <ReviewsSection />
        <FeatureBar />
      </>
    );
  }

  return <HomeSectionsClient initialSections={sections} />;
}
