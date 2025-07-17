import {
  createNewChatRoom,
  createNewMessages,
} from "@/src/action/messageAction";
import { getUserByIdDirect } from "@/src/action/userAction";
import { AppText } from "@/src/components/AppText";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { useMessage } from "@/src/contexts/MessageContext";
import { client, database, storage } from "@/src/lib/appwrite";
import { MessageHistory, User } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { ID, Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(utc);

export default function Messages() {
  const userMessage = useMessage();
  const scrollViewRef = useRef<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [lines, setLines] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [profile, setProfile] = useState<User | null>(null);
  const [images, setImages] = useState("");

  const [messages, setMessages] = useState<MessageHistory[]>([]);

  const handleContentSizeChange = (event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const lineHeight = 20;
    const calculatedLines = Math.floor(contentHeight / lineHeight);
    setLines(calculatedLines);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.$id) {
        const userProfile = await getUserByIdDirect(user.$id);
        setProfile(userProfile);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  useEffect(() => {
    handleFirstLoad();
  }, []);

  useEffect(() => {
    handleFirstLoad();

    const channel = `databases.686156d00007a3127068.collections.686cd8000033894e4bc8.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      console.log("Realtime event: ", response);
      if (response.events.includes("databases.*.collections.*.documents.*")) {
        getMessages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const pickAnImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      const selectedUris = result.assets[0].uri;
      setImages(selectedUris);
    }

    console.log(result);
  };

  const handleFirstLoad = async () => {
    try {
      await getMessages();
    } catch (error) {
      console.log(error);
    }
  };

  const getMessages = async () => {
    try {
      const sentResponse = await database.listDocuments(
        "686156d00007a3127068",
        "686cd8000033894e4bc8",
        [
          Query.equal("sender_id", user?.$id || ""),
          Query.equal("receiver_id", userMessage?.user?.$id || ""),
        ]
      );

      const sentMessages: MessageHistory[] = sentResponse.documents.map(
        (doc) => ({
          $id: doc.$id,
          $createdAt: dayjs(doc.$createdAt),
          content: doc.content,
          product_id: doc.product_id,
          sender_id: doc.sender_id,
          receiver_id: doc.receiver_id,
          imageUrl: doc.imageUrl,
        })
      );

      const receivedResponse = await database.listDocuments(
        "686156d00007a3127068",
        "686cd8000033894e4bc8",
        [
          Query.equal("sender_id", userMessage?.user?.$id || ""),
          Query.equal("receiver_id", user?.$id || ""),
        ]
      );

      const receivedMessages: MessageHistory[] = receivedResponse.documents.map(
        (doc) => ({
          $id: doc.$id,
          $createdAt: dayjs(doc.$createdAt),
          content: doc.content,
          product_id: doc.product_id,
          sender_id: doc.sender_id,
          receiver_id: doc.receiver_id,
          imageUrl: doc.imageUrl,
        })
      );

      const combinedMessages = [...sentMessages, ...receivedMessages].sort(
        (a, b) => a.$createdAt.valueOf() - b.$createdAt.valueOf()
      );
      setMessages(combinedMessages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    setNewMessage("");
    if (newMessage === "") {
      Alert.alert("Error", "Please input a message first");
      return;
    }

    try {
      const existingChats = await database.listDocuments(
        "686156d00007a3127068",
        "686cd6a3000e3ba76aef",
        [
          Query.or([
            Query.and([
              Query.equal("senderId", user?.$id || ""),
              Query.equal("receiverId", userMessage?.user?.$id || ""),
            ]),
            Query.and([
              Query.equal("senderId", user?.$id || ""),
              Query.equal("receiverId", userMessage?.user?.$id || ""),
            ]),
          ]),
        ]
      );

      const chatRoomID = existingChats.documents[0]?.$id;

      if (existingChats.total === 0) {
        await createNewChatRoom(
          user?.$id || "",
          userMessage?.user?.$id || "",
          newMessage,
          profile?.imageURL || "",
          userMessage.user?.imageURL || "",
          user?.name || "",
          userMessage?.user?.username || ""
        );
      } else {
        await database.updateDocument(
          "686156d00007a3127068",
          "686cd6a3000e3ba76aef",
          chatRoomID,
          {
            lastMessage: newMessage,
          }
        );
      }

      let fileUrl = "";

      if (images) {
        const fileInfo = await FileSystem.getInfoAsync(images);

        if (!fileInfo.exists) {
          console.error("File does not exist!");
        } else {
          const result = await storage.createFile(
            "686bdf11001233285b53",
            ID.unique(),
            {
              uri: images,
              name: `image_${Date.now()}.jpg`,
              type: "image/jpeg",
              size: fileInfo.size,
            }
          );

          console.log("Image uploaded!", result);

          // Construct the file URL
          fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/686bdf11001233285b53/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
        }

        setImages(""); // Clear selected image after send
      }

      await createNewMessages(
        "",
        user?.$id || "",
        userMessage?.user?.$id || "",
        newMessage,
        fileUrl // pass the image URL here
      );

      setNewMessage(""); // clear input after sending
    } catch (error) {
      console.error("There is an error sending the message", error);
      return [];
    }
  };

  return (
    <SafeAreaView className="bg-[rgb(63,31,17,.05)] flex-1 ">
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={"height"}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1">
          <View className="bg-[#FFDCA1] gap-4 h-24 p-6 flex-row items-center justify-between border-b-[1px] border-black">
            <View className="flex-row items-center gap-4">
              <FontAwesome5
                name="arrow-left"
                size={20}
                onPress={() => router.back()}
              />
              <Image
                style={{ height: 48, width: 48 }}
                className="h-14 w-14 rounded-full"
                source={
                  !userMessage.user?.imageURL
                    ? require("@/assets/images/anonymous_profile.png")
                    : { uri: userMessage.user?.imageURL }
                }
              />
              <View className="flex-col">
                <AppText
                  color={"dark"}
                  className="font-poppins font-bold text-lg "
                >
                  {userMessage.user?.email}
                </AppText>
                <AppText
                  color={"dark"}
                  className="font-poppins font-extralight text-sm "
                >
                  {userMessage.user?.username}
                </AppText>
              </View>
            </View>
            <MaterialIcons name="report" size={28} />
          </View>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            className="flex-1 px-4 pb-2"
          >
            {messages.map((msg, index) => {
              return (
                <View
                  key={index}
                  className={`min-w-48 max-w-72 p-3 rounded-lg mb-2 w-fit  ${
                    msg.sender_id === user?.$id
                      ? "bg-blue-500 text-white ml-auto text-right font-hind font-medium text-base "
                      : "bg-gray-300 text-black mr-auto text-left font-hind font-medium text-base"
                  }`}
                  style={
                    msg.$id === user?.$id
                      ? {
                          borderTopLeftRadius: 24,
                          borderBottomRightRadius: 24,
                        }
                      : {
                          borderTopRightRadius: 24,
                          borderBottomLeftRadius: 24,
                        }
                  }
                >
                  {msg?.imageUrl && (
                    <Image
                      className="h-12 w-12"
                      source={{ uri: msg?.imageUrl }}
                    />
                  )}
                  <AppText
                    color={msg?.sender_id === user?.$id ? "light" : "dark"}
                    className="mt-2 font-poppins font-semibold"
                  >
                    {msg?.content}
                  </AppText>

                  <AppText className="text-right text-xs mt-2">
                    {msg?.$createdAt.local().format("hh:mm A")}
                  </AppText>
                </View>
              );
            })}
          </ScrollView>
          <View
            className={`${
              lines > 2 ? "h-[72px]" : "h-14"
            } bg-[rgb(63,31,17,.25)] gap-2 relative rounded-full mx-4 flex-row items-center px-4`}
          >
            <View className=" flex-row absolute bottom-14 left-12 gap-4">
              {images.length > 0 && (
                <Image
                  className="h-16 w-16 rounded-md"
                  source={{ uri: images }}
                />
              )}
            </View>

            <ViewPressable
              onPress={pickAnImage}
              className="h-10 w-10 bg-black rounded-full items-center justify-center"
            >
              <Image source={require("@/assets/images/camera.png")} />
            </ViewPressable>

            <TextInput
              multiline
              placeholder="Message ..."
              className="w-9/12 max-h-20"
              onContentSizeChange={handleContentSizeChange}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <ViewPressable
              onPress={handleSend}
              className="h-10 w-10 bg-black rounded-full items-center justify-center"
            >
              <Feather size={20} color={"white"} name="send" />
            </ViewPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
