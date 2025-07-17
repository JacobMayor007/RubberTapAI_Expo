import { getUserProduct } from "@/src/action/productAction";
import AddProduct from "@/src/components/AddProduct";
import { AppText } from "@/src/components/AppText";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
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
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Market() {
  const router = useRouter();
  const [addProductModal, setAddProductModal] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProduct, setMyProduct] = useState<Product[]>([]);

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

  return (
    <SafeAreaView className=" flex-1 ">
      <View className="flex-1 bg-[#E8DFD0] flex-col justify-between">
        <View className="px-6 py-10 flex-1 flex-col gap-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-4">
              <FontAwesome5
                name="arrow-left"
                size={20}
                onPress={() => router.back()}
              />
              <AppText
                color={"dark"}
                className="font-poppins font-extrabold text-2xl"
              >
                Marketplace
              </AppText>
            </View>
            <AntDesign
              name="message1"
              size={23}
              onPress={() => router.push("/(message)")}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <AppText color={"dark"} className="font-poppins font-bold text-xl">
              {`Latex & \nWaste Rubber Trade`}
            </AppText>
            <ViewPressable
              onPress={() => setAddProductModal(true)}
              className="bg-[#75A90A] flex-row gap-2 items-center px-4 py-2 rounded-full "
            >
              <AppText color={"light"} className="font-poppins font-semibold">
                Add Your Product
              </AppText>
              <Feather size={20} color={"white"} name="plus-circle" />
            </ViewPressable>
          </View>
          {loading ? (
            <ActivityIndicator animating size={"large"} />
          ) : (
            <ScrollView className="">
              <AppText
                color={"dark"}
                className="font-poppins font-bold text-lg mb-2"
              >
                Your Products
              </AppText>
              <View className="flex-row gap-2">
                {myProduct?.slice(0, 3).map((data, index) => {
                  return (
                    <Pressable
                      style={{
                        boxShadow:
                          "1px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                      className="bg-[#F3E0C1] whitespace-nowrap rounded-lg w-[33.3%] h-52 overflow-hidden pb-2"
                      key={index}
                    >
                      <Image
                        className="h-20 rounded-t-lg"
                        source={{ uri: data?.productURL }}
                      />
                      <View className="ml-2 mt-3 flex-row items-center">
                        <FontAwesome6
                          name="peso-sign"
                          size={15}
                          color={"dark"}
                        />
                        <AppText color={"dark"} className="ml-1">
                          {data?.price.toString()} /Kg
                        </AppText>
                      </View>
                      <AppText color={"dark"} className="capitalize ml-2 mt-2">
                        {data?.category}
                      </AppText>
                      <View className="ml-2 mt-2 pr-2">
                        <Text numberOfLines={1} ellipsizeMode="tail">
                          {data?.city}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
        <View className="bg-white h-20 flex-row items-center justify-between px-7 pb-2">
          <Feather
            name="menu"
            size={24}
            onPress={() => router.push("/(tabs)/menu")}
          />

          <Feather name="camera" size={24} />
          <Entypo
            name="home"
            size={32}
            onPress={() => router.push("/(tabs)")}
          />
          <View className="mb-16 h-20 w-20 rounded-full bg-[#E8DFD0] items-center justify-center p-1.5">
            <View className="bg-white h-full w-full rounded-full items-center justify-center">
              <FontAwesome6 name="arrow-trend-up" size={20} />
            </View>
          </View>
          <FontAwesome6 name="clock-rotate-left" size={20} />
        </View>
        <Modal visible={addProductModal} animationType="slide">
          <AddProduct />
        </Modal>
      </View>
    </SafeAreaView>
  );
}
