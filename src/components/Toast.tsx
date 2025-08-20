import React from 'react';
import { useToast } from '../hooks/useToast';

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col items-end p-4 gap-2 z-50">
      {toasts.map(t => (
        <div
          key={t.id}
          className={classNames(
            'pointer-events-auto w-full max-w-sm rounded-md border p-4 shadow bg-white',
            t.type === 'success' && 'border-green-300',
            t.type === 'error' && 'border-red-300',
            t.type === 'info' && 'border-blue-300'
          )}
          role="alert"
        >
          <div className="flex items-start">
            <div className="ml-0 flex-1">
              {t.title && <p className="text-sm font-medium text-gray-900">{t.title}</p>}
              <p className="mt-1 text-sm text-gray-700">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

