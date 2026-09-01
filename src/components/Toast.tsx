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
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-up">
      <div 
        id="toast-notification-card"
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
          type === 'error'
            ? 'bg-rose-50/95 border-rose-200 text-rose-900'
            : type === 'success'
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
            : 'bg-stone-900/95 border-stone-800 text-stone-100'
        }`}
      >
        {type === 'error' ? (
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : null}

        <div className="flex-1 text-sm font-medium leading-snug">
          <p>{message}</p>
          {subText && (
            <p className={`text-xs mt-0.5 font-normal ${type === 'success' ? 'text-emerald-800' : 'text-stone-300'}`}>
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
                    ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                    : 'bg-white text-stone-900 hover:bg-stone-100'
                }`}
              >
                {actionLabel}
              </button>
            )}

            {onRetry && (
              <button
                id="toast-retry-btn"
                onClick={onRetry}
                className="text-xs font-semibold underline hover:opacity-80 transition-opacity"
              >
                Retry Operation
              </button>
            )}
          </div>
        </div>

        <button
          id="toast-close-btn"
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 p-0.5 rounded-md hover:bg-stone-200/50 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

