import React from "react";
import { Pressable, PressableProps, Text } from "react-native";
import { cn } from "../utils/cn";

type ButtonProps = PressableProps & {
  title: string;
  onPress?: () => void;
  color?: "light" | "dark";
  disabled?: boolean;
  className?: string;
  bg?: "primary" | "secondary";
};

export function Button({
  title,
  onPress,
  className,
  bg = "primary",
  color = "light",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        bg === "primary" && "bg-[#6B8E23]",
        "flex-row items-center justify-center rounded-md ",
        disabled && "opacity-50",
        bg === "secondary" && "bg-black",
        className
      )}
      disabled={disabled}
      {...rest}
    >
      <Text
        className={cn(
          "text-white",
          color === "dark" && "text-black",
          className
        )}
      >
        {title} {disabled}
      </Text>
    </Pressable>
  );
}
