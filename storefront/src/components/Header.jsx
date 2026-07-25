import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, Search01Icon, UserIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { fetchNavigation } from '../api/navigation';
import { useCart } from '../context/CartContext';

const DEFAULT_MENUS = [
  { label: 'Shop by Category', route: '/products', children: [] },
  { label: 'Collections', route: '/collections', children: [] },
  { label: 'Blog', route: '/blog', children: [] },
];

export default function Header() {
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [openMenu, setOpenMenu] = useState(null);
  const { count, openDrawer } = useCart();

  useEffect(() => {
    fetchNavigation()
      .then((tree) => {
        if (tree.length) setMenus(tree);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-black tracking-tight">
          PIAARYA
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {menus.map((menu) => (
            <div
              key={menu.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(menu.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link to={menu.route || '#'} className="text-sm text-gray-200 hover:text-white">
                {menu.label}
              </Link>
              {menu.children?.length > 0 && openMenu === menu.label && (
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
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <HugeiconsIcon icon={Mail01Icon} size={20} strokeWidth={1.5} className="cursor-pointer" />
          <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} className="cursor-pointer" />
          <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} className="cursor-pointer" />
          <button onClick={openDrawer} className="relative cursor-pointer" aria-label="Open cart">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={20} strokeWidth={1.5} />
            <span className="absolute -top-2 -right-2 bg-white text-gray-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
