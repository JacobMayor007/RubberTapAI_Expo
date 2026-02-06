import { useRouter } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ID } from "react-native-appwrite";
import { globalFunction } from "../global/fetchWithTimeout";
import { account } from "../lib/appwrite";

type User = {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
} | null;

type Profile = {
  $id: string;
  $createdAt?: string;
  email: string;
  fullName: string;
  fName: string;
  lName: string;
  subscription: Boolean;
  username: string;
  imageURL: string;
  API_KEY: string;
  notif: boolean;
  pushToken: string;
  weatherAlert: boolean;
  messageAlert: boolean;
  marketAlert: boolean;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  setUser: (user: User | null) => void;
  setProfile: (user: Profile | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile>(null);

  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getUser = async () => {
    try {
      const userData = await account.get();
      setUser({ ...userData });
      await getProfile(userData.$id);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  };

  const getProfile = async (userId: string) => {
    try {
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/user/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        20000,
      );

      const profileJson = await response.json();

      setProfile(profileJson);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession({ email, password });
    await getUser();
    router.replace("/(tabs)");
  };

  const logout = async () => {
    await account.deleteSession({ sessionId: "current" });
    setUser(null);
    router.dismissAll();
    router.replace("/(auth)");
  };

  const register = async (email: string, password: string, name: string) => {
    await account.create({ userId: ID.unique(), email, password, name });
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
        profile,
        setProfile,
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
