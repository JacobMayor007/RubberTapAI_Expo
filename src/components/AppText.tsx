import { Text } from "react-native";
import { cn } from "../utils/cn";

type AppTextProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  color?: "light" | "dark" | "system";
  className?: string;
  numberOfLines?: number;
  ellipsizeMode?: "clip" | "head" | "tail" | "middle" | "";
};

export function AppText({
  onPress,
  children,
  className,
  color,
  numberOfLines,
  ellipsizeMode,
}: AppTextProps) {
  return (
    <Text
      onPress={onPress}
      className={cn(
        "text-white",
        color === "dark" && "text-[#442111]",
        className
      )}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode || undefined}
    >
      {children}
    </Text>
  );
}
