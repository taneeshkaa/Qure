import React from 'react';
import { Stethoscope, FileText, Timer } from 'lucide-react';
import Skeleton from './Skeleton';

function StatCard({ icon: Icon, label, value, loading }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                        {loading ? <Skeleton className="h-8 w-16" /> : value}
                    </div>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />
        </div>
    );
}

export default function StatsRow({ loading, error, data }) {
    if (error) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
                icon={Stethoscope}
                label="Total visits"
                loading={loading}
                value={typeof data?.totalVisits === 'number' ? data.totalVisits : '—'}
            />
            <StatCard
                icon={FileText}
                label="Prescriptions"
                loading={loading}
                value={typeof data?.prescriptions === 'number' ? data.prescriptions : '—'}
            />
            <StatCard
                icon={Timer}
                label="Time saved"
                loading={loading}
                value={typeof data?.avgWaitTimeSaved === 'number' ? `${data.avgWaitTimeSaved}m` : '—'}
            />
        </div>
    );
}

