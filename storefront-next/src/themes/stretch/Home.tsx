import { getPageLayout } from '../../lib/pageLayout';
import { stretchDisplay, stretchSans } from './fonts';
import HomeSectionsClient from './home/HomeSectionsClient';
import HeroSlider from './home/HeroSlider';
import ImageWithText from './home/ImageWithText';
import ExploreProducts from './home/ExploreProducts';
import VideoSection from './home/VideoSection';
import CategoriesSlider from './home/CategoriesSlider';
import FeatureBar from './home/FeatureBar';
import EmailSubscriber from './home/EmailSubscriber';

export default async function Home() {
  const sections = await getPageLayout('home');

  // Layout fetch failed (no DB yet, backend unreachable) — render the
  // original fixed order so the storefront never breaks over this.
  if (sections.length === 0) {
    return (
      <div className={`${stretchDisplay.variable} ${stretchSans.variable}`} style={{ fontFamily: 'var(--font-stretch-sans)' }}>
        <HeroSlider />
        <ImageWithText />
        <ExploreProducts />
        <VideoSection />
        <CategoriesSlider />
        <FeatureBar />
        <EmailSubscriber />
      </div>
    );
  }

  return <HomeSectionsClient initialSections={sections} />;
}
