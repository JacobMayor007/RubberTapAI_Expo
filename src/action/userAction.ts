import { User } from "@/types";
import { Query } from "react-native-appwrite";
import { database } from "../lib/appwrite";

export async function getUserByIdDirect(userId: string): Promise<User | null> {
    const response = await database.listDocuments(
        '686156d00007a3127068',
        '686b71a300125286e377',
        [Query.equal('$id', userId)]
    );

    if (response.documents.length === 0) return null;
    
    const doc = response.documents[0];
    return {
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        email: doc.email,
        username: doc.username,
        notifSettings: doc.notifSettings,
        themeSettings: doc.themeSettings,
        subscription: doc.subscription,
        imageURL: doc.imageURL
    };
}

const queryUser = async (name: string): Promise<User[]> => {

    const response = await database.listDocuments(
        '686156d00007a3127068',
        '686b71a300125286e377',
        [
            Query.search("username", name),
            Query.limit(25)
        ]
        );

    if (response.documents.length === 0) return [];

    const users:User[] = response.documents.map((doc)=>({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        email: doc.email,
        username: doc.username,
        notifSettings: doc.notifSettings,
        themeSettings: doc.themeSettings,
        subscription: doc.subscription,
        imageURL: doc.imageURL
    }));    
    return users;
}

export async function getChatMate(userId: string): Promise<User | null> {
    const response = await database.listDocuments(
        '686156d00007a3127068',
        '686b71a300125286e377',
        [Query.equal('$id', userId)]
    );

    if (response.documents.length === 0) return null;
    
    const doc = response.documents[0];
    return {
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        email: doc.email,
        username: doc.username,
        notifSettings: doc.notifSettings,
        themeSettings: doc.themeSettings,
        subscription: doc.subscription,
        imageURL: doc.imageURL
    };
}


export { queryUser };

