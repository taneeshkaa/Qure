import React from 'react';

export default function DashboardCard({ title, icon: Icon, right, children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur-xl shadow-sm ${className}`}>
            {(title || Icon || right) && (
                <div className="flex items-center justify-between gap-3 px-5 pt-5">
                    <div className="flex items-center gap-2">
                        {Icon ? (
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                <Icon className="h-5 w-5" />
                            </span>
                        ) : null}
                        {title ? (
                            <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">{title}</h2>
                        ) : null}
                    </div>
                    {right ? <div className="shrink-0">{right}</div> : null}
                </div>
            )}
            <div className="px-5 pb-5 pt-4">{children}</div>
        </section>
    );
}

