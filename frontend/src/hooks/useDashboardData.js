import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    getDashboardStatus,
    getDashboardStats,
    getDashboardRecommendations,
    getDashboardActivity,
    getDashboardAnalytics,
    getDashboardLastAction,
    getNearbyHospitals,
} from '../api/patient';

const prettyError = (err) => {
    const msg = err?.message || '';
    if (!msg) return 'Something went wrong.';
    if (msg.includes('Network Error')) return 'Cannot reach the backend. Make sure the backend is running.';
    return msg;
};

export function useDashboardData({ statusPollMs = 30_000 } = {}) {
    const [status, setStatus] = useState({ loading: true, error: '', data: null, fetchedAt: null });
    const [stats, setStats] = useState({ loading: true, error: '', data: null });
    const [recs, setRecs] = useState({ loading: true, error: '', data: null });
    const [activity, setActivity] = useState({ loading: true, error: '', data: [] });
    const [hospitals, setHospitals] = useState({ loading: true, error: '', data: [] });
    const [analytics, setAnalytics] = useState({ loading: true, error: '', data: null });
    const [lastAction, setLastAction] = useState({ loading: true, error: '', data: null });

    const pollRef = useRef(null);

    const fetchStatus = useCallback(async () => {
        setStatus((s) => ({ ...s, loading: true, error: '' }));
        try {
            const resp = await getDashboardStatus();
            setStatus({ loading: false, error: '', data: resp?.data || null, fetchedAt: Date.now() });
        } catch (e) {
            setStatus({ loading: false, error: prettyError(e), data: null, fetchedAt: Date.now() });
        }
    }, []);

    const fetchOnce = useCallback(async () => {
        setStats((s) => ({ ...s, loading: true, error: '' }));
        setRecs((s) => ({ ...s, loading: true, error: '' }));
        setActivity((s) => ({ ...s, loading: true, error: '' }));
        setHospitals((s) => ({ ...s, loading: true, error: '' }));
        setAnalytics((s) => ({ ...s, loading: true, error: '' }));
        setLastAction((s) => ({ ...s, loading: true, error: '' }));

        const tasks = await Promise.allSettled([
            getDashboardStats(),
            getDashboardRecommendations(),
            getDashboardActivity(),
            getNearbyHospitals(),
            getDashboardAnalytics(),
            getDashboardLastAction(),
        ]);

        const [statsRes, recRes, actRes, hospRes, anaRes, lastRes] = tasks;

        if (statsRes.status === 'fulfilled') setStats({ loading: false, error: '', data: statsRes.value?.data || null });
        else setStats({ loading: false, error: prettyError(statsRes.reason), data: null });

        if (recRes.status === 'fulfilled') setRecs({ loading: false, error: '', data: recRes.value?.data || null });
        else setRecs({ loading: false, error: prettyError(recRes.reason), data: null });

        if (actRes.status === 'fulfilled') setActivity({ loading: false, error: '', data: actRes.value?.data || [] });
        else setActivity({ loading: false, error: prettyError(actRes.reason), data: [] });

        if (hospRes.status === 'fulfilled') setHospitals({ loading: false, error: '', data: hospRes.value?.data || [] });
        else setHospitals({ loading: false, error: prettyError(hospRes.reason), data: [] });

        if (anaRes.status === 'fulfilled') setAnalytics({ loading: false, error: '', data: anaRes.value?.data || null });
        else setAnalytics({ loading: false, error: prettyError(anaRes.reason), data: null });

        if (lastRes.status === 'fulfilled') setLastAction({ loading: false, error: '', data: lastRes.value?.data || null });
        else setLastAction({ loading: false, error: prettyError(lastRes.reason), data: null });
    }, []);

    useEffect(() => {
        fetchStatus();
        fetchOnce();
    }, [fetchOnce, fetchStatus]);

    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(fetchStatus, statusPollMs);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchStatus, statusPollMs]);

    const nextRefreshSec = useMemo(() => {
        if (!status.fetchedAt) return null;
        const elapsed = Date.now() - status.fetchedAt;
        return Math.max(0, Math.ceil((statusPollMs - (elapsed % statusPollMs)) / 1000));
    }, [status.fetchedAt, statusPollMs]);

    return {
        status,
        stats,
        recommendations: recs,
        activity,
        hospitals,
        analytics,
        lastAction,
        refreshAll: () => {
            fetchStatus();
            fetchOnce();
        },
        nextRefreshSec,
    };
}

