import HeroSlider from './HeroSlider';
import ExploreProducts from './ExploreProducts';
import CategoriesSlider from './CategoriesSlider';
import TrendingProducts from './TrendingProducts';
import VideoSection from './VideoSection';
import ReviewsSection from './ReviewsSection';
import FeatureBar from './FeatureBar';
import ImageWithText from './ImageWithText';
import CollapsibleContent from './CollapsibleContent';
import EmailSubscriber from './EmailSubscriber';
import ContactForm from './ContactForm';

// Maps a PageLayout section's `type` to the component that renders it.
// Each component ignores any settings keys it doesn't understand, so
// Phase 1 sections (hero_slider, explore_products, feature_bar,
// video_section) can be given an empty settings object here and still
// render exactly as before.
export const SECTION_REGISTRY = {
  hero_slider: HeroSlider,
  explore_products: ExploreProducts,
  categories_slider: CategoriesSlider,
  trending_products: TrendingProducts,
  video_section: VideoSection,
  reviews: ReviewsSection,
  feature_bar: FeatureBar,
  image_with_text: ImageWithText,
  collapsible_content: CollapsibleContent,
  email_subscriber: EmailSubscriber,
  contact_form: ContactForm,
} as const;

export type SectionType = keyof typeof SECTION_REGISTRY;
