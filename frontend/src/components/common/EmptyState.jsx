import React from 'react';
import { Ghost, PackageSearch } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon = Ghost, 
  title = "Nothing to see here yet", 
  message = "Check back later or try a different filter.",
  action,
  className
}) => (
  <div className={`p-12 glass-card flex flex-col items-center justify-center text-center gap-4 ${className}`}>
    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
      <Icon size={32} />
    </div>
    <div className="space-y-1">
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-gray-400 max-w-sm mx-auto">{message}</p>
    </div>
    {action && (
      <div className="mt-2">
        {action}
      </div>
    )}
  </div>
);

export default EmptyState;
