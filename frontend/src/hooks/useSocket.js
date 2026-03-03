import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
    || import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')
    || 'http://localhost:5000';

/**
 * Reusable socket.io-client hook.
 * Connects on mount with the given hospitalId room and cleans up on unmount.
 */
export default function useSocket(hospitalId) {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!hospitalId) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setConnected(true);
            newSocket.emit('join-hospital', hospitalId);
        });

        newSocket.on('disconnect', () => setConnected(false));

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [hospitalId]);

    return { socket, connected };
}
