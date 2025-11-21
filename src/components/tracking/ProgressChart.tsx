'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ProgressChartProps {
  data: Array<{ date: string; value: number }>;
  title?: string;
  unit?: string;
}

export function ProgressChart({ data, title, unit }: ProgressChartProps) {
  return (
    <div className="w-full h-64">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" name={unit || 'Value'} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RadarProgressChartProps {
  data: Array<{ pillar: string; progress: number }>;
  title?: string;
}

export function RadarProgressChart({ data, title }: RadarProgressChartProps) {
  return (
    <div className="w-full h-96">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="pillar" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Progress"
            dataKey="progress"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

