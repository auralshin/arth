import React from 'react';

export const Button: React.FC<{
  kind?: 'primary' | 'ghost' | 'outline';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}> = ({ kind = 'primary', onClick, className = '', children, disabled = false, type = 'button' }) => {
  const base =
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition shadow-sm appearance-none select-none focus:outline-none focus:ring-2 ring-emerald-400/40';
  const styles =
    kind === 'primary'
      ? 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 hover:-translate-y-0.5 active:translate-y-0'
      : kind === 'outline'
      ? 'border border-white/15 text-neon-accent hover:bg-white/5 hover:border-[rgba(0,255,122,0.12)]'
      : 'text-neon-accent hover:text-white';
  const state = disabled ? 'opacity-50 pointer-events-none' : '';
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${state} ${className}`}>
      {children}
    </button>
  );
};
