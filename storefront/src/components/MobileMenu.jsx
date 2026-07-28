import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Add01Icon, RemoveCircleIcon, UserIcon } from '@hugeicons/core-free-icons';

function AccordionSection({ menu, onClose }) {
  const [open, setOpen] = useState(false);
  const hasChildren = menu.children?.length > 0;

  if (!hasChildren) {
    return (
      <Link
        to={menu.route || '#'}
        onClick={onClose}
        className="block py-4 border-b border-gray-200 font-bold text-sm tracking-wide uppercase"
      >
        {menu.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 font-bold text-sm tracking-wide uppercase text-left"
      >
        {menu.label}
        <HugeiconsIcon icon={open ? RemoveCircleIcon : Add01Icon} size={18} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="pb-3 pl-2 space-y-1">
          {menu.children.map((child) => (
            <SubSection key={child.label} item={child} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubSection({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children?.length > 0;

  if (!hasChildren) {
    return (
      <Link to={item.route || '#'} onClick={onClose} className="block py-2 text-sm text-gray-700">
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-900 text-left"
      >
        {item.label}
        <HugeiconsIcon icon={open ? RemoveCircleIcon : Add01Icon} size={16} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="pl-3 pb-1 space-y-1">
          {item.children.map((leaf) => (
            <Link key={leaf.route} to={leaf.route || '#'} onClick={onClose} className="block py-1.5 text-sm text-gray-600">
              {leaf.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileMenu({ open, onClose, menus }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white text-gray-900 z-50 flex flex-col">
        <div className="flex items-center justify-end px-4 py-4 border-b border-gray-200">
          <button onClick={onClose} aria-label="Close menu">
            <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {menus.map((menu) => (
            <AccordionSection key={menu.label} menu={menu} onClose={onClose} />
          ))}
        </div>
        <div className="border-t border-gray-200 px-5 py-4">
          <Link to="/dashboard/profile" onClick={onClose} className="flex items-center gap-2 text-sm font-medium">
            <HugeiconsIcon icon={UserIcon} size={18} strokeWidth={1.5} />
            Account
          </Link>
        </div>
      </div>
    </>
  );
}
