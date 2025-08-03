import { getChatRoom } from "@/src/action/messageAction";
import {
  getChatMate,
  getUserByIdDirect,
  queryUser,
} from "@/src/action/userAction";
import { AppText } from "@/src/components/AppText";
import Logo from "@/src/components/Logo";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { useMessage } from "@/src/contexts/MessageContext";
import { ChatRoom, User } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ChatBox() {
  const router = useRouter();
  const [visibleModal, setVisibleModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchUser, setSearchUser] = useState<User[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const messageUser = useMessage();
  const { user } = useAuth();

  useEffect(() => {
    handleFirstLoad();
  }, []);

  const handleFirstLoad = async () => {
    try {
      await getChat(user?.$id || "");
    } catch (e) {
      console.error(e);
    }
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

  const getChat = async (user_id: string) => {
    try {
      const chatRooms = await getChatRoom(user_id);
      console.log(chatRooms);
      setChatHistory(chatRooms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim() === "") {
        setSearchUser([]);
        return;
      }

      const fetchProfile = async () => {
        try {
          setLoading(true);
          const userProfile = await queryUser(searchValue);
          setSearchUser(userProfile);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const getOtherParticipant = (chat: ChatRoom) => {
    const otherIndex = chat.participants.findIndex((id) => id !== profile?.$id);
    return {
      id: chat.participants[otherIndex],
      username: chat.participants_username[otherIndex],
      profileURL: chat.participants_profile[otherIndex],
    };
  };

  const handleMessageUser = async (chatMate_id: string) => {
    try {
      if (!chatMate_id) {
        messageUser?.setUser(profile);
        router.push("/(message)/messages");
      } else {
        const chatMate = await getChatMate(chatMate_id);
        messageUser?.setUser(chatMate);
        console.log("Chat Mate Not Self: ", messageUser?.user);
        router.push("/(message)/messages");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 flex-col gap-2 p-6 bg-[#E8DFD0] border">
        <View className="flex-row items-center  gap-2 justify-between">
          <View className="flex-row gap-4 items-center">
            <FontAwesome5
              name="arrow-left"
              size={20}
              onPress={() => router.back()}
            />
            <AppText
              color={"dark"}
              className="font-poppins font-bold text-2xl tracking-wider"
            >
              Chat
            </AppText>
          </View>
          <Logo className="h-11 w-11" />
        </View>
        <View className="mt-2  bg-[rgb(43,43,43,0.2)] h-11 rounded-2xl flex-row items-center gap-3 px-4">
          <Fontisto name="search" size={20} color={`white`} />
          <AppText
            color={"light"}
            onPress={() => setVisibleModal(true)}
            className="w-11/12 h-full pt-2.5"
          >
            Search
          </AppText>
        </View>
        {loading ? (
          <ActivityIndicator animating size={"large"} />
        ) : (
          <ScrollView className="flex-1 py-2">
            {chatHistory.map((chat, chatIndex) => {
              const other = getOtherParticipant(chat);

              return (
                <ViewPressable
                  onPress={() => handleMessageUser(other.id)}
                  key={chat.$id || chatIndex}
                  className="flex-row items-center gap-4 p-4"
                >
                  <Image
                    source={
                      chat.senderId === profile?.$id &&
                      chat.receiverId === profile?.$id
                        ? { uri: profile?.imageURL }
                        : other.profileURL
                          ? { uri: other.profileURL }
                          : require("@/assets/images/anonymous_profile.png")
                    }
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 22.5,
                    }}
                  />

                  <View className="flex-1">
                    <AppText
                      color="dark"
                      className="font-poppins font-bold text-lg"
                    >
                      {other.username || "You"}
                    </AppText>

                    <View className="flex-row items-center gap-2">
                      <AppText className="text-sm font-light" color="dark">
                        {chat.senderId === profile?.$id
                          ? "You:"
                          : `${other.username}:`}{" "}
                        {chat.lastMessage}
                      </AppText>

                      <AppText color="dark" className="font-bold">
                        &#8226;
                      </AppText>

                      <AppText color="dark" className="text-sm font-light">
                        {dayjs(chat.$createdAt).local().format("hh:mm A")}
                      </AppText>
                    </View>
                  </View>
                </ViewPressable>
              );
            })}
          </ScrollView>
        )}
      </View>
      <Modal
        visible={visibleModal}
        animationType="slide"
        onRequestClose={() => {
          setVisibleModal(false);
        }}
      >
        <View className=" flex-1 flex-col  p-6 bg-[#E8DFD0]">
          <View className="flex-row gap-4 items-center">
            <FontAwesome5
              name="arrow-left"
              size={20}
              onPress={() => {
                setVisibleModal(false);
              }}
            />
            <View className="bg-[rgb(43,43,43,0.2)] h-12 w-11/12 rounded-3xl gap-2 flex-row items-center px-2">
              <Logo className="h-10 w-10 mt-1 " />
              <TouchableOpacity className="h-full w-10/12 ">
                <TextInput
                  placeholder="Search user"
                  value={searchValue}
                  onChangeText={setSearchValue}
                  className="h-full w-full border-none  placeholder:font-poppins placeholder:font-extrabold placeholder:text-slate-800"
                />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView>
            {loading ? (
              <ActivityIndicator
                style={{ marginTop: 20 }}
                animating
                size="large"
              />
            ) : (
              <View className="mt-4">
                {searchValue.length < 1 && (
                  <AppText color={"dark"}>
                    Please input a name on the search bar to search a user.
                  </AppText>
                )}

                {searchUser.length === 0 && searchValue.length > 1 && (
                  <AppText color={"dark"}>
                    There are no username, or email named{" "}
                    <AppText
                      color={"dark"}
                      className="font-poppins font-bold italic"
                    >
                      {searchValue}
                    </AppText>
                  </AppText>
                )}

                {searchUser.map((data, index) => {
                  return (
                    <ViewPressable
                      onPress={() => {
                        messageUser.setUser(data);
                        router.push("/(message)/messages");
                      }}
                      key={index}
                      className="flex-row items-center mb-2 border-b-[0.5px] py-2 border-black"
                    >
                      <Image
                        style={{ height: 48, width: 48 }}
                        className="h-12 w-12 rounded-full"
                        source={
                          data.imageURL
                            ? { uri: data.imageURL }
                            : require("@/assets/images/anonymous_profile.png")
                        }
                      />
                      <View className="ml-2 justify-center flex-col">
                        <AppText
                          color={"dark"}
                          className="font-poppins font-bold"
                        >
                          Email: {data.email}
                        </AppText>
                        <AppText
                          color={"dark"}
                          className="font-poppins font-medium"
                        >
                          Username: {data.username}
                        </AppText>
                      </View>
                    </ViewPressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
