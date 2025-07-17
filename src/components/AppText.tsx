import { Text } from "react-native";
import { cn } from "../utils/cn";

type AppTextProps = {
  children: React.ReactNode;
  onPress?: () => void;
  color?: "light" | "dark";
  className?: string;
};

export function AppText({ onPress, children, className, color }: AppTextProps) {
  return (
    <Text
      onPress={onPress}
      className={cn("text-white", color === "dark" && "text-black", className)}
    >
      {children}
    </Text>
  );
}
