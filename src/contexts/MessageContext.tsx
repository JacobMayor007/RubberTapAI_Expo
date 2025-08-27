import { Profile } from "@/types";
import { createContext, ReactNode, useContext, useState } from "react";

type MessageContextType = {
  setUser: (user: Profile | null) => void;
  user: Profile | null;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);

  return (
    <MessageContext.Provider value={{ user, setUser }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessage must be used within MessageProvider");
  return context;
};
