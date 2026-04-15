import React from 'react';
import { Play, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import Skeleton from './Skeleton';

function actionToLink(action) {
    const a = String(action || '').toLowerCase();
    if (a.includes('book')) return '/patient/appointments';
    if (a.includes('reminder')) return '/patient/dashboard';
    if (a.includes('health profile')) return '/patient/dashboard';
    return '/patient/dashboard';
}

export default function ResumeCard({ loading, error, data }) {
    const lastAction = data?.lastAction || null;

    return (
        <DashboardCard title="Continue where you left" icon={History}>
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {error}
                </div>
            ) : !lastAction ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    We’ll keep track of your latest actions here.
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Last action</div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">{lastAction}</div>
                        {data?.lastActionAt ? (
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                                {new Date(data.lastActionAt).toLocaleString()}
                            </div>
                        ) : null}
                    </div>
                    <Link
                        to={actionToLink(lastAction)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
                    >
                        Resume <Play className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </DashboardCard>
    );
}

