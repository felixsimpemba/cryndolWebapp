import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ className, children, hover = false, gradient = false, ...props }) => {
  return (
    <div
      className={cn(
        'glass rounded-xl p-6',
        'transition-all duration-300',
        hover && 'hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-[1.02] hover:shadow-md dark:hover:shadow-glow cursor-pointer',
        gradient && 'bg-gradient-to-br from-primary-900/10 to-secondary-900/10 dark:from-primary-900/20 dark:to-secondary-900/20',
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
    <h3 className={cn('text-xl font-bold text-slate-900 dark:text-slate-100', className)} {...props}>
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
