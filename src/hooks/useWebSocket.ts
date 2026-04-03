import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/env.config';
import logger from '../utils/logger';

export type WsEventHandler = (data: any) => void;

interface UseWebSocketOptions {
  /** Whether to connect (e.g., only when authenticated) */
  enabled?: boolean;
  /** Client type for server-side room assignment */
  type?: 'admin' | 'public';
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true, type = 'admin' } = options;
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<string, Set<WsEventHandler>>>(new Map());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      query: { type },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      logger.info('[WebSocket] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      logger.info('[WebSocket] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      logger.error('[WebSocket] Connection error:', error.message);
      setConnected(false);
    });

    // Re-attach any existing handlers
    handlersRef.current.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        socket.on(event, handler);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, type]);

  const on = useCallback((event: string, handler: WsEventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }

    // Return cleanup function
    return () => {
      handlersRef.current.get(event)?.delete(handler);
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  const off = useCallback((event: string, handler?: WsEventHandler) => {
    if (handler) {
      handlersRef.current.get(event)?.delete(handler);
      socketRef.current?.off(event, handler);
    } else {
      handlersRef.current.delete(event);
      socketRef.current?.removeAllListeners(event);
    }
  }, []);

  return { connected, on, off, socket: socketRef };
}
