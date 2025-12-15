// hooks/useWebSocket.ts
import { MessageHistory } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketProps {
  userId: string;
  onMessage?: (message: MessageHistory) => void;
  messageHistory: (history: MessageHistory) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
}

export const useWebSocket = ({
  userId,
  onMessage,
  messageHistory,
  onTyping,
}: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:3000";
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Authenticate
      ws.current?.send(
        JSON.stringify({
          type: "authenticate",
          userId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "authenticated":
            console.log("Authenticated:", data.userId);
            break;

          case "new_message":
            if (onMessage) {
              onMessage(data.message);
            }
            break;

          case "message_history":
            messageHistory(data.message);
            break;

          case "typing":
            if (onTyping) {
              onTyping({ userId: data.userId, isTyping: data.isTyping });
            }
            break;

          case "error":
            console.error("WebSocket error:", data.message);
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);

      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;

        console.log(
          `Reconnecting in ${60000}ms (attempt ${reconnectAttempts.current})`
        );
      }
    };
  }, [userId, onMessage, onTyping]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }, []);

  const getHistory = useCallback(
    (receiverId: string) => {
      sendMessage({
        type: "get_history",
        userId,
        receiverId,
      });
    },
    [userId, sendMessage]
  );

  const sendTyping = useCallback(
    (receiverId: string, isTyping: boolean) => {
      sendMessage({
        type: "typing",
        userId,
        receiver_id: receiverId,
        isTyping,
      });
    },
    [userId, sendMessage]
  );

  return {
    isConnected,
    sendMessage,
    getHistory,
    sendTyping,
    reconnect: connect,
  };
};
