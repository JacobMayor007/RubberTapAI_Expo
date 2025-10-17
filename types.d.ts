import { Dayjs } from "dayjs";

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
};

type MyNotifications = {
  $id: string;
  $createdAt?: string;
  type: string;
  message: string;
  isRead: boolean;
  userId: string;
  receiverId: string;
  senderProfile: string;
};

type SubscriptionData = {
  $id: string;
  $createdAt: Dayjs;
  subscriptionType: string;
  startDate: Dayjs;
  endDate: Dayjs;
  benefit_1: string;
  paymentMethod: string;
  price: number;
  user_id: string;
  benefit_2: string;
  period: string;
};

type Plot = {
  $id: string;
  $createdAt: Dayjs;
  name: string;
  image_plot: string;
  user_id: string;
  status: string;
};

type Tree_Record = {
  $id: string;
  $createdAt: Dayjs;
  plot_id: string;
  user_id: string;
  image_url: string;
  status: string;
};

type Leaves_Record = {
  $id: string;
  $createdAt: Dayjs;
  plot_id: string;
  tree_id: string;
  user_id: string;
  image_leaf: string;
  status: string;
  confidence: string;
};

type MessageHistory = {
  $id: string;
  $createdAt: Dayjs;
  product_id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  imageUrl: string;
};

type ChatRoom = {
  $id: string;
  $createdAt: Dayjs;
  participants: string[];
  participants_profile: string[];
  participants_username: string[];
  lastMessage: string;
  senderId: string;
  receiverId: string;
};

type Product = {
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
};

export {
  ChatRoom,
  Leaves_Record,
  MessageHistory,
  MyNotifications,
  Plot,
  Product,
  Profile,
  SubscriptionData,
  Tree_Record,
};
