import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";

type MeasuringInstructionsProps = {
  setShowInstructions: (page: string) => void;
};

export default function MeasuringInstructions({
  setShowInstructions,
}: MeasuringInstructionsProps) {
  const { theme } = useTheme();

  const [instructionPage, setInstructionPage] = useState("one");
  return (
    <View className="flex-1">
      <BackgroundGradient className="flex-1">
        {instructionPage === "one" && (
          <Pressable
            onPress={() => setInstructionPage("two")}
            className=" flex-1 p-6 gap-4"
          >
            <Feather
              color={theme === "dark" ? `#E8C282` : `black`}
              onPress={() => setShowInstructions("")}
              name="x"
              size={32}
            />

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-red-500`
              } font-bold text-xl`}
            >
              📸 Please read the instructions first:
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-lg`}
            >
              1️⃣ Position your camera so the rubber tree trunk is centered in
              the frame.
            </AppText>

            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/Instruction_One.png")}
              className="h-[50%] w-56"
            />

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-lg`}
            >
              2️⃣ Make sure the tree fits inside the left and right overlays.
            </AppText>

            <Text
              style={{
                alignSelf: "flex-end",
              }}
              onPress={() => setInstructionPage("two")}
              className="bg-green-500 px-5 py-2 text-white font-bold rounded-md"
            >
              Next
            </Text>
          </Pressable>
        )}
        {instructionPage === "two" && (
          <Pressable
            onPress={() => {
              setInstructionPage("");
              setShowInstructions("");
            }}
            className="flex-1 p-6 gap-4 py-20"
          >
            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold `}
            >
              3️⃣ Press and hold the round button below to start measuring.
            </AppText>

            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/Instruction_Two.png")}
              className="h-72 w-32"
            />

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-center mt-4`}
            >
              ✋ Tip: Hold your phone vertically and ensure the full trunk is
              visible for the most accurate measurement.
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-center mt-4`}
            >
              ✋ Tip: You can hold your phone to your other hand, and pin point
              the rubber tree trunk where it says the 1m in the camera
            </AppText>
            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/AI_Image_2.png")}
              className="h-80 w-96"
            />
            <View className="flex-row justify-between items-center px-8 mt-4">
              <AppText
                onPress={() => setInstructionPage("one")}
                className="bg-gray-500 px-4 py-2 font-bold rounded-md text-white"
              >
                Previous
              </AppText>
              <AppText
                onPress={() => {
                  setInstructionPage("");
                  setShowInstructions("");
                }}
                className={`bg-green-500 px-5 py-2 font-bold rounded-md text-white`}
              >
                Next
              </AppText>
            </View>
          </Pressable>
        )}
      </BackgroundGradient>
    </View>
  );
}
