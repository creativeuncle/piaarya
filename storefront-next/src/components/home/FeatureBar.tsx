import { HugeiconsIcon } from '@hugeicons/react';
import { GlobeIcon, HeadsetIcon, CreditCardIcon, Chatting01Icon } from '@hugeicons/core-free-icons';

const FEATURES = [
  {
    icon: GlobeIcon,
    title: 'Free Shipping',
    description: 'Free worldwide shipping and returns - customs and duties taxes included',
  },
  {
    icon: HeadsetIcon,
    title: 'Customer Service',
    description: 'We are available from monday to friday to answer your questions.',
  },
  {
    icon: CreditCardIcon,
    title: 'Secure Payment',
    description: 'Your payment information is processed securely.',
  },
  {
    icon: Chatting01Icon,
    title: 'Contact Us',
    description: 'Need to contact us? Just send us an e-mail at info@piaarya.com',
  },
];

export default function FeatureBar() {
  return (
    <section className="bg-yellow-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center">
            <HugeiconsIcon icon={feature.icon} size={28} strokeWidth={1.5} className="text-gray-900 mb-3" />
            <p className="text-xs font-bold uppercase tracking-wide text-gray-900">{feature.title}</p>
            <p className="text-xs text-gray-800 mt-2 max-w-[220px]">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
