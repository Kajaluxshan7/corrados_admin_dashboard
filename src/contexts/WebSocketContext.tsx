import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useWebSocket, type WsEventHandler } from '../hooks/useWebSocket';
import { useAuth } from './AuthContext';

// Mirror the backend WsEvent enum for type safety
export const WsEvent = {
  MENU_UPDATED: 'menu:updated',
  MENU_ITEM_CREATED: 'menu:item:created',
  MENU_ITEM_UPDATED: 'menu:item:updated',
  MENU_ITEM_DELETED: 'menu:item:deleted',
  SPECIAL_CREATED: 'special:created',
  SPECIAL_UPDATED: 'special:updated',
  SPECIAL_DELETED: 'special:deleted',
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_DELETED: 'event:deleted',
  ANNOUNCEMENT_CREATED: 'announcement:created',
  ANNOUNCEMENT_UPDATED: 'announcement:updated',
  ANNOUNCEMENT_DELETED: 'announcement:deleted',
  OPENING_HOURS_UPDATED: 'openingHours:updated',
  TODO_CREATED: 'todo:created',
  TODO_UPDATED: 'todo:updated',
  TODO_DELETED: 'todo:deleted',
  STORY_UPDATED: 'story:updated',
  PARTY_MENU_UPDATED: 'partyMenu:updated',
  FAMILY_MEAL_UPDATED: 'familyMeal:updated',
  USER_UPDATED: 'user:updated',
  NEWSLETTER_UPDATED: 'newsletter:updated',
  NOTIFICATION_SENT: 'notification:sent',
  DASHBOARD_REFRESH: 'dashboard:refresh',
} as const;

export type WsEventType = (typeof WsEvent)[keyof typeof WsEvent];

interface WebSocketContextType {
  connected: boolean;
  on: (event: string, handler: WsEventHandler) => () => void;
  off: (event: string, handler?: WsEventHandler) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const { connected, on, off } = useWebSocket({
    enabled: isAuthenticated,
    type: 'admin',
  });

  return (
    <WebSocketContext.Provider value={{ connected, on, off }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWs = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWs must be used within a WebSocketProvider');
  }
  return context;
};

/**
 * Hook to subscribe to a WebSocket event and trigger a callback when received.
 * Automatically cleans up on unmount.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useWsEvent(event: string, handler: WsEventHandler) {
  const { on } = useWs();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler: WsEventHandler = (data) => handlerRef.current(data);
    const cleanup = on(event, stableHandler);
    return cleanup;
  }, [event, on]);
}

/**
 * Hook to subscribe to a WebSocket event and trigger a data refresh.
 * Pass a fetch function that will be called when the event fires.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useWsRefresh(event: string, fetchFn: () => void) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useWsEvent(
    event,
    useCallback(() => {
      fetchRef.current();
    }, []),
  );
}
