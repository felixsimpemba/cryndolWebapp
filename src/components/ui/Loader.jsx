import React from 'react';
import { cn } from '../../utils/cn';

export const Loader = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-700 border-t-primary-500',
          sizes[size]
        )}
      ></div>
    </div>
  );
};

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('skeleton rounded-lg', className)}
      {...props}
    />
  );
};

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="xl" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
