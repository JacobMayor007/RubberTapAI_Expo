import { AppText } from "@/src/components/AppText";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import Loading from "@/src/components/LoadingComponent";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { useMessage } from "@/src/contexts/MessageContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
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
  const userMessage = useMessage();
  const scrollViewRef = useRef<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [lines, setLines] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [images, setImages] = useState("");
  const [loading, setLoading] = useState(true);
  const [rateModal, setRateModal] = useState(false);
  const [rateUser, setRateUser] = useState(0);
  const [feedback, setFeedback] = useState("");
  const { theme } = useTheme();
  const [showDate, setShowDate] = useState<Number | null>(null);

  const [messages, setMessages] = useState<MessageHistory[]>([]);

  const handleContentSizeChange = (event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const lineHeight = 20;
    const calculatedLines = Math.floor(contentHeight / lineHeight);
    setLines(calculatedLines);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    fetchProfile();
  }, [user?.$id]);

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
  };

  useEffect(() => {
    if (!user?.$id || !userMessage?.user?.$id) return;

    const getMessages = async () => {
      try {
        const sentResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/sent-messages/${user.$id}/${userMessage?.user?.$id}`
        );

        const sentMessages = await sentResponse.json();

        const receivedResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/received-messages/${user.$id}/${userMessage?.user?.$id}`
        );
        const receivedMessages = await receivedResponse.json();

        const normalize = (msgs: MessageHistory[]) =>
          msgs.map((msg) => ({
            ...msg,
            $createdAt: dayjs(msg.$createdAt),
          }));

        const combined = [
          ...normalize(sentMessages),
          ...normalize(receivedMessages),
        ].sort((a, b) => a.$createdAt.valueOf() - b.$createdAt.valueOf());

        setMessages(combined);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [user?.$id, userMessage?.user?.$id, messages]);

  const handleSend = async () => {
    setNewMessage("");
    if (newMessage === "") {
      Alert.alert("Error", "Please input a message first");
      return;
    }

    try {
      let fileUrl = "";

      if (images) {
        const fileInfo = await FileSystem.getInfoAsync(images);

        if (!fileInfo.exists) {
          console.error("File does not exist!");
        } else {
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

          console.log("Image uploaded!", result);

          fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
        }

        setImages("");
      }

      const data = {
        userId: user?.$id,
        receiver_id: userMessage?.user?.$id,
        lastMessage: newMessage,
        senderProfile: profile?.imageURL,
        receiverProfile: userMessage?.user?.imageURL,
        senderName: user?.name,
        receiverName: userMessage?.user?.username,
        fileUrl: fileUrl ? fileUrl : ``,
        API_KEY: profile?.API_KEY,
      };

      await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/sent-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      setNewMessage("");
    } catch (error) {
      console.error("There is an error sending the message", error);
      return [];
    }
  };

  useEffect(() => {
    if (showDate) {
      setTimeout(() => {
        setShowDate(null);
      }, 10000);
    }
  }, [showDate]);

  const rateAndFeedbackUser = async () => {
    try {
      setLoading(true);
      const result = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: user?.$id,
            receivedId: userMessage?.user?.$id,
            API_KEY: profile?.API_KEY,
            rate: rateUser,
            feedback: feedback,
          }),
        },
        20000
      );

      const response = await result.json();

      console.log(response);
      setFeedback("");
      setRateUser(0);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  console.log(messages);

  return (
    <SafeAreaView
      className={`${theme === "dark" ? `bg-[rgb(63,31,17,.05)]` : `bg-[#FFECCC]`} flex-1 `}
    >
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
                onPress={() => router.replace("/(message)")}
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
            <Link
              href={{
                pathname: "/(message)/[user_id]",
                params: { user_id: userMessage?.user?.$id || "" },
              }}
            >
              <MaterialIcons name="report" size={28} color="red" />
            </Link>
          </View>
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Loading className="h-28 w-28" />
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-end",
                gap: 12,
              }}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
              className="flex-1 px-4 pb-2"
            >
              {messages?.map((msg, index) => {
                return (
                  <View key={index}>
                    <View
                      className={`${
                        msg?.sender_id === user?.$id
                          ? `flex-row-reverse`
                          : `flex-row`
                      } items-center gap-2`}
                    >
                      <Image
                        source={{
                          uri:
                            msg?.sender_id === user?.$id
                              ? profile?.imageURL
                              : userMessage?.user?.imageURL,
                        }}
                        className="h-8 w-8 rounded-full mt-4"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowDate((prev) => (prev === index ? null : index))
                        }
                        className={`min-w-48 max-w-72 p-3 rounded-md mb-2 w-fit ${
                          msg.sender_id === user?.$id
                            ? "bg-blue-500 text-white ml-auto text-right font-hind font-medium text-base"
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
                          color={
                            msg?.sender_id === user?.$id ? "light" : "dark"
                          }
                          className="font-poppins font-semibold"
                        >
                          {msg?.content}
                        </AppText>
                        {index === showDate && (
                          <AppText className="text-right text-xs mt-2">
                            {msg.$createdAt
                              .utc()
                              .local()
                              .format("MM/DD/YYYY hh:mm A")}
                          </AppText>
                        )}
                      </TouchableOpacity>
                    </View>

                    {index === 5 && (
                      <View className="items-center my-4">
                        <TouchableOpacity
                          className="bg-yellow-400 px-6 py-3 rounded-full shadow-md"
                          onPress={() => setRateModal(true)}
                        >
                          <AppText
                            color="dark"
                            className="font-poppins font-bold"
                          >
                            ⭐ Rate {userMessage.user?.username}
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
          {!loading && (
            <View
              className={`${
                lines > 2 ? "h-[72px]" : "h-14"
              } ${theme === "dark" ? `bg-[#FFECCC]/70` : `bg-[rgb(63,31,17,.25)]`} gap-2 relative rounded-full mx-4 flex-row items-center px-4`}
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
                <Entypo name="folder-images" size={20} color={"white"} />
              </ViewPressable>

              <TextInput
                multiline
                placeholder="Message ..."
                className={`w-9/12 max-h-20 ${theme === "dark" ? `text-white` : `text-black`}`}
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
          )}
        </View>
      </KeyboardAvoidingView>
      <Modal
        transparent
        visible={rateModal}
        onRequestClose={() => setRateModal(false)}
      >
        <ConfirmCancelModal
          heightSize={96}
          padding={10}
          blurIntensity={70}
          borderRounded={12}
          onClose={() => setRateModal(false)}
          onCancel={() => setRateModal(false)}
          onOk={() => {
            rateAndFeedbackUser();
            setRateModal(false);
          }}
        >
          <AppText color="dark" className="font-bold font-poppins text-lg m-2">
            Rate user: {userMessage?.user?.fullName}
          </AppText>
          <View className="flex-col m-auto pb-10 gap-4 ">
            <View className=" flex-row items-center gap-4 pl-5">
              <AntDesign
                name="star"
                onPress={() => setRateUser(1)}
                size={32}
                color={rateUser > 0 ? "#fadb14" : ""}
              />
              <AntDesign
                name="star"
                onPress={() => setRateUser(2)}
                size={32}
                color={rateUser > 1 ? "#fadb14" : ""}
              />
              <AntDesign
                name="star"
                onPress={() => setRateUser(3)}
                size={32}
                color={rateUser > 2 ? "#fadb14" : ""}
              />
              <AntDesign
                name="star"
                onPress={() => setRateUser(4)}
                size={32}
                color={rateUser > 3 ? "#fadb14" : ""}
              />
              <AntDesign
                name="star"
                onPress={() => setRateUser(5)}
                size={32}
                color={rateUser > 4 ? "#fadb14" : ""}
              />
            </View>
            <TextInput
              multiline
              placeholder="(Optional)"
              textAlignVertical="top"
              value={feedback}
              onChangeText={setFeedback}
              className="border-[1px] border-gray-500 h-28 w-72 rounded-lg"
            />
          </View>
        </ConfirmCancelModal>
      </Modal>
    </SafeAreaView>
  );
}
