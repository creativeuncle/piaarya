import HeroSlider from '../components/home/HeroSlider';
import ExploreProducts from '../components/home/ExploreProducts';
import CategoriesSlider from '../components/home/CategoriesSlider';
import TrendingProducts from '../components/home/TrendingProducts';
import VideoSection from '../components/home/VideoSection';
import ReviewsSection from '../components/home/ReviewsSection';
import FeatureBar from '../components/home/FeatureBar';

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
