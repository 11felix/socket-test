// useSubscribeToRooms.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";

export function useSubscribeToRooms() {
  const { socket, isWsConnected } = useWebSocket();

  // Keep track of rooms we want to be subscribed to.
  // This allows re-subscribing to all rooms on reconnection.
  const roomsRef = useRef<Map<string, number>>(new Map());

  // Track whether the connection attempt (success or failure) has completed.
  const [hasConnectionAttempted, setHasConnectionAttempted] = useState(false);

  // Handle successful connection or reconnection.
  const handleConnect = useCallback(() => {
    if (!isWsConnected || !socket) return; // Ensure socket is connected before proceeding.
    console.log(
      "Socket connected/reconnected. Subscribing to rooms...",
      Array.from(roomsRef.current.keys())
    );

    // Subscribe to all tracked rooms.
    for (let room of roomsRef.current.keys()) {
      // Only subscribe to rooms that have active subscriptions.
      if (roomsRef.current.get(room) === 1) {
        socket.emit("subscribe", room);
      }
    }

    setHasConnectionAttempted(true); // Mark that connection has been attempted.
  }, [socket, isWsConnected]);

  // Handle connection errors.
  const handleConnectError = () => {
    console.error("WebSocket connection failed.");
    setHasConnectionAttempted(true); // Mark that connection has been attempted.
  };

  useEffect(() => {
    // Attach event listeners for connect and connect_error events.
    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("connect_error", handleConnectError);
    }

    // Cleanup event listeners on component unmount or dependency change.
    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleConnectError);
      }
    };
  }, [socket, isWsConnected]);

  // Subscribe to a specific room and track subscriptions.
  const subscribeRoom = useCallback(
    (room: string) => {
      if (isWsConnected && socket) {
        // Track the subscription in roomsRef.
        if (roomsRef.current.has(room)) {
          roomsRef.current.set(room, roomsRef.current.get(room)! + 1); // Increment the subscription count.
        } else {
          roomsRef.current.set(room, 1); // First subscription to the room.
          // Send a subscribe request to the server.
          socket.emit("subscribe", room);
        }
      } else {
        console.warn("Cannot subscribe to room, WebSocket is not connected.");
      }
    },
    [socket, isWsConnected]
  );

  // Unsubscribe from a specific room and update tracking.
  const unsubscribeRoom = useCallback(
    (room: string) => {
      if (isWsConnected && socket) {
        // Manage the subscription count in roomsRef.
        if (roomsRef.current.has(room)) {
          const count = roomsRef.current.get(room)!;
          if (count <= 1) {
            roomsRef.current.delete(room); // Remove room if no active subscriptions remain.
            // Send an unsubscribe request to the server.
            socket.emit("unsubscribe", room);
          } else {
            roomsRef.current.set(room, count - 1); // Decrement the subscription count.
          }
        }
      } else {
        console.warn(
          "Cannot unsubscribe from room, WebSocket is not connected."
        );
      }
    },
    [socket, isWsConnected]
  );

  return {
    subscribeRoom,
    unsubscribeRoom,
    socket,
    isWsConnected,
    hasConnectionAttempted,
  };
}
