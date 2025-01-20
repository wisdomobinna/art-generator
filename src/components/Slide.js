import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

const Slide = () => {
  // Data for database usage vs notification
  const artworkData = [
    { name: 'Total Artworks', value: 100 },
    { name: 'Artists Notified', value: 2 }
  ];

  // Data for artist impact pie chart
  const artistImpactData = [
    { name: 'Lost Commissions', value: 40 },
    { name: 'Remaining Work', value: 60 }
  ];

  const COLORS = ['#dc2626', '#2563eb'];

  return (
    <Card className="w-full h-full bg-white p-4">
      <h2 className="text-2xl font-bold text-center mb-6">The Ethics of Database Rights</h2>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Database Usage Statistics */}
        <div className="h-64">
          <h3 className="text-lg font-semibold text-center mb-2">Artist Notification Rate (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={artworkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Artist Impact Pie Chart */}
        <div className="h-64">
          <h3 className="text-lg font-semibold text-center mb-2">Commission Impact on Artists</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={artistImpactData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}%`}
              >
                {artistImpactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">100M+</div>
          <div className="text-sm">Artworks in Training Data</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-3xl font-bold text-red-600">2%</div>
          <div className="text-sm">Artists Notified</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">40%</div>
          <div className="text-sm">Commission Reduction</div>
        </div>
      </div>
    </Card>
  );
};

export default Slide;