import React from 'react';

export default function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded-xl bg-emerald-100/60 ${className}`} />;
}

