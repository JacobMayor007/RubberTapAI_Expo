import React from "react";
import { Pressable, PressableProps } from "react-native";
import { cn } from "../utils/cn";

type ViewProps = PressableProps & {
  onPress?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export function ViewPressable({ className, children, onPress }: ViewProps) {
  return (
    <Pressable onPress={onPress} className={cn(className)}>
      {children}
    </Pressable>
  );
}
