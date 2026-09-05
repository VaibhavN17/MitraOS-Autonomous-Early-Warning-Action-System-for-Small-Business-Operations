import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const getWebSocketUrl = () => {
      const envWsUrl = import.meta.env.VITE_WS_URL;
      if (envWsUrl) return envWsUrl.trim();

      const envApiUrl = import.meta.env.VITE_API_URL;
      if (envApiUrl) {
        const wsBase = envApiUrl.trim().replace(/^http/, 'ws').replace(/\/+$/, '').replace(/\/api\/v1$/, '');
        return `${wsBase}/ws`;
      }

      // When deployed in production (e.g. Vercel), connect to the Render backend WebSocket
      if (import.meta.env.PROD) {
        return 'wss://mitraos-autonomous-early-warning-action.onrender.com/ws';
      }

      // Local development fallback (proxied via Vite)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${protocol}//${host}/ws`;
    };

    const connect = () => {
      const wsUrl = getWebSocketUrl();

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          console.log('[MitraOS] WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (e) {
            console.log('[MitraOS] WS message raw:', event.data);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.warn('[MitraOS] WebSocket error:', err);
          ws?.close();
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
