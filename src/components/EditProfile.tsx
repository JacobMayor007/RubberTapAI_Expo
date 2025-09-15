import { Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { editEmail, editName } from "../action/userAction";
import { useAuth } from "../contexts/AuthContext";
import { account } from "../lib/appwrite";
import { AppText } from "./AppText";
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
        setEmail(data?.email);
        setName(data?.username);
      } catch (error) {
        console.error("Upload error:", error);
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

  console.log(name);

  return (
    <View className="bg-[#FFECCC] flex-1 ">
      <View className="flex-row items-center gap-7 m-6">
        <Feather
          name="arrow-left"
          size={28}
          onPress={() => setVisibleModal(false)}
        />
        <AppText color="dark" className="font-poppins font-bold text-2xl">
          Edit Profile
        </AppText>
      </View>
      <LinearGradient
        colors={["#75A90A", "#046A10"]}
        style={{
          width: "100%",
          height: 96,
        }}
      />
      <View className="m-6">
        <Image
          src={profile?.imageURL}
          fadeDuration={300}
          className="h-16 w-16 rounded-full bg-[#fee0ac]"
        />
        <AppText color="dark" className="font-poppins font-bold text-lg mt-4">
          Name:
        </AppText>
        <View
          className={`${editProfile === "name" ? `border-[1px] rounded-md border-green-500 px-4 ` : `border-b-[0.5px]`} flex-row items-center justify-between`}
        >
          <TextInput
            readOnly={editProfile === "name" ? false : true}
            className={`w-9/12 text-lg`}
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
                color="#001A6E"
              />
            </TouchableOpacity>
          )}
        </View>
        <AppText color="dark" className="font-poppins font-bold text-lg mt-5">
          Email:
        </AppText>
        <View
          className={`border-b-[0.5px] flex-row items-center justify-between`}
        >
          <TextInput
            readOnly={editProfile === "email" ? false : true}
            className="text-lg"
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
              color="#001A6E"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-end mt-4">
          <AppText color="light" className="bg-[#75A90A] p-3 rounded-full">
            Change Password
          </AppText>
        </TouchableOpacity>
      </View>

      <Modal visible={confirmModal} transparent>
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
              color="dark"
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
              <AppText color="dark" className="font-poppins text-lg font-bold">
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
              <Loading className="h-14 w-14 m-auto pb-4" />
            ) : (
              <AppText
                color="dark"
                className="m-auto text-center font-bold text-lg"
              >
                Do you want to confirm your update on your email?
              </AppText>
            )}
          </ConfirmCancelModal>
        )}
      </Modal>
    </View>
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
