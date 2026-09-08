import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  subText?: string;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  onRetry,
  actionLabel,
  onAction,
  subText,
}) => {
  React.useEffect(() => {
    if (!message) return;
    if (type !== 'error') {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, type, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto animate-slide-up">
      <div 
        id="toast-notification-card"
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
          type === 'error'
            ? 'bg-rose-50/95 border-rose-200 text-rose-900'
            : type === 'success'
            ? 'bg-[#F2F7F4] border-[#C8E0D2] text-[#1C3829]'
            : 'bg-stone-900/95 border-stone-800 text-stone-100'
        }`}
      >
        {type === 'error' ? (
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-[#3B7A57] shrink-0 mt-0.5" />
        ) : null}

        <div className="flex-1 text-sm font-medium leading-snug">
          <p>{message}</p>
          {subText && (
            <p className={`text-xs mt-0.5 font-normal ${type === 'success' ? 'text-[#2D5A40]' : 'text-stone-300'}`}>
              {subText}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {actionLabel && onAction && (
              <button
                id="toast-action-btn"
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-2xs ${
                  type === 'success'
                    ? 'bg-accent-sage text-white hover:opacity-90'
                    : 'bg-surface text-text-primary hover:bg-canvas border border-border-hairline'
                }`}
              >
                {actionLabel}
              </button>
            )}

            {type === 'error' && onRetry && (
              <button
                id="toast-retry-btn"
                onClick={onRetry}
                className="text-xs font-semibold underline hover:opacity-80 transition-opacity cursor-pointer text-rose-700 dark:text-rose-300"
              >
                Retry Operation
              </button>
            )}
          </div>
        </div>

        <button
          id="toast-close-btn"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-0.5 rounded-md hover:bg-canvas/50 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

