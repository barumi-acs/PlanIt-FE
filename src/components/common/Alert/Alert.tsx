/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type { AlertOptions } from './types';

interface AlertProps extends AlertOptions {
  onClose: () => void;
}

const alertStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✓',
    iconBg: 'bg-green-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
    iconBg: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: '⚠',
    iconBg: 'bg-amber-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
    iconBg: 'bg-blue-500',
  },
};

export const Alert = ({ type, message, duration = 3000, onClose }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const style = alertStyles[type];

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 min-w-[320px] max-w-[480px] p-4 rounded-xl border shadow-lg
        ${style.bg} ${style.border}
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${style.iconBg} text-white flex items-center justify-center text-sm font-bold`}>
        {style.icon}
      </div>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium ${style.text} whitespace-pre-line`}>
        {message}
      </p>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
        aria-label="Close alert"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
