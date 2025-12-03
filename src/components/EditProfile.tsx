import { Profile } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { editEmail, editName, updateProfileAction } from "../action/userAction";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { account } from "../lib/appwrite";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";
import ChangePassword from "./ChangePassword";
import ConfirmCancelModal from "./ConfirmOrCancelModal";
import Loading from "./LoadingComponent";

type AppearanceProps = {
  setVisibleModal: (visible: boolean) => void;
};

export default function EditProfile({ setVisibleModal }: AppearanceProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user, logout } = useAuth();
  const [editProfile, setEditProfile] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uri, setUri] = useState("");
  const { theme } = useTheme();
  const [userVerification, setUserVerification] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingPage(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data: Profile = await response.json();
        setProfile(data);
        setEmail(data?.email);
        setName(data?.fullName);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setLoadingPage(false);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  const handleEditName = async () => {
    try {
      setLoading(true);
      const response = await editName(
        name,
        profile?.$id || "",
        profile?.API_KEY || ""
      );

      const data = await response?.json();
      Alert.alert(data.title, data.message);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setConfirmModal(false);
      setEditProfile("");
    }
  };

  const handleEditEmail = async () => {
    try {
      setLoading(true);
      const response = await editEmail(
        newEmail,
        profile?.$id || "",
        profile?.API_KEY || "",
        password
      );

      const data = await response?.json();

      Alert.alert(data.title, data.message, [
        {
          text: "OK",
          onPress: () => {
            account.deleteSession("current");
            router.dismissAll();
            router.replace("/(auth)");
            setLoading(false);
            setConfirmModal(false);
            setEditProfile("");
          },
        },
      ]);
      setEmail(newEmail);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error occured, please try again!");
    } finally {
      setLoading(false);
      setConfirmModal(false);
      setEditProfile("");
    }
  };

  const pickAnImage = async () => {
    try {
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
        setUri(selectedUris);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEditProfile("confirmProfilePic");
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      await updateProfileAction(user?.$id || "", profile?.API_KEY || "", uri);
    } catch (error) {
      console.error(error);
    } finally {
      setEditProfile("");
      setConfirmModal(false);
      setLoading(false);
      useAuth();
    }
  };

  console.log(theme);

  const isUserVerified = () => {
    if (!user?.emailVerification) {
      if (userVerification) {
        Alert.alert("Already been sent to your email, please check!");
        return;
      }

      Alert.alert(
        "Account Verification",
        "Do you want to verify your account?",
        [
          {
            text: "Not Now",
            onPress: () => console.log("Cancel"),
            style: "cancel",
          },
          {
            text: "Ok",
            onPress: async () => {
              try {
                setUserVerification(true);

                const result = await account.createVerification({
                  url: "https://rubbertapai.netlify.app/",
                });
                console.log("Verification email sent:", result);

                Alert.alert(
                  "Verification email sent",
                  "Please check your email"
                );
              } catch (error) {
                console.error("Failed to send verification:", error);
              }
            },
          },
        ]
      );
    }
  };

  if (loadingPage) {
    return (
      <SafeAreaView className="flex-1">
        <BackgroundGradient className="flex-1 items-center justify-center">
          <Loading className="h-16 w-16 my-auto" />
        </BackgroundGradient>
      </SafeAreaView>
    );
  }
  return (
    <BackgroundGradient className="flex-1 ">
      <View className="flex-row items-center gap-7 m-6">
        <Feather
          name="arrow-left"
          size={28}
          color={theme === "dark" ? `#E8C282` : `black`}
          onPress={() => setVisibleModal(false)}
        />
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold text-2xl"
        >
          Edit Profile
        </AppText>
      </View>

      <View className="m-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-end ">
            <Image
              src={uri ? uri : profile?.imageURL}
              fadeDuration={300}
              className="h-16 w-16 rounded-full bg-[#fee0ac]"
            />
            <TouchableOpacity>
              <MaterialIcons
                name="edit"
                size={20}
                onPress={() => {
                  setEditProfile("profile");
                  setConfirmModal(true);
                }}
                color={theme === "dark" ? `#E2C282` : `"#001A6E"`}
              />
            </TouchableOpacity>
          </View>
          {!user?.emailVerification ? (
            <TouchableOpacity
              onPress={isUserVerified}
              className={`bg-red-500 flex-row gap-2 items-center px-4 py-2 rounded-full `}
            >
              <AppText className="text-white">Verify email</AppText>
            </TouchableOpacity>
          ) : (
            <View
              className={` bg-[#75A90A] flex-row gap-2 items-center px-4 py-2 rounded-full `}
            >
              <AppText className="text-white">Verified </AppText>
              <AntDesign name="check" color={"white"} />
            </View>
          )}
        </View>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold text-lg mt-4"
        >
          Name:
        </AppText>
        <View
          className={`${editProfile === "name" ? `border-[1px] rounded-md border-green-500 px-4 ` : `border-b-[0.5px] ${theme === "dark" ? `border-[#E2C282]` : ``}`} flex-row items-center justify-between`}
        >
          <TextInput
            readOnly={editProfile === "name" ? false : true}
            className={`w-9/12 text-lg ${theme === "dark" ? `text-[#E8C282]` : `text-black`}`}
            value={name}
            onChangeText={(e) => setName(e)}
          />
          {editProfile === "name" ? (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity>
                <MaterialIcons
                  name="cancel"
                  color="#E62727"
                  size={24}
                  onPress={() => {
                    setEditProfile("");
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color="#77B254"
                  onPress={() => setConfirmModal(true)}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity>
              <MaterialIcons
                name="edit"
                size={20}
                onPress={() => {
                  setEditProfile("name");
                }}
                color={theme === "dark" ? `#E2C282` : `"#001A6E"`}
              />
            </TouchableOpacity>
          )}
        </View>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold text-lg mt-5"
        >
          Email:
        </AppText>
        <View
          className={`${theme === "dark" ? `border-[#E2C282]` : ``} border-b-[0.5px] flex-row items-center justify-between`}
        >
          <TextInput
            readOnly={editProfile === "email" ? false : true}
            className={`text-lg ${theme === "dark" ? `text-[#E8C282]` : `text-black`}`}
            value={email}
          />

          <TouchableOpacity>
            <MaterialIcons
              name="edit"
              size={20}
              onPress={() => {
                setEditProfile("email");
                setConfirmModal(true);
              }}
              color={theme === "dark" ? `#E2C282` : `"#001A6E"`}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setConfirmModal(true);
            setEditProfile("changePassword");
          }}
          className="items-end mt-4"
        >
          <AppText className={`text-white bg-[#75A90A] p-3 rounded-full`}>
            Change Password
          </AppText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={confirmModal}
        transparent
        onRequestClose={() => setConfirmModal(false)}
      >
        {editProfile === "name" && (
          <ConfirmCancelModal
            heightSize={72}
            blurIntensity={50}
            padding={12}
            borderRounded={7}
            onCancel={() => {
              setConfirmModal(false);
              setEditProfile("");
            }}
            onClose={() => setConfirmModal(false)}
            onOk={handleEditName}
          >
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="m-auto text-center font-bold text-lg"
            >
              Do you want to confirm your update on your name?
            </AppText>
          </ConfirmCancelModal>
        )}
        {editProfile === "email" && (
          <ConfirmCancelModal
            heightSize={96}
            blurIntensity={50}
            padding={12}
            borderRounded={7}
            onCancel={() => {
              setConfirmModal(false);
              setEditProfile("");
            }}
            onClose={() => setConfirmModal(false)}
            onOk={() => setEditProfile("confirmEmail")}
          >
            <View className="mt-8 gap-4 ">
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="font-poppins text-lg font-bold"
              >
                Enter credentials to update:
              </AppText>
              <TextInput
                placeholderTextColor="#797979"
                className="border-[1px] rounded-md text-black"
                placeholder="Please enter your new email"
                onChangeText={(e) => setNewEmail(e)}
              />
              <TextInput
                placeholderTextColor="#797979"
                secureTextEntry
                className="border-[1px] rounded-md text-black"
                placeholder="Please enter your current password"
                onChangeText={(e) => setPassword(e)}
              />
            </View>
          </ConfirmCancelModal>
        )}
        {editProfile === "confirmEmail" && (
          <ConfirmCancelModal
            heightSize={96}
            blurIntensity={50}
            padding={12}
            borderRounded={7}
            onCancel={() => {
              setConfirmModal(false);
              setEditProfile("");
            }}
            onClose={() => setConfirmModal(false)}
            onOk={handleEditEmail}
          >
            {loading ? (
              <Loading className="h-16 w-16 m-auto pb-4" />
            ) : (
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="m-auto text-center font-bold text-lg"
              >
                Do you want to confirm your update on your email?
              </AppText>
            )}
          </ConfirmCancelModal>
        )}
        {editProfile === "profile" && (
          <ConfirmCancelModal
            heightSize={60}
            blurIntensity={50}
            padding={12}
            borderRounded={7}
            onCancel={() => {
              setConfirmModal(false);
              setEditProfile("");
            }}
            onClose={() => setConfirmModal(false)}
            onOk={pickAnImage}
          >
            {loading ? (
              <Loading className="h-16 w-16 m-auto pb-4" />
            ) : (
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="m-auto text-center font-bold text-lg"
              >
                Do you want to change your profile picture?
              </AppText>
            )}
          </ConfirmCancelModal>
        )}
        {editProfile === "confirmProfilePic" && (
          <ConfirmCancelModal
            heightSize={96}
            blurIntensity={100}
            padding={12}
            borderRounded={7}
            onCancel={() => {
              setConfirmModal(false);
              setUri("");
              setEditProfile("");
            }}
            onClose={() => {
              setConfirmModal(false);
              setUri("");
            }}
            onOk={updateProfile}
          >
            {loading ? (
              <Loading className="h-16 w-16 m-auto pb-4" />
            ) : (
              <View className="flex-col items-center justify-center mt-2 gap-5">
                <Image src={uri} width={102} height={102} borderRadius={50} />
                <AppText
                  color={theme === "dark" ? `light` : `dark`}
                  className="m-auto text-center font-bold text-lg"
                >
                  Do you want to use this as your profile picture?
                </AppText>
              </View>
            )}
          </ConfirmCancelModal>
        )}

        {editProfile === "changePassword" && (
          <ChangePassword setConfirmModal={setConfirmModal} />
        )}
      </Modal>
    </BackgroundGradient>
  );
}

// {editProfile === "email" ? (
//             <View className="flex-row items-center gap-2">
//               <TouchableOpacity>
//                 <MaterialIcons
//                   name="cancel"
//                   color="#E62727"
//                   size={24}
//                   onPress={() => {
//                     setEditProfile("");
//                   }}
//                 />
//               </TouchableOpacity>
//               <TouchableOpacity>
//                 <MaterialIcons
//                   name="check-circle"
//                   size={24}
//                   color="#77B254"
//                   onPress={() => setConfirmModal(true)}
//                 />
//               </TouchableOpacity>
//             </View>
//           ) : (
