export default function Container({ children, className = '', fullHeight = false }) {
  const baseClasses = 'w-full max-w-5xl mx-auto px-4 sm:px-6';
  
  const heightClasses = fullHeight 
    ? 'h-full max-h-full overflow-hidden' 
    : '';

  return (
    <div className={`${baseClasses} ${heightClasses} ${className}`}>
      {children}
    </div>
  );
}
