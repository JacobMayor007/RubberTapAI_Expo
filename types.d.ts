import { Dayjs } from "dayjs";

interface Profile {
  $id: string;
  $createdAt?: string;
  email: string;
  username: string;
  fName: string;
  lName: string;
  notifSettings: string;
  themeSettings: string;
  subscription: Boolean;
  imageURL: string;
  API_KEY: string;
}

interface Plot {
  $id: string;
  $createdAt: Dayjs;
  name: string;
  image_plot: string;
  user_id: string;
  status: string;
}

interface Tree_Record {
  $id: string;
  $createdAt: Dayjs;
  plot_id: string;
  user_id: string;
  image_url: string;
  confidence: Number;
  status: string;
}

interface MessageHistory {
  $id: string;
  $createdAt: Dayjs;
  product_id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  imageUrl: string;
}

interface ChatRoom {
  $id: string;
  $createdAt: Dayjs;
  participants: string[];
  participants_profile: string[];
  participants_username: string[];
  lastMessage: string;
  senderId: string;
  receiverId: string;
}

interface Product {
  $id: string;
  $createdAt: Dayjs;
  address: string;
  user_id: string;
  user_username: string;
  user_email: string;
  productURL: string;
  description: string;
  price: number;
  farmerProfile: string;
  category: string;
  city: string;
  country: string;
  region: string;
}

export { ChatRoom, MessageHistory, Plot, Product, Profile, Tree_Record };
