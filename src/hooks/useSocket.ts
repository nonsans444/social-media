import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // In production, the socket server is the same as the origin
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", user.uid);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const sendMessage = (receiverId: string, message: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit("send-message", {
        senderId: user.uid,
        receiverId,
        message,
        timestamp: Date.now(),
      });
    }
  };

  return { socket: socketRef.current, isConnected, sendMessage };
};
