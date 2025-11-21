'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ProgressChartProps {
  data: Array<{ date: string; value: number }>;
  title?: string;
  unit?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-purple-600 font-medium">
          {payload[0].name}: <span className="text-gray-900">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ProgressChart({ data, title, unit }: ProgressChartProps) {
  return (
    <div className="w-full h-64 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fill="#8b5cf6"
            name={unit || 'Value'}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6, fill: '#7c3aed' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RadarProgressChartProps {
  data: Array<{ pillar: string; progress: number }>;
  title?: string;
}

const RadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
        <p className="text-sm font-semibold text-gray-900 mb-1">{payload[0].payload.pillar}</p>
        <p className="text-sm text-purple-600 font-medium">
          Progress: <span className="text-gray-900">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function RadarProgressChart({ data, title }: RadarProgressChartProps) {
  return (
    <div className="w-full h-96 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="pillar" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            style={{ fontSize: '12px' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Progress"
            dataKey="progress"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Tooltip content={<RadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

