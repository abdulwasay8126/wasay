import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { key: 'home', label: 'Home' },
  { key: 'chat', label: 'Chat' },
  { key: 'settings', label: 'Settings' }
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const active = (router.query.tab as string) || 'chat';

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r shadow-lg transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button className="text-gray-500" onClick={onClose} aria-label="Close sidebar">✕</button>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map(item => {
          const selected = active === item.key;
          return (
            <Link key={item.key} href={{ pathname: '/dashboard', query: { tab: item.key } }} legacyBehavior>
              <a className={`block rounded px-3 py-2 text-sm font-medium ${selected ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={onClose}>
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

