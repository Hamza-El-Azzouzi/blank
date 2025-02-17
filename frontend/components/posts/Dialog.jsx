'use client';

import { useEffect, useRef } from 'react';
import { FiX } from "react-icons/fi";
import './dialog.css'

export function Dialog({ open, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={() => onClose()}>
      <div className="dialog-content" onClick={e => e.stopPropagation()} ref={dialogRef}>
        <button className="dialog-close" onClick={onClose}>
          <FiX size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ children }) {
  return <h2 className="dialog-title">{children}</h2>;
}

export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={`custom-button ${variant}`} {...props}>
      {children}
    </button>
  );
}

export function Checkbox({ checked, onChange }) {
  return (
    <div 
      className={`custom-checkbox ${checked ? 'checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}