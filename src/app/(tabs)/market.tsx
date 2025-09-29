import { deleteProduct } from "@/src/action/productAction";
import AddProduct from "@/src/components/AddProduct";
import { AppText } from "@/src/components/AppText";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import EditProduct from "@/src/components/EditProduct";
import HeaderBackground from "@/src/components/HeaderBackground";
import HeaderNav from "@/src/components/HeaderNav";
import Loading from "@/src/components/LoadingComponent";
import NavigationBar from "@/src/components/Navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { account } from "@/src/lib/appwrite";
import { Product, Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
  const [viewModal, setViewModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chosenProduct, setChosenProduct] = useState<Product | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [userVerification, setUserVerification] = useState(false);
  const [addEditModal, setAddEditModal] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  useEffect(() => {
    const getMyProduct = async () => {
      try {
        setLoading(true);
        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/my-product/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
          15000
        );

        const data = await response.json();

        setMyProduct(data);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setLoading(false);
      }
    };
    getMyProduct();
  }, [user?.$id]);

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

  const deleteHandle = async () => {
    try {
      setLoadingRequest(true);
      const response = await deleteProduct(
        user?.$id || "",
        chosenProduct?.$id || "",
        profile?.API_KEY || ""
      );

      router.push("/(tabs)/market");
      Alert.alert(response.title, response.message);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRequest(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View
        className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-col justify-between`}
      >
        <ScrollView contentContainerClassName="flex-1">
          <HeaderBackground />
          <View className="px-6 pt-10 flex-1  z-20">
            {/*Header Navbar*/}
            <HeaderNav title="Marketplace" arrow={true} />

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
                  setAddEditModal("add");
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
              <View className="items-center">
                <Loading className="h-12 w-12" />
              </View>
            ) : (
              <View style={{ flexGrow: 1, paddingBottom: 12 }}>
                <View className="flex-row justify-between items-center mb-2">
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-poppins font-bold text-lg"
                  >
                    Your Products
                  </AppText>
                </View>
                <View className="gap-2 py-2  w-full">
                  {myProduct?.slice(0, 2).map((data, index) => (
                    <Pressable
                      style={{
                        boxShadow:
                          "1px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                      className={`flex-row items-center ${theme === "dark" ? `bg-slate-700` : `bg-[#F3E0C1]`} w-full whitespace-nowrap rounded-lg p-4 overflow-hidden`}
                      key={index}
                    >
                      <Image className="h-36 w-36" src={data?.productURL} />
                      <View className="ml-2 mt-3 flex-1 flex-col">
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="capitalize font-bold text-xl"
                        >
                          {data?.category}
                        </AppText>

                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="ml-1"
                        >
                          {data?.price.toString()} /kg
                        </AppText>

                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          className={
                            theme === "dark" ? "text-white" : "text-black"
                          }
                        >
                          {data?.city}
                        </Text>

                        <TouchableOpacity
                          onPress={() => {
                            setChosenProduct(data);
                            setViewModal(true);
                          }}
                          className={`h-9 px-4 ${theme === "dark" ? `bg-green-800` : `bg-[#10B981]`} rounded-full items-center justify-center self-end mt-2`}
                        >
                          <AppText color={"light"}>View Details</AppText>
                        </TouchableOpacity>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <NavigationBar active="market" />
      </View>
      <Modal
        onRequestClose={() => setAddProductModal(false)}
        visible={addProductModal}
        animationType="slide"
        transparent
      >
        {addEditModal === "add" && (
          <AddProduct setAddProductModal={setAddProductModal} />
        )}
        {addEditModal === "edit" && (
          <EditProduct
            chosenProduct={chosenProduct}
            setAddProductModal={setAddProductModal}
          />
        )}
        {addEditModal === "delete" && (
          <ConfirmCancelModal
            heightSize={96}
            padding={12}
            blurIntensity={50}
            onCancel={() => setAddProductModal(false)}
            onClose={() => setAddProductModal(false)}
            onOk={deleteHandle}
            borderRounded={10}
          >
            {loadingRequest ? (
              <View className="flex-1 justify-center items-center pb-5">
                <Loading className="h-14 w-14" />
              </View>
            ) : (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 14,
                }}
                className=" my-auto pb-10"
              >
                <AppText
                  color="dark"
                  className="font-poppins font-bold text-lg"
                >
                  Do you wish to delete this product?
                </AppText>
                <Image
                  style={{ borderRadius: 6 }}
                  src={chosenProduct?.productURL}
                  height={110}
                  width={174}
                />
              </View>
            )}
          </ConfirmCancelModal>
        )}
      </Modal>
      <Modal
        visible={viewModal}
        animationType="slide"
        style={{ flexGrow: 1 }}
        transparent
        onRequestClose={() => setViewModal(false)}
      >
        <View className="bg-black/30 flex-1 flex-col">
          <View
            style={{
              flexGrow: 1,
            }}
            className="items-center flex-col justify-center px-4"
          >
            <View
              className={`${theme === "dark" ? `bg-gray-900` : `bg-[#F3E0C1]`} p-6 h-[40%] pt-14  rounded-xl gap-4 flex-col`}
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
                  padding: 5,
                }}
                className=""
              />
              <View className=" gap-4 flex-row">
                <View className="w-[47%]">
                  <Image
                    className="h-36 rounded-md"
                    src={`${chosenProduct?.productURL}`}
                  />
                </View>
                <View className="gap-1 w-[50%]  overflow-hidden flex-col ">
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-extralight font-poppins text-sm"
                  >
                    Seller's Details
                  </AppText>
                  <View className=" overflow-hidden flex-wrap">
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-poppins capitalize font-bold text-lg"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {chosenProduct?.user_username}
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-poppins font-light capitalize"
                      ellipsizeMode="tail"
                    >
                      {chosenProduct?.city}
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-poppins font-bold capitalize"
                    >
                      {chosenProduct?.category}
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-poppins text-lg font-bold capitalize"
                    >
                      <FontAwesome6
                        name="peso-sign"
                        size={14}
                        color={"black"}
                      />
                      {chosenProduct?.price} / Kg
                    </AppText>
                  </View>
                </View>
              </View>
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="text-sm font-poppins py-0.5 leading-6 max-h-32 tracking-wider"
                numberOfLines={5}
              >
                {chosenProduct?.description}
              </AppText>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
