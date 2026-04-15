import React from 'react';
import { Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import Skeleton from './Skeleton';

export default function Recommendations({ loading, error, data }) {
    const items = Array.isArray(data?.recommendations) ? data.recommendations : [];

    return (
        <DashboardCard
            title="Smart recommendations"
            icon={Sparkles}
            right={
                <Link to="/doctors" className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800">
                    Explore <ArrowRight className="inline h-4 w-4 align-text-bottom" />
                </Link>
            }
        >
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-4/5" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {error}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    No recommendations yet.
                </div>
            ) : (
                <ul className="space-y-2">
                    {items.slice(0, 5).map((text) => (
                        <li key={text} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3">
                            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                <MapPin className="h-4 w-4" />
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{text}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Link
                                        to="/patient/search"
                                        className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-700"
                                    >
                                        Book now
                                    </Link>
                                    <Link
                                        to="/doctors"
                                        className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
                                    >
                                        Browse doctors
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </DashboardCard>
    );
}

