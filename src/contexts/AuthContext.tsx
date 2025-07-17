import { useRouter } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ID } from "react-native-appwrite";
import { account } from "../lib/appwrite";

type User = {
  $id: string;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getUser = async () => {
    try {
      const userData = await account.get();
      console.log(userData);

      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    await getUser();
    router.replace("/(tabs)");
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    router.replace("/(auth)");
  };

  const register = async (email: string, password: string, name: string) => {
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,
        loading,
        login,
        logout,
        register,
        setIsReady,
        setUser,
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
