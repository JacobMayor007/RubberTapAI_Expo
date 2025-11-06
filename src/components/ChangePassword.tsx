import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, TextInput, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { account } from "../lib/appwrite";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";
import { Button } from "./Button";
import ConfirmCancelModal from "./ConfirmOrCancelModal";
import Loading from "./LoadingComponent";

type ChangePasswordProps = {
  setConfirmModal: (visible: boolean) => void;
};

export default function ChangePassword({
  setConfirmModal,
}: ChangePasswordProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <BackgroundGradient className="flex-1 ">
      <View className="flex-1 p-6 gap-4">
        <View className="flex-row items-center gap-1">
          <Feather
            onPress={() => setConfirmModal(false)}
            name="arrow-left"
            size={32}
          />
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-xl font-bold"
          >
            Change Password
          </AppText>
        </View>
        <InputPasswords />
      </View>
    </BackgroundGradient>
  );
}

function InputPasswords() {
  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [focusedInput, setFocusedInput] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState(false);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const changePasswordHandle = async () => {
    try {
      setLoading(true);
      await account.updatePassword({
        password: password.newPassword,
        oldPassword: password.oldPassword,
      });

      Alert.alert("You have successfully change your password");

      setPassword({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error occured", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleButton = () => {
    try {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

      if (!password.oldPassword) {
        Alert.alert("Required field", "Please enter your old password");
        return;
      }

      if (!password.newPassword) {
        Alert.alert("Required field", "Please enter your new password");
        return;
      }
      if (!password.confirmNewPassword) {
        Alert.alert("Required field", "Please enter your new confirm password");
        return;
      }

      if (password.newPassword !== password.confirmNewPassword) {
        Alert.alert(
          "Password Mismatch",
          "Confirm Password does not match Password."
        );
        return;
      }

      if (!regex.test(password.newPassword)) {
        Alert.alert(
          "Invalid Password",
          "Your password must have a capital letter, a symbol, and at least 8 characters."
        );
        return;
      }

      if (password.newPassword.length < 9) {
        Alert.alert(
          "Password Invalid",
          "Password must be more than 8 characters!",
          [
            {
              text: "Ok",
              style: "default",
            },
          ]
        );
        return;
      }

      setModal(true);
    } catch (error) {
      Alert.alert("Error occured", "Wrong Credentials");
    }
  };

  return (
    <>
      <View className="relative ">
        <TextInput
          value={password.oldPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={"#000000"}
          onFocus={() => setFocusedInput("second")}
          onBlur={() => setFocusedInput("")}
          placeholder="Old Password"
          className={`h-14 text-white border-2 rounded-md pl-4 pr-12 ${
            focusedInput === "second"
              ? "border-green-800 border-[2px] bg-[#E8C282]/30"
              : "border-black border-[1px]"
          }`}
          onChangeText={(e) => setPassword({ ...password, oldPassword: e })}
        />
        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-4"
        >
          {showPassword ? (
            <Feather name="eye" size={20} color={"#000000"} />
          ) : (
            <Feather name="eye-off" color={"#000000"} size={20} />
          )}
        </Pressable>
      </View>
      <View className="relative">
        <TextInput
          value={password.newPassword}
          onChangeText={(e) => setPassword({ ...password, newPassword: e })}
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor={"#000000"}
          placeholder="New Password"
          onFocus={() => setFocusedInput("sixth")}
          onBlur={() => setFocusedInput("")}
          className={`h-14 text-slate-100 border-2 rounded-md px-4 ${
            focusedInput === "sixth"
              ? "border-green-800 border-[2px] bg-[#E8C282]/30"
              : "border-black border-[1px]"
          }`}
        />
        <Pressable
          onPress={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-4 top-4"
        >
          {showConfirmPassword ? (
            <Feather name="eye" size={20} color={"#000000"} />
          ) : (
            <Feather name="eye-off" color={"#000000"} size={20} />
          )}
        </Pressable>
      </View>
      <View className="relative">
        <TextInput
          value={password.confirmNewPassword}
          onChangeText={(e) =>
            setPassword({ ...password, confirmNewPassword: e })
          }
          secureTextEntry={!showConfirmNewPassword}
          placeholderTextColor={"#000000"}
          placeholder="Confirm New Password"
          onFocus={() => setFocusedInput("seventh")}
          onBlur={() => setFocusedInput("")}
          className={`h-14 text-slate-100 border-2 rounded-md px-4 ${
            focusedInput === "seventh"
              ? "border-green-800 border-[2px] bg-[#E8C282]/30"
              : "border-black border-[1px]"
          }`}
        />
        <Pressable
          onPress={() => setShowConfirmNewPassword((prev) => !prev)}
          className="absolute right-4 top-4"
        >
          {showConfirmNewPassword ? (
            <Feather name="eye" size={20} color={"#000000"} />
          ) : (
            <Feather name="eye-off" color={"#000000"} size={20} />
          )}
        </Pressable>
      </View>

      <Button
        title="Save"
        style={{
          alignSelf: "flex-end",
          paddingHorizontal: 24,
          paddingVertical: 7,
        }}
        onPress={() => {
          handleButton();
        }}
      />

      <Modal visible={modal} onRequestClose={() => setModal(false)}>
        {loading ? (
          <Loading className="h-16 w-16" />
        ) : (
          <ConfirmCancelModal
            heightSize={60}
            blurIntensity={60}
            borderRounded={10}
            padding={16}
            onCancel={() => setModal(false)}
            onClose={() => setModal(false)}
            onOk={async () => {
              changePasswordHandle();
              setModal(false);
            }}
          >
            <AppText
              className="m-auto pb-5 font-poppins font-bold text-green-800 text-lg text-center"
              color={theme === "dark" ? `light` : `dark`}
            >
              Do you want to confirm to change your password?
            </AppText>
          </ConfirmCancelModal>
        )}
      </Modal>
    </>
  );
}
