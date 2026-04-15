import React from 'react';
import { Building2, Timer } from 'lucide-react';
import DashboardCard from './DashboardCard';
import Skeleton from './Skeleton';

export default function NearbyHospitals({ loading, error, data }) {
    const items = Array.isArray(data) ? data : [];

    return (
        <DashboardCard title="Nearby hospitals" icon={Building2}>
            {loading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="min-w-[240px] rounded-2xl border border-emerald-100 bg-white px-4 py-3">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="mt-2 h-4 w-28" />
                            <Skeleton className="mt-4 h-8 w-24" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {error}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    No hospitals found.
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {items.slice(0, 10).map((h) => (
                        <div
                            key={h.id || h.name}
                            className="min-w-[260px] rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm font-extrabold text-slate-900">{h.name}</div>
                                    <div className="text-xs font-semibold text-slate-500">
                                        {h.speciality || 'General'}
                                        {(h.city || h.state) ? ` • ${[h.city, h.state].filter(Boolean).join(', ')}` : ''}
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 ring-1 ring-emerald-100">
                                    <Timer className="h-3.5 w-3.5" />
                                    {typeof h.waitTime === 'number' ? `${h.waitTime}m` : '—'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardCard>
    );
}

