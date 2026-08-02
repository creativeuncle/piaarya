import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SidebarLeftIcon,
  Home01Icon,
  ShoppingCart01Icon,
  Package01Icon,
  WarehouseIcon,
  Grid2X2Icon,
  UserGroupIcon,
  Coupon01Icon,
  StarIcon,
  ReturnRequestIcon,
  CreditCardIcon,
  MarketingIcon,
  UserMultiple02Icon,
  HeartIcon,
  Settings01Icon,
  ArrowDown01Icon,
  MenuSquareIcon,
  Analytics01Icon,
  GiftCardIcon,
} from '@hugeicons/core-free-icons';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home01Icon },
  { to: '/analytics', label: 'Analytics', icon: Analytics01Icon },
  { to: '/orders', label: 'Orders', icon: ShoppingCart01Icon },
  { to: '/products', label: 'Products', icon: Package01Icon },
  { to: '/inventory', label: 'Inventory', icon: WarehouseIcon },
  { to: '/categories', label: 'Categories', icon: Grid2X2Icon },
  { to: '/customers', label: 'Customers', icon: UserGroupIcon },
  { to: '/coupons', label: 'Coupons', icon: Coupon01Icon },
  { to: '/gift-cards', label: 'Gift Cards', icon: GiftCardIcon },
  { to: '/reviews', label: 'Reviews', icon: StarIcon },
  { to: '/returns', label: 'Returns', icon: ReturnRequestIcon },
  { to: '/payments', label: 'Payments', icon: CreditCardIcon },
  { to: '/marketing', label: 'Marketing', icon: MarketingIcon },
  { to: '/wishlist', label: 'Wishlist', icon: HeartIcon },
  { to: '/team', label: 'Team', icon: UserMultiple02Icon },
  { to: '/apps', label: 'Apps', icon: MenuSquareIcon },
];

const SETTINGS_CHILDREN = [
  { to: '/settings/navigation', label: 'Navigation' },
  { to: '/settings/pages', label: 'Pages' },
  { to: '/settings/payments', label: 'Payments' },
  { to: '/settings/shipping', label: 'Shipping' },
  { to: '/settings/tax', label: 'Tax (GST)' },
  { to: '/settings/notifications', label: 'Notifications' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isSettingsRoute = SETTINGS_CHILDREN.some((c) => location.pathname.startsWith(c.to));
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  function handleSettingsClick() {
    if (!expanded) setExpanded(true);
    setSettingsOpen((v) => !v);
  }

  return (
    <aside
      className={`shrink-0 bg-gray-900 text-gray-200 min-h-screen p-3 transition-all duration-200 ${
        expanded ? 'w-60' : 'w-16'
      }`}
    >
      <div className={`flex items-center mb-6 ${expanded ? 'justify-between px-1' : 'justify-center'}`}>
        {expanded && <span className="text-base font-bold text-white truncate">Piaarya Admin</span>}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-md hover:bg-gray-800 text-gray-300"
          title={expanded ? 'Collapse menu' : 'Expand menu'}
        >
          <HugeiconsIcon icon={SidebarLeftIcon} size={20} strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={!expanded ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-md text-sm px-3 py-2 ${
                expanded ? '' : 'justify-center'
              } ${isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`
            }
          >
            <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span>{item.label}</span>}
            {!expanded && (
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

        <button
          onClick={handleSettingsClick}
          title={!expanded ? 'Settings' : undefined}
          className={`group relative flex items-center gap-3 rounded-md text-sm px-3 py-2 ${
            expanded ? '' : 'justify-center'
          } ${isSettingsRoute ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}
        >
          <HugeiconsIcon icon={Settings01Icon} size={20} strokeWidth={1.5} className="shrink-0" />
          {expanded && <span className="flex-1 text-left">Settings</span>}
          {expanded && (
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              strokeWidth={1.5}
              className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
            />
          )}
          {!expanded && (
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
              Settings
            </span>
          )}
        </button>

        {expanded && settingsOpen && (
          <div className="flex flex-col gap-1 pl-6">
            {SETTINGS_CHILDREN.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `rounded-md text-sm px-3 py-2 ${isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-300'}`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
