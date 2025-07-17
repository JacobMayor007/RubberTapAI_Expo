import { createContext, ReactNode, useContext, useState } from "react";

interface Address {
  city: string | null;
  country: string | null;
  district: string | null;
  formattedAddress?: string | null;
  isoCountryCode: string | null;
  name: string | null;
  postalCode: string | null;
  region: string | null;
  street: string | null;
  streetNumber: string | null;
  subregion: string | null;
  timezone: string | null;
}

type LocationContextProp = {
  setAddress: (address: Address | null) => void;
  address: Address | null;
};

const LocationContext = createContext<LocationContextProp | undefined>(
  undefined
);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<Address | null>(null);

  return (
    <LocationContext.Provider value={{ address, setAddress }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context)
    throw new Error("useMessage must be used within MessageProvider");
  return context;
};
