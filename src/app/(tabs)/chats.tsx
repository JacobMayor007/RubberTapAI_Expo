import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import Loading from "@/src/components/LoadingComponent";
import Logo from "@/src/components/Logo";
import NavigationBar from "@/src/components/Navigation";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { useMessage } from "@/src/contexts/MessageContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { ChatRoom, Profile } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
dayjs.extend(utc);

export default function ChatBox() {
  const router = useRouter();
  const [visibleModal, setVisibleModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchUser, setSearchUser] = useState<Profile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const messageUser = useMessage();
  const { theme } = useTheme();
  const { user } = useAuth();

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

  useEffect(() => {
    const getChat = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/chat-room/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        setChatHistory(data);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setLoading(false);
      }
    };

    getChat();
  }, [user?.$id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim() === "") {
        setSearchUser([]);
        return;
      }

      const fetchProfile = async () => {
        try {
          setLoading(true);

          const response = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/search-user/${searchValue}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );

          const data = await response.json();

          setSearchUser(data);
        } catch (error) {
          console.error("Upload error:", error);
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 300);
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
      } else {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/chat-mate/${chatMate_id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        messageUser?.setUser(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <BackgroundGradient
        className={`flex-1 flex-col ${
          theme === "dark" ? `bg-[#101010]` : `bg-[#FFDFA9]`
        }`}
      >
        <View className="flex-1 flex-col gap-2 p-6 ">
          <View className="flex-row items-center gap-2 justify-between">
            <View className="flex-row gap-4 items-center">
              <FontAwesome5
                name="arrow-left"
                size={20}
                color={theme === "dark" ? "#E8C282" : "black"}
                onPress={() => router.back()}
              />
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-bold text-2xl tracking-wider"
              >
                Chat
              </AppText>
            </View>
            <Logo className="h-11 w-11" />
          </View>
          <View
            style={{
              boxShadow:
                theme === "dark"
                  ? "rgba(232, 194, 130, 0.2) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px"
                  : "",
            }}
            className={`mt-2 ${
              theme === "dark" ? `bg-[#202020]` : `bg-[rgb(43,43,43,0.2)]`
            }  h-11 rounded-2xl flex-row items-center gap-3 px-4`}
          >
            <Fontisto
              name="search"
              size={20}
              color={theme === "dark" ? `#E8C282` : `white`}
            />
            <AppText
              onPress={() => setVisibleModal(true)}
              className={`w-11/12 h-full pt-2.5 ${
                theme === "dark" ? `text-[#E2C282]` : `text-white`
              }`}
            >
              Search
            </AppText>
          </View>
          {loading ? (
            <Loading className="h-16 w-16 mx-auto" />
          ) : (
            <ScrollView className="flex-1 py-2 gap-2">
              {chatHistory.map((chat, chatIndex) => {
                const other = getOtherParticipant(chat);

                return (
                  <Link
                    onPress={async () => await handleMessageUser(other.id)}
                    href={"/(message)/messages"}
                    key={chat.$id || chatIndex}
                    className="flex-row py-2 mt-2 items-center"
                  >
                    <Image
                      source={{
                        uri:
                          chat.senderId === profile?.$id &&
                          chat.receiverId === profile?.$id
                            ? profile?.imageURL
                            : other?.profileURL,
                      }}
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                      }}
                    />

                    <View
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      <AppText
                        color={theme === "dark" ? "light" : "dark"}
                        className="font-poppins font-bold text-lg ml-2"
                      >
                        {other.username || "You"}
                      </AppText>

                      <View className="flex-row items-center gap-2 pl-2 ">
                        <AppText
                          className="text-sm font-light"
                          color={theme === "dark" ? "light" : "dark"}
                        >
                          {chat.senderId === profile?.$id
                            ? "You:"
                            : `${other.username.split(" ")[0]}:`}{" "}
                          {chat.lastMessage.length > 24
                            ? `${chat?.lastMessage.slice(0, 24)}...`
                            : chat?.lastMessage}
                        </AppText>
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="font-bold"
                        >
                          &#8226;
                        </AppText>
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-sm font-light"
                        >
                          {dayjs(chat.$createdAt).local().format("hh:mm A")}
                        </AppText>
                      </View>
                    </View>
                  </Link>
                );
              })}
            </ScrollView>
          )}
        </View>
        <NavigationBar active="market" />
      </BackgroundGradient>

      <Modal
        visible={visibleModal}
        animationType="slide"
        onRequestClose={() => {
          setVisibleModal(false);
        }}
      >
        <BackgroundGradient className=" flex-1 flex-col  p-6 ">
          <View className="flex-row gap-4 items-center">
            <FontAwesome5
              name="arrow-left"
              size={20}
              color={theme === "dark" ? `#E2C282` : `black`}
              onPress={() => {
                setVisibleModal(false);
              }}
            />
            <View
              style={{
                boxShadow:
                  theme === "dark"
                    ? "rgba(232, 194, 130, 0.2) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px"
                    : "",
              }}
              className="bg-[rgb(43,43,43,0.2)] h-12 w-11/12 rounded-3xl gap-2 flex-row items-center px-2"
            >
              <Logo className="h-10 w-10 mt-1 " />
              <TouchableOpacity className="h-full w-10/12 ">
                <TextInput
                  placeholder="Search user"
                  value={searchValue}
                  onChangeText={setSearchValue}
                  placeholderTextColor={theme === "dark" ? `#E2C282` : `black`}
                  className={`h-full w-full border-none  placeholder:font-poppins placeholder:font-extrabold ${
                    theme === "dark" ? `text-[#E2C282]` : `text-black`
                  }`}
                />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView className={loading ? `pt-10` : `pt-0`}>
            {loading ? (
              <Loading className="h-16 w-16  mx-auto" />
            ) : (
              <View className="mt-4">
                {searchValue.length < 1 && (
                  <AppText color={theme === "dark" ? `light` : `dark`}>
                    Please input a name on the search bar to search a user.
                  </AppText>
                )}

                {searchUser.length === 0 && searchValue.length > 1 && (
                  <AppText color={theme === "dark" ? `light` : `dark`}>
                    There are no username, or email named{" "}
                    <AppText
                      color={theme === "dark" ? `light` : `dark`}
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
                      className={`flex-row items-center mb-2 border-b-[0.5px] py-2 ${
                        theme === "dark" ? `border-[#E2C282]` : `border-black`
                      }`}
                    >
                      <Image
                        style={{ height: 48, width: 48 }}
                        className="h-12 w-12 rounded-full"
                        source={{ uri: data.imageURL }}
                      />
                      <View className="ml-2 justify-center flex-col">
                        <AppText
                          color={theme === "dark" ? `light` : `dark`}
                          className="font-poppins font-bold"
                        >
                          Email: {data.email}
                        </AppText>
                        <AppText
                          color={theme === "dark" ? `light` : `dark`}
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
        </BackgroundGradient>
      </Modal>
    </SafeAreaView>
  );
}
