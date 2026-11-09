import { HugeiconsIcon } from '@hugeicons/react';
import { CustomerService01Icon, DeliveryTruck01Icon, SecurityLockIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import { MID_BG, DISPLAY_FONT } from '../styles';

const FEATURES = [
  { icon: CustomerService01Icon, title: 'Customer Service', detail: "We're here Mon–Fri, 9am–6pm to help with sizing, orders, and care." },
  { icon: DeliveryTruck01Icon, title: 'Free Shipping', detail: 'Complimentary shipping on all orders over ₹2,500, delivered in 3–5 days.' },
  { icon: SecurityLockIcon, title: 'Secure Payment', detail: 'Checkout safely with encrypted payments and buyer protection.' },
  { icon: Mail01Icon, title: 'Contact Us', detail: 'Questions about a piece? Reach out anytime — we reply fast.' },
];

export default function FeatureBar() {
  return (
    <section className={`${MID_BG} py-16`}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon, title, detail }) => (
            <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white">
                <HugeiconsIcon icon={icon} size={22} strokeWidth={1.5} />
              </span>
              <h3 className={`${DISPLAY_FONT} mt-4 text-lg text-white`}>{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/70">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
