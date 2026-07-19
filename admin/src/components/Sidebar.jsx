import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/categories', label: 'Categories' },
  { to: '/customers', label: 'Customers' },
  { to: '/coupons', label: 'Coupons' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/returns', label: 'Returns' },
  { to: '/payments', label: 'Payments' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-gray-200 min-h-screen p-4">
      <p className="text-xl font-bold text-white mb-6 px-2">Piaarya Admin</p>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${
                isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
