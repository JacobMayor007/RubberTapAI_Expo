// ChatScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  createdAt: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null);

  const myId = "user2";
  const theirId = "user1";

  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.1.12:8080");

    ws.current.onopen = () => {
      console.log("Connected to WS");
      ws.current?.send(JSON.stringify({ type: "authenticate", userId: myId }));

      // Load history
      ws.current?.send(
        JSON.stringify({
          type: "get_history",
          userId: myId,
          receiverId: theirId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "history") {
        setMessages(data.messages);
      }

      if (data.type === "new_message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.current.onerror = (err) => console.error("WS error:", err);
    ws.current.onclose = () => console.log("WS closed");

    return () => ws.current?.close();
  }, []);

  const sendMessage = () => {
    if (input.trim() === "") return;

    ws.current?.send(
      JSON.stringify({
        type: "send_message",
        senderId: myId,
        receiverId: theirId,
        content: input,
      })
    );

    setInput("");
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 5 }}>
            <Text style={{ color: "black" }}>
              {item.sender_id === myId ? "Me: " : "Them: "} {item.content}
            </Text>
          </View>
        )}
      />

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          style={{ borderWidth: 1, flex: 1, marginRight: 5, padding: 5 }}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
}
