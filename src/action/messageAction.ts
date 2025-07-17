import { ChatRoom } from "@/types";
import dayjs from "dayjs";
import { ID, Query } from "react-native-appwrite";
import { database } from "../lib/appwrite";


export async function createNewChatRoom(sender_id: string, receiver_id: string, lastMessage: string, 
  senderProfile: string, receiverProfile:string,
   senderName: string, receiverName:string){
   try {
    const newChatRoom = await database.createDocument(
        '686156d00007a3127068',
        '686cd6a3000e3ba76aef',
        ID.unique(),
        {
          participants: [
             sender_id,
            receiver_id,
          ],
          participants_profile: [
           senderProfile,
            receiverProfile
          ],
          participants_username: [
            senderName,
            receiverName
          ],
          lastMessage: lastMessage,
          senderId: sender_id,
          receiverId: receiver_id,
        }
      );
      
      return newChatRoom.$id;

   } catch (error) {
        console.error(error);
        return "";
   }
}

export async function createNewMessages(product_id:string, sender_id: string, receiver_id: string, content: string, imageURL: string){
   try {
    const newChatRoom = await database.createDocument(
        '686156d00007a3127068',
        '686cd8000033894e4bc8',
        ID.unique(),
        {
          product_id: product_id,
          content: content,
          sender_id: sender_id,
          receiver_id: receiver_id,
          imageUrl: imageURL,
        }
      );

      console.log("Adding New Messages Successful: ", newChatRoom.$id);
      
      return newChatRoom.$id;

   } catch (error) {
        console.error(error);
        return "";
   }
}


export async function getChatRoom(user_id:string): Promise<ChatRoom[]>{
  try {
    
    const response = await database.listDocuments(
            "686156d00007a3127068",
            "686cd6a3000e3ba76aef",
            [
              Query.contains("participants", [
                user_id || "",
              ]),
            ]
          );
    
    const chatRoom:ChatRoom[] = response.documents.map((doc)=>({
        $id: doc.$id,
        $createdAt: dayjs(doc.$createdAt),
        participants: doc.participants,
        participants_profile: doc.participants_profile,
        participants_username: doc.participants_username,
        lastMessage: doc.lastMessage,
        senderId: doc.senderId,
        receiverId: doc.receiverId,
    }));

    return chatRoom;

  } catch (error) {
      console.error(error);
      return []
  }
  
}

