import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground/70 ml-1">{label}</label>}
      <input
        className={`w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-foreground 
                   focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50
                   placeholder:text-muted-foreground/50 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger ml-1">{error}</p>}
    </div>
  );
};
