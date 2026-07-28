import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, Search01Icon, UserIcon, ShoppingBag01Icon, DashboardSquare01Icon, Logout01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { fetchNavigation } from '../api/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchOverlay from './SearchOverlay';
import MobileMenu from './MobileMenu';

const DEFAULT_MENUS = [
  { label: 'Shop by Category', route: '/products', children: [] },
  { label: 'Collections', route: '/collections', children: [] },
  { label: 'Blog', route: '/blog', children: [] },
];

export default function Header() {
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [openMenu, setOpenMenu] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count, openDrawer } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    setAccountMenuOpen(false);
    logout();
    navigate('/');
  }

  useEffect(() => {
    fetchNavigation()
      .then((tree) => {
        if (tree.length) setMenus(tree);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.5} />
          </button>
          <button onClick={() => setSearchOpen(true)} aria-label="Open search">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} />
          </button>
        </div>

        <Link to="/" className="text-xl font-black tracking-tight md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0">
          PIAARYA
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {menus.map((menu) => {
            const isMega = menu.children?.some((c) => c.children?.length > 0);
            return (
              <div
                key={menu.label}
                className="relative h-16 flex items-center"
                onMouseEnter={() => setOpenMenu(menu.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  to={menu.route || '#'}
                  className={`text-sm text-gray-200 hover:text-white ${openMenu === menu.label ? 'text-white underline underline-offset-8' : ''}`}
                >
                  {menu.label}
                </Link>
                {menu.children?.length > 0 && openMenu === menu.label && isMega && (
                  <div className="fixed left-0 right-0 top-16 bg-white text-gray-900 shadow-lg z-20">
                    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-8">
                      {menu.children.map((column) => (
                        <div key={column.label}>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-3">{column.label}</p>
                          <div className="space-y-2">
                            {(column.children || []).map((item) => (
                              <Link
                                key={item.route}
                                to={item.route}
                                className="block text-sm text-gray-600 hover:text-gray-900"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {menu.children?.length > 0 && openMenu === menu.label && !isMega && (
                  <div className="absolute top-full left-0 mt-2 bg-white text-gray-900 rounded-md shadow-lg py-2 min-w-[180px] z-20">
                    {menu.children.map((child) => (
                      <Link
                        key={child.route}
                        to={child.route}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <HugeiconsIcon icon={Mail01Icon} size={20} strokeWidth={1.5} className="cursor-pointer hidden md:block" />
          <button onClick={() => setSearchOpen(true)} aria-label="Open search" className="hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} className="cursor-pointer" />
          </button>
          {isAuthenticated ? (
            <div
              className="relative"
              onMouseEnter={() => setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              <Link to="/dashboard/profile" aria-label="Account" className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 cursor-pointer">
                <HugeiconsIcon icon={UserIcon} size={18} strokeWidth={1.5} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-gray-900" />
              </Link>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-md shadow-lg py-2 min-w-[160px] z-20">
                  <Link to="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    <HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50"
                  >
                    <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.5} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" aria-label="Account">
              <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} className="cursor-pointer" />
            </Link>
          )}
          <button onClick={openDrawer} className="relative cursor-pointer" aria-label="Open cart">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={20} strokeWidth={1.5} />
            <span className="absolute -top-2 -right-2 bg-white text-gray-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          </button>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} menus={menus} />
    </header>
  );
}
