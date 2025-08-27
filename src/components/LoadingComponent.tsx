import { useEffect, useRef } from "react";
import { Animated, Easing, Image } from "react-native";
import "react-native-reanimated";
import { cn } from "../utils/cn";

type LoadingProps = {
  className?: string;
};

export default function Loading({ className }: LoadingProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };

    spin();
  }, []);

  return (
    <Animated.View
      style={{ transform: [{ rotate }] }}
      className={cn(className)}
    >
      <Image
        source={require("@/assets/images/Logo.png")}
        className={cn(className)}
      />
    </Animated.View>
  );
}
