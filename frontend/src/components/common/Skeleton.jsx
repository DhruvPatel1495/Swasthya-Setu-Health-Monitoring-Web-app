import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-dark-border/50 rounded ${className}`}></div>
  );
};

export const CardSkeleton = () => (
  <div className="glass-card p-6 min-h-[150px] flex flex-col gap-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="mt-auto flex gap-2">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 h-[300px] flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="flex-1 flex items-end gap-2 px-2">
      {[...Array(12)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="w-full" 
          style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} 
        />
      ))}
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-card overflow-hidden">
    <div className="p-4 border-b border-dark-border flex gap-4">
       {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-24" />)}
    </div>
    <div className="divide-y divide-dark-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
