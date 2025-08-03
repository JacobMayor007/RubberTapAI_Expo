import { getOthersProduct, getUserProduct } from "@/src/action/productAction";
import AddProduct from "@/src/components/AddProduct";
import { AppText } from "@/src/components/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { account } from "@/src/lib/appwrite";
import { Product } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Market() {
  const router = useRouter();
  const [addProductModal, setAddProductModal] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProduct, setMyProduct] = useState<Product[]>([]);
  const [otherProduct, setOtherProduct] = useState<Product[]>([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [userVerification, setUserVerification] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const getMyProduct = async () => {
      try {
        const product = await getUserProduct(user?.$id || "");
        setMyProduct(product);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getMyProduct();
  }, []);

  useEffect(() => {
    const getMyProduct = async () => {
      try {
        const product = await getOthersProduct(user?.$id || "");
        setOtherProduct(product);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getMyProduct();
  }, []);

  const isUserVerified = () => {
    if (!user?.emailVerification) {
      if (userVerification) {
        Alert.alert("Already been sent to your email, please check!");
        return;
      }
      Alert.alert("Account Verification", "Please verified your account!", [
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

              const result = await account.createVerification(
                "https://rubbertapai.netlify.app/"
              );
              console.log("Verification email sent:", result);

              Alert.alert("Verification email sent", "Please check your email");
            } catch (error) {
              console.error("Failed to send verification:", error);
            }
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View
        className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#E8DFD0]`} flex-col justify-between`}
      >
        <View className="px-6 pt-10 flex-1  ">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-4">
              <FontAwesome5
                name="arrow-left"
                size={20}
                onPress={() => router.back()}
                color={theme === "dark" ? "white" : "black"}
              />
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-extrabold text-2xl"
              >
                Marketplace
              </AppText>
            </View>
            <AntDesign
              name="message1"
              size={23}
              onPress={() => router.push("/(message)")}
              color={theme === "dark" ? "white" : "black"}
            />
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <AppText
              color={theme === "dark" ? "light" : "dark"}
              className="font-poppins font-bold text-xl"
            >
              {`Latex & \nWaste Rubber Trade`}
            </AppText>
            <TouchableOpacity
              onPress={() => {
                !user?.emailVerification
                  ? isUserVerified()
                  : setAddProductModal(true);
              }}
              className={`${theme === "dark" ? `bg-green-700` : `bg-[#75A90A]`} flex-row gap-2 items-center px-4 py-2 rounded-full `}
            >
              <AppText color={`light`} className="font-poppins font-semibold">
                Add Your Product
              </AppText>
              <Feather size={20} color={"white"} name="plus-circle" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator animating size={"large"} />
          ) : (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }}
            >
              <View className="flex-row justify-between items-center mb-2">
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-poppins font-bold text-lg"
                >
                  Your Products
                </AppText>
                <TouchableOpacity>
                  <AppText
                    className={`font-poppins font-bold text-sm ${theme === "dark" ? `text-white` : `text-green-700`}  italic underline`}
                  >
                    View Your Products
                  </AppText>
                </TouchableOpacity>
              </View>
              <View className="gap-2 py-2">
                {myProduct?.slice(0, 2).map((data, index) => (
                  <Pressable
                    style={{
                      boxShadow:
                        "1px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    }}
                    className={`${theme === "dark" ? `bg-slate-700` : `bg-[#F3E0C1]`} whitespace-nowrap rounded-lg w-[47%] h-64 pb-3 overflow-hidden`}
                    key={index}
                  >
                    <Image
                      className="h-[40%] rounded-t-lg"
                      source={{ uri: data?.productURL }}
                    />
                    <View className="ml-2 mt-3 flex-row items-center">
                      <FontAwesome6
                        name="peso-sign"
                        size={15}
                        color={theme === "dark" ? "light" : "dark"}
                      />
                      <AppText
                        color={theme === "dark" ? "light" : "dark"}
                        className="ml-1"
                      >
                        {data?.price.toString()} /Kg
                      </AppText>
                    </View>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="capitalize ml-2 mt-2"
                    >
                      {data?.category}
                    </AppText>
                    <View className="ml-2 mt-2 pr-2">
                      <Text numberOfLines={1} ellipsizeMode="tail">
                        {data?.city}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setViewProduct(data);
                        setViewModal(true);
                      }}
                      className="h-9 bg-[#10B981] mx-2 rounded-full items-center justify-center mt-4"
                    >
                      <AppText
                        color={theme === "dark" ? "light" : "dark"}
                        className="text-xs"
                      >
                        View Details
                      </AppText>
                    </TouchableOpacity>
                  </Pressable>
                ))}
              </View>

              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-bold text-lg my-4"
              >
                Other Farmers Products
              </AppText>
              <View className="gap-4 flex-row flex-wrap justify-between">
                {otherProduct?.map((data, index) => (
                  <Pressable
                    key={index}
                    style={{
                      boxShadow:
                        "1px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    }}
                    className={`${theme === "dark" ? `bg-slate-700` : `bg-[#F3E0C1]`} whitespace-nowrap rounded-lg w-[47%] h-64 pb-3 overflow-hidden`}
                  >
                    <Image
                      className="h-[40%] rounded-t-lg "
                      source={{ uri: data?.productURL }}
                    />
                    <View className="ml-2 mt-3  flex-row items-center">
                      <FontAwesome6
                        name="peso-sign"
                        size={15}
                        color={theme === "dark" ? "white" : "black"}
                      />
                      <AppText
                        color={theme === "dark" ? "light" : "dark"}
                        className="ml-1"
                      >
                        {data?.price.toString()} /Kg
                      </AppText>
                    </View>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className=" capitalize ml-2 mt-2"
                    >
                      {data?.category}
                    </AppText>
                    <View className="ml-2 mt-2 pr-2 ">
                      <Text
                        className={`${theme === "dark" ? `text-white` : `text-black`}`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {data?.city}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setViewProduct(data);
                        setViewModal(true);
                      }}
                      className={`h-9 ${theme === "dark" ? `bg-green-800` : `bg-[#10B981]`} mx-2 rounded-full items-center justify-center mt-4`}
                    >
                      <AppText color="light" className="text-xs">
                        View Details
                      </AppText>
                    </TouchableOpacity>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
        <View
          className={`mt-2 ${theme === "dark" ? `bg-gray-900 border-t-[1px] border-white` : `bg-white`} h-20 flex-row items-center  justify-between px-7 pb-2`}
        >
          <Feather
            name="menu"
            size={24}
            onPress={() => router.push("/(tabs)/menu")}
            color={theme === "dark" ? `white` : `black`}
          />

          <Feather
            name="camera"
            size={24}
            onPress={() => router.push("/(camera)")}
            color={theme === "dark" ? `white` : `black`}
          />
          <Entypo
            name="home"
            size={32}
            onPress={() => router.push("/(tabs)")}
            color={theme === "dark" ? `white` : `black`}
          />
          <View
            className={`mb-16 h-20 w-20 rounded-full ${theme === "dark" ? `bg-gray-900 border-[1px] border-white` : `bg-white`} items-center justify-center p-1.5`}
          >
            <View
              className={`${theme === "dark" ? `bg-gray-900` : `bg-white`}h-full w-full rounded-full items-center justify-center`}
            >
              <FontAwesome6
                name="arrow-trend-up"
                size={20}
                color={theme === "dark" ? `white` : `black`}
              />
            </View>
          </View>
          <FontAwesome6
            name="clock-rotate-left"
            size={20}
            color={theme === "dark" ? `white` : `black`}
          />
        </View>
      </View>
      <Modal
        onRequestClose={() => setAddProductModal(false)}
        visible={addProductModal}
        animationType="slide"
      >
        <AddProduct />
      </Modal>
      <Modal
        visible={viewModal}
        animationType="slide"
        style={{ flexGrow: 1 }}
        transparent
        onRequestClose={() => setViewModal(false)}
      >
        <View className="bg-black/30 flex-1">
          <View
            style={{
              flexGrow: 1,
            }}
            className="items-center, justify-center px-4 "
          >
            <View
              className={`${theme === "dark" ? `bg-gray-900` : `bg-[#F3E0C1]`} p-6 h-[27%] rounded-xl flex-row gap-4`}
            >
              <Feather
                name="x"
                size={24}
                color={theme === "dark" ? "white" : "black"}
                onPress={() => setViewModal(false)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 8,
                }}
              />
              <View className="gap-2 w-[45%] ">
                <Image
                  className="h-24  rounded-md"
                  source={{ uri: viewProduct?.productURL }}
                />
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-extralight font-poppins text-sm"
                >
                  Seller's Details
                </AppText>
                <View className="flex-row items-center gap-2 overflow-hidden ">
                  <Image
                    className="h-9 w-9 rounded-full"
                    source={
                      !viewProduct?.farmerProfile
                        ? require("@/assets/images/anonymous_profile.png")
                        : { uri: viewProduct?.farmerProfile }
                    }
                  />
                  <View className="flex-col gap-1 justify-center overflow-hidden flex-wrap">
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-poppins capitalize font-bold text-lg"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {viewProduct?.user_username}
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-poppins font-light capitalize"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {viewProduct?.region},{`\n`}
                      {viewProduct?.city}
                    </AppText>
                  </View>
                </View>
              </View>
              <View className="gap-2 w-[50%] overflow-hidden flex-col justify-between">
                <View>
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-poppins font-bold capitalize"
                  >
                    {viewProduct?.category}
                  </AppText>
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-poppins text-lg font-bold capitalize"
                  >
                    <FontAwesome6 name="peso-sign" size={14} color={"black"} />{" "}
                    {viewProduct?.price} / Kg
                  </AppText>
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="text-sm font-poppins py-0.5 leading-6 tracking-wider"
                    numberOfLines={4}
                  >
                    {viewProduct?.description}{" "}
                    alksdjalsdasjasdkjaslkdjlkasjdlkajsdlkajsa
                  </AppText>
                </View>
                <TouchableOpacity className="py-2 items-center rounded-full justify-center bg-[#75A90A]">
                  <AppText color={theme === "dark" ? "light" : "dark"}>
                    View Farmer
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
