import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useState } from "react";
import { ID } from "react-native-appwrite";
import { account } from "../lib/appwrite";

type AuthContextType = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession({ email, password });
    router.replace("/(tabs)");
  };

  const logout = async () => {
    await account.deleteSession({ sessionId: "current" });
    router.dismissAll();
    router.replace("/(auth)");
  };

  const register = async (email: string, password: string, name: string) => {
    await account.create({ userId: ID.unique(), email, password, name });
  };

  return (
    <AuthContext.Provider
      value={{
        isReady,
        login,
        logout,
        register,
        setIsReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
