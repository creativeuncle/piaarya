'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  FavouriteIcon,
  UserIcon,
  ShoppingBag01Icon,
  Menu01Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { fetchNavigation } from '../../lib/api/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchOverlay from '../../components/SearchOverlay';
import { DISPLAY_FONT } from './styles';

const DEFAULT_MENUS = [
  { label: 'Shop', route: '/products', children: [] },
  { label: 'Collections', route: '/#collection', children: [] },
];

export default function Header() {
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, openDrawer } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchNavigation()
      .then((tree) => {
        if (tree.length) setMenus(tree);
      })
      .catch(() => {});
  }, []);

  function handleLogout() {
    setAccountMenuOpen(false);
    logout();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#646c5f]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className={`${DISPLAY_FONT} text-2xl font-semibold tracking-wide text-white`}>
          Stretch
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {menus.map((menu) => (
            <Link
              key={menu.label}
              href={menu.route || '#'}
              className="text-[13px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:text-white/60"
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="text-white transition-colors hover:text-white/60">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} />
          </button>
          <Link href="/dashboard/wishlist" aria-label="Wishlist" className="text-white transition-colors hover:text-white/60">
            <HugeiconsIcon icon={FavouriteIcon} size={20} strokeWidth={1.5} />
          </Link>
          {isAuthenticated ? (
            <div className="relative" onMouseEnter={() => setAccountMenuOpen(true)} onMouseLeave={() => setAccountMenuOpen(false)}>
              <Link href="/dashboard/profile" aria-label="Account" className="text-white transition-colors hover:text-white/60">
                <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} />
              </Link>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-md shadow-lg py-2 min-w-[160px] z-20">
                  <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    <HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50">
                    <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.5} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" aria-label="Account" className="text-white transition-colors hover:text-white/60">
              <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} />
            </Link>
          )}
          <button type="button" aria-label="Cart" onClick={openDrawer} className="relative text-white transition-colors hover:text-white/60">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#41473d] text-[10px] font-semibold text-white ring-1 ring-white/40">
                {count}
              </span>
            )}
          </button>
        </div>

        <button type="button" className="text-white md:hidden" aria-label="Toggle menu" onClick={() => setMobileOpen((o) => !o)}>
          <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : Menu01Icon} size={24} strokeWidth={1.5} />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#646c5f] px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {menus.map((menu) => (
              <Link
                key={menu.label}
                href={menu.route || '#'}
                className="text-sm font-medium uppercase tracking-[0.18em] text-white"
                onClick={() => setMobileOpen(false)}
              >
                {menu.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex items-center gap-6 border-t border-white/10 pt-5 text-white">
            <button type="button" aria-label="Search" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>
              <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} />
            </button>
            <Link href="/dashboard/wishlist" aria-label="Wishlist" onClick={() => setMobileOpen(false)}>
              <HugeiconsIcon icon={FavouriteIcon} size={20} strokeWidth={1.5} />
            </Link>
            <Link href={isAuthenticated ? '/dashboard/profile' : '/login'} aria-label="Account" onClick={() => setMobileOpen(false)}>
              <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={() => { setMobileOpen(false); openDrawer(); }}
              className="relative"
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#41473d] text-[10px] font-semibold text-white ring-1 ring-white/40">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
