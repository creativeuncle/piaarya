import Link from 'next/link';
import { DISPLAY_FONT } from './styles';

const COLUMNS = [
  { title: 'Shop', links: [{ label: 'All Products', href: '/products' }, { label: 'Best Sellers', href: '/products?sort=bestseller' }, { label: 'New In', href: '/products?sort=new' }] },
  { title: 'Support', links: [{ label: 'Contact Us', href: '/pages/contact-us' }, { label: 'Shipping & Returns', href: '/pages/refund-and-cancellation-policy' }, { label: 'Track Order', href: '/dashboard/orders' }] },
  { title: 'Company', links: [{ label: 'About Us', href: '/pages/about-us' }, { label: 'Our Story', href: '/pages/about-us' }] },
];

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', href: '/pages/terms-and-conditions' },
  { label: 'Privacy Policy', href: '/pages/privacy-policy' },
  { label: 'Refund & Cancellation Policy', href: '/pages/refund-and-cancellation-policy' },
];

export default function Footer() {
  return (
    <footer className="bg-[#F7EFDD] py-14 text-[#3A2E1D]/80">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <p className={`${DISPLAY_FONT} text-2xl text-[#3A2E1D]`}>Stretch</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#3A2E1D]/60">
              Considered clothing in durable, natural fabrics — built for everyday movement.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3A2E1D]">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[#3A2E1D]/60 transition-colors hover:text-[#3A2E1D]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-[#3A2E1D]/10 pt-6 text-xs text-[#3A2E1D]/50">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#3A2E1D]">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-2 sm:w-full sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Stretch. All rights reserved.</p>
            <p>Designed for everyday wear.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
