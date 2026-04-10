import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';

export const VitalsChart = ({ data, dataKey, color, title, unit }) => {
  return (
    <Card className="h-80 w-full flex flex-col pt-4">
      <h3 className="text-lg font-semibold text-white mb-4 pl-4">{title} ({unit})</h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" stroke="#4b5563" fontSize={12} tickMargin={10} />
            <YAxis stroke="#4b5563" fontSize={12} tickMargin={10} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: color }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: color, stroke: '#111827', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
