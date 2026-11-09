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

// Same section "type" vocabulary as Supercharged (shared across themes via
// PageLayout) — only the rendered component differs, so a store's saved
// Home layout carries over unchanged when it switches theme.
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
