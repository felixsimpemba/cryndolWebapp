import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ className, children, hover = false, gradient = false, ...props }) => {
  return (
    <div
      className={cn(
        'glass rounded-xl sm:rounded-2xl p-4 sm:p-6',
        'transition-all duration-150',
        hover && 'hover:bg-slate-50 dark:hover:bg-white/5 hover:shadow-md cursor-pointer',
        gradient && 'bg-slate-50/50 dark:bg-slate-800/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 className={cn('text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-100 dark:border-white/5', className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
