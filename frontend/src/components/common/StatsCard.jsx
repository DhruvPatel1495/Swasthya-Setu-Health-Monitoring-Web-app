import React from 'react';
import { Card } from './Card';

export const StatsCard = ({ title, value, icon: Icon, trend, color = "primary" }) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10 border-primary/20",
    accent: "text-accent bg-accent/10 border-accent/20",
    success: "text-green-500 bg-green-500/10 border-green-500/20",
    warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    danger: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  const selectedColor = colorClasses[color] || colorClasses.primary;

  return (
    <Card className="flex items-center gap-4 p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <div className={`p-4 rounded-2xl ${selectedColor} border shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
          {trend && (
            <span className={`text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 blur-2xl ${selectedColor.split(' ')[1]}`}></div>
    </Card>
  );
};
