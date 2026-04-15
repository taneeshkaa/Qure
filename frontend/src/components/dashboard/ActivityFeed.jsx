import React from 'react';
import { Bell, CheckCircle2, FileText, UserCircle2, CalendarClock } from 'lucide-react';
import DashboardCard from './DashboardCard';
import Skeleton from './Skeleton';

function iconForType(type) {
    const t = String(type || '').toUpperCase();
    if (t === 'REGISTERED') return UserCircle2;
    if (t === 'PROFILE_UPDATE') return CheckCircle2;
    if (t === 'PRESCRIPTION') return FileText;
    if (t === 'APPOINTMENT') return CalendarClock;
    return Bell;
}

export default function ActivityFeed({ loading, error, data }) {
    const items = Array.isArray(data) ? data : [];

    return (
        <DashboardCard title="Recent activity" icon={Bell}>
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-11/12" />
                    <Skeleton className="h-12 w-10/12" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {error}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    No recent activity.
                </div>
            ) : (
                <ol className="relative space-y-3">
                    <div className="absolute left-4 top-1 h-full w-px bg-emerald-100" />
                    {items.slice(0, 8).map((it, idx) => {
                        const Icon = iconForType(it.type);
                        return (
                            <li key={`${it.type}-${idx}-${it.time}`} className="relative pl-12">
                                <span className="absolute left-0 top-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-slate-900">{it.message}</p>
                                        <span className="text-xs font-bold text-slate-500">{it.time}</span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </DashboardCard>
    );
}

