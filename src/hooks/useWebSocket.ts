import { useEffect, useRef, useState } from "react";
import { socketClient } from "../lib/api";

export const useWebSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef(socketClient);

  useEffect(() => {
    if (!userId) return;

    const socket = socketRef.current.connect(userId);

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error: Error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
};
