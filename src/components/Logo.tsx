import { Image } from "react-native";
import { cn } from "../utils/cn";

type LogoProp = {
  className?: string;
};

export default function Logo({ className }: LogoProp) {
  return (
    <Image
      className={cn(className)}
      source={require("@/assets/images/Logo.png")}
    />
  );
}
