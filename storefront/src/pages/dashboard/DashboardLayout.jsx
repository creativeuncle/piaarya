import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon, ShoppingBag01Icon, Location01Icon, ReturnRequestIcon, HeartIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard/profile', label: 'Profile', icon: UserIcon },
  { to: '/dashboard/orders', label: 'Your Orders', icon: ShoppingBag01Icon },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: HeartIcon },
  { to: '/dashboard/address', label: 'Your Address', icon: Location01Icon },
  { to: '/dashboard/requests', label: 'Requests', icon: ReturnRequestIcon },
];

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login?redirect=/dashboard" replace />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
      <aside className="md:col-span-1">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:col-span-3">
        <Outlet />
      </div>
    </div>
  );
}
