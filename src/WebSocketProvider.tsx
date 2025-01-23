// WebSocketProvider.tsx
import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketContextType {
  socket: Socket | null;
  isWsConnected: boolean;
  setIsWsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{
  url: string;
  children: React.ReactNode;
}> = ({ url, children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  console.log("Rendering the root with WebSocketProvider, URL=", url);

  // Initialize socket once
  if (!socketRef.current) {
    socketRef.current = io(url, {
      transports: ["websocket"],
      timeout: 30000,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      autoConnect: false,
    });
  }

  useEffect(() => {
    // Optional: log successful connection or errors
    const socket = socketRef.current;
    if (!socket) return;

    // Now call connect
    socket.connect();

    console.log("Socket initialized!", socket.id);
    const handleConnect = () => {
      console.log("Socket connected!", socket.id);
      setIsWsConnected(true);
    };
    const handleDisconnect = () => {
      console.log("Socket disconnected!");
      setIsWsConnected(false);
    };
    const handleConnectError = (err: any) => {
      console.error("Socket connect_error:", err);
      setIsWsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      // Cleanup on unmount, if needed
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        isWsConnected,
        setIsWsConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// Helper hook
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
