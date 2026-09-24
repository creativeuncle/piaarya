import HeroSlider from './home/HeroSlider';
import ExploreProducts from './home/ExploreProducts';
import CategoriesSlider from './home/CategoriesSlider';
import TrendingProducts from './home/TrendingProducts';
import VideoSection from './home/VideoSection';
import ReviewsSection from './home/ReviewsSection';
import FeatureBar from './home/FeatureBar';

export default function Home() {
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
