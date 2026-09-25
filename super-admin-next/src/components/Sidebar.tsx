'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, Store02Icon, Logout01Icon } from '@hugeicons/core-free-icons';
import { usePlatformAuth } from '../context/PlatformAuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home01Icon },
  { to: '/stores', label: 'Stores', icon: Store02Icon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = usePlatformAuth();

  function isActive(to) {
    return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
  }

  return (
    <aside className="shrink-0 w-60 bg-gray-900 text-gray-200 min-h-screen p-3 flex flex-col">
      <div className="px-1 mb-6">
        <span className="text-base font-bold text-white">Piaarya Super Admin</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={`flex items-center gap-3 rounded-md text-sm px-3 py-2 ${
              isActive(item.to) ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} className="shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-gray-800">
        {admin && <div className="px-1 pb-2 text-xs text-gray-400 truncate">{admin.name}</div>}
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-md text-sm px-3 py-2 w-full hover:bg-gray-800"
        >
          <HugeiconsIcon icon={Logout01Icon} size={20} strokeWidth={1.5} className="shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
