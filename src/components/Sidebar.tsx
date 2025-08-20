import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'settings', label: 'Settings', icon: '⚙️' }
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const active = (router.query.tab as string) || 'chat';

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white/90 backdrop-blur border-r shadow-lg transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button className="text-gray-500" onClick={onClose} aria-label="Close sidebar">✕</button>
      </div>
      <div className="p-4 border-b hidden md:block">
        <div className="text-xl font-bold">Chat Dashboard</div>
        <div className="text-xs text-gray-500">n8n Webhook</div>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map(item => {
          const selected = active === item.key;
          return (
            <Link key={item.key} href={{ pathname: '/dashboard', query: { tab: item.key } }} legacyBehavior>
              <a className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${selected ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={onClose}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

