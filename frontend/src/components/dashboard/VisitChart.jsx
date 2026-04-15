import React from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import DashboardCard from './DashboardCard';
import Skeleton from './Skeleton';

export default function VisitChart({ loading, error, data }) {
    const points = Array.isArray(data?.monthlyVisits) ? data.monthlyVisits : [];

    return (
        <DashboardCard title="Visits (last 6 months)" icon={LineChartIcon}>
            {loading ? (
                <Skeleton className="h-40 w-full" />
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {error}
                </div>
            ) : (
                <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={points} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Line type="monotone" dataKey="visits" stroke="#059669" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </DashboardCard>
    );
}

