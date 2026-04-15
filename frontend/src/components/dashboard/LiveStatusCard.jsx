import React from 'react';
import { Activity, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import Skeleton from './Skeleton';

function StatusPill({ label }) {
    const key = String(label || '').toLowerCase();
    const styles =
        key === 'now'
            ? 'bg-emerald-600 text-white'
            : key === 'next'
              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
              : key === 'waiting'
                ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
                : 'bg-slate-50 text-slate-700 ring-1 ring-slate-100';
    const text = label ? String(label).toUpperCase() : '—';
    return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${styles}`}>{text}</span>;
}

export default function LiveStatusCard({ loading, error, data, polledAt, nextRefreshSec }) {
    return (
        <DashboardCard
            title="Live status"
            icon={Activity}
            right={
                nextRefreshSec != null ? (
                    <span className="text-xs font-semibold text-slate-500">Refresh in {nextRefreshSec}s</span>
                ) : null
            }
            className="border-t-2 border-t-emerald-500"
        >
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {error}
                </div>
            ) : data?.hasAppointment ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-extrabold text-slate-900">{data.doctorName || 'Doctor'}</p>
                            <p className="text-xs font-semibold text-slate-500">
                                Queue position updates in near real time
                                {polledAt ? <span className="ml-2 opacity-70">· updated</span> : null}
                            </p>
                        </div>
                        <StatusPill label={data.status} />
                    </div>

                    {data.doctorDelay ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
                            Doctor delay: {Number(data.doctorDelayMinutes || 0)} mins
                            {data.doctorDelayReason ? ` — ${data.doctorDelayReason}` : ''}
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Users className="h-4 w-4 text-emerald-600" />
                                Queue
                            </div>
                            <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">#{data.queuePosition ?? '—'}</div>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                ETA
                            </div>
                            <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                                {typeof data.estimatedWaitTime === 'number' ? `${data.estimatedWaitTime}m` : '—'}
                            </div>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
                            <div className="text-xs font-bold text-slate-500">Status</div>
                            <div className="mt-2">
                                <StatusPill label={data.status} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        No appointment today. Want to book something quick?
                    </div>
                    {Array.isArray(data?.suggestions) && data.suggestions.length > 0 ? (
                        <div className="space-y-2">
                            {data.suggestions.slice(0, 3).map((s) => (
                                <div
                                    key={s.doctorId}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3"
                                >
                                    <div>
                                        <div className="text-sm font-extrabold text-slate-900">{s.doctorName}</div>
                                        <div className="text-xs font-semibold text-slate-500">
                                            {s.speciality}
                                            {s.hospitalName ? ` • ${s.hospitalName}` : ''}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">{s.nextSlotSuggestion}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    <Link
                        to="/patient/search"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700"
                    >
                        Find doctors <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </DashboardCard>
    );
}

