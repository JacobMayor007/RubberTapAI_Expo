import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import Loading from "@/src/components/LoadingComponent";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { useMessage } from "@/src/contexts/MessageContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { storage } from "@/src/lib/appwrite";
import { MessageHistory, Profile } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(utc);

export default function Messages() {
  const { user } = useAuth();
  const userMessage = useMessage();
  const router = useRouter();
  const { theme } = useTheme();

  const scrollViewRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<MessageHistory[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [images, setImages] = useState("");
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState(1);
  const [showDate, setShowDate] = useState<number | null>(null);
  const [rateModal, setRateModal] = useState(false);
  const [rateUser, setRateUser] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Handle dynamic TextInput height
  const handleContentSizeChange = (event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const lineHeight = 20;
    setLines(Math.floor(contentHeight / lineHeight));
  };

  // Fetch user profile
  useEffect(() => {
    if (!user?.$id) return;
    (async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user.$id}`
        );
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    })();
  }, [user?.$id]);

  // Setup WebSocket
  useEffect(() => {
    if (!user?.$id || !userMessage?.user?.$id) return;

    const ws = new WebSocket(`ws://10.142.74.33:8080/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WS Connected in messages");
      ws.send(JSON.stringify({ type: "CONNECT", userId: user.$id }));
      // Fetch initial conversation messages
      ws.send(
        JSON.stringify({
          type: "GET_CONVERSATION_MESSAGES",
          userId: user.$id,
          receiverId: userMessage?.user?.$id,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "RECEIVE_MESSAGE":
        case "MESSAGE_SENT":
          setMessages((prev) => [
            ...prev,
            { ...data.message, $createdAt: dayjs(data.message.$createdAt) },
          ]);
          break;
        case "CONVERSATION_MESSAGES":
          const normalized = data.messages.map((m: MessageHistory) => ({
            ...m,
            $createdAt: dayjs(m.$createdAt),
          }));
          setMessages(
            normalized.sort(
              (a: any, b: any) =>
                a.$createdAt.valueOf() - b.$createdAt.valueOf()
            )
          );
          setLoading(false);
          break;
        case "ERROR":
          console.error("WS Error:", data.message);
          break;
      }
    };

    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = () => console.log("WS disconnected");

    return () => ws.close();
  }, [user?.$id, userMessage?.user?.$id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const pickAnImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return alert("Permission denied!");

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      aspect: [1, 1],
    });
    if (!result.canceled) return setImages(result.assets[0].uri);
  };

  const handleSend = async () => {
    if (!newMessage.trim())
      return Alert.alert("Error", "Please input a message first");

    let fileUrl = "";
    if (images) {
      const fileInfo = await FileSystem.getInfoAsync(images);
      if (fileInfo.exists) {
        const result = await storage.createFile(
          `${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}`,
          ID.unique(),
          {
            uri: images,
            name: `image_${Date.now()}.jpg`,
            type: "image/jpeg",
            size: fileInfo.size,
          }
        );
        fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
        setImages("");
      }
    }

    const payload = {
      type: "SEND_MESSAGE",
      userId: user?.$id,
      receiver_id: userMessage?.user?.$id,
      lastMessage: newMessage,
      senderProfile: profile?.imageURL,
      receiverProfile: userMessage?.user?.imageURL,
      senderName: user?.name,
      receiverName: userMessage?.user?.username,
      fileUrl,
    };

    wsRef.current?.send(JSON.stringify(payload));
    setNewMessage("");
  };

  // Auto-hide date
  useEffect(() => {
    if (showDate) setTimeout(() => setShowDate(null), 10000);
  }, [showDate]);

  const rateAndFeedbackUser = async () => {
    if (!userMessage?.user) return;
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.$id,
          receivedId: userMessage.user.$id,
          rate: rateUser,
          feedback,
          ratedByName: profile?.fullName,
          ratedByImage: profile?.imageURL,
          ratedName: userMessage.user.fullName,
          ratedImage: userMessage?.user?.imageURL,
        }),
      });
      console.log(await response.json());
      setFeedback("");
      setRateUser(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRateModal(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <BackgroundGradient
          className={`flex-1 ${
            theme === "dark" ? "bg-[#101010]" : "bg-[#FFDFA9]"
          }`}
        >
          <View className="flex-1">
            {/* Header */}
            <View
              className={`flex-row items-center justify-between h-24 p-6 border-b ${
                theme === "dark" ? "border-[#38C282]" : "border-gray-500"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <FontAwesome5
                  name="arrow-left"
                  size={20}
                  color={theme === "dark" ? "#E8C282" : "black"}
                  onPress={() => router.replace("/(tabs)/chats")}
                />
                <Image
                  style={{ height: 48, width: 48 }}
                  className="rounded-full"
                  source={{ uri: userMessage?.user?.imageURL || "" }}
                />
                <View className="flex-col">
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-bold text-lg"
                  >
                    {userMessage.user?.email}
                  </AppText>
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-extralight text-sm"
                  >
                    {userMessage.user?.username}
                  </AppText>
                </View>
              </View>
              <Link
                href={{
                  pathname: "/(message)/[user_id]",
                  params: { user_id: userMessage?.user?.$id || "" },
                }}
              >
                <MaterialIcons name="report" size={28} color="maroon" />
              </Link>
            </View>

            {/* Messages */}
            {loading ? (
              <Loading />
            ) : (
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                {messages.map((msg, idx) => (
                  <View
                    key={idx}
                    className={`flex-row ${
                      msg.sender_id === user?.$id
                        ? "flex-row-reverse"
                        : "flex-row"
                    } items-center gap-2`}
                  >
                    <Image
                      source={{
                        uri:
                          msg.sender_id === user?.$id
                            ? profile?.imageURL
                            : userMessage?.user?.imageURL,
                      }}
                      className="h-8 w-8 rounded-full mt-4"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowDate((prev) => (prev === idx ? null : idx))
                      }
                      className={`min-w-48 max-w-72 p-3 rounded-md mb-2 w-fit ${
                        msg.sender_id === user?.$id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      {msg.imageUrl && (
                        <Image
                          source={{ uri: msg.imageUrl }}
                          className="h-12 w-12"
                        />
                      )}
                      <AppText className="font-semibold">{msg.content}</AppText>
                      {idx === showDate && (
                        <AppText className="text-xs mt-2">
                          {msg.$createdAt
                            .utc()
                            .local()
                            .format("MM/DD/YYYY hh:mm A")}
                        </AppText>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Input */}
            <View
              className={`flex-row items-center gap-2 px-4 ${
                lines > 2 ? "h-18" : "h-14"
              }`}
            >
              <ViewPressable
                onPress={pickAnImage}
                className="h-10 w-10 bg-black rounded-full items-center justify-center"
              >
                <Entypo name="folder-images" size={20} color="white" />
              </ViewPressable>
              <TextInput
                multiline
                value={newMessage}
                onChangeText={setNewMessage}
                onContentSizeChange={handleContentSizeChange}
                placeholder="Message..."
                className={`flex-1 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              />
              <ViewPressable
                onPress={handleSend}
                className="h-10 w-10 bg-black rounded-full items-center justify-center"
              >
                <Feather name="send" size={20} color="white" />
              </ViewPressable>
            </View>
          </View>
        </BackgroundGradient>
      </KeyboardAvoidingView>

      {/* Rate Modal */}
      <Modal
        transparent
        visible={rateModal}
        onRequestClose={() => setRateModal(false)}
      >
        <ConfirmCancelModal
          onOk={rateAndFeedbackUser}
          onCancel={() => setRateModal(false)}
          heightSize={96}
        >
          <AppText>Rate user: {userMessage?.user?.fullName}</AppText>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <AntDesign
                key={i}
                name="star"
                size={32}
                color={rateUser >= i ? "#fadb14" : "gray"}
                onPress={() => setRateUser(i)}
              />
            ))}
          </View>
          <TextInput
            multiline
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Optional feedback"
            className="border rounded p-2 h-28"
          />
        </ConfirmCancelModal>
      </Modal>
    </SafeAreaView>
  );
}
