'use client';

export default function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) {
  const baseStyles = 'font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-yellow-400',
    accent: 'bg-black text-white hover:bg-gray-800 dark:bg-black dark:text-white dark:hover:bg-gray-800 disabled:bg-gray-600',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50',
    outline: 'border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900 dark:hover:border-gray-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
    icon: 'p-2',
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
