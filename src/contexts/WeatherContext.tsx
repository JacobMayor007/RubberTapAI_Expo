import { createContext, ReactNode, useContext, useState } from "react";

type WeatherContextType = {
  setRain: (willRain: boolean) => void;
  rain?: boolean | null;
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [rain, setRain] = useState(false);

  return (
    <WeatherContext.Provider value={{ rain, setRain }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
