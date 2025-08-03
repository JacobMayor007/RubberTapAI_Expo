import { Product } from "@/types";
import dayjs from "dayjs";
import { ID, Query } from "react-native-appwrite";
import { database } from "../lib/appwrite";

export async function addNewProduct( address:string, user_id: string,
    user_username:string, user_email:string, productURL:string,
    farmerProfile: string, category: string, description:string, price:number,
    city: string, region: string, country: string
){
   try {
    const product = await database.createDocument(
        '686156d00007a3127068',
        '686e4684002e599953dd',
        ID.unique(),
        {
          address:address,
          user_id: user_id,
          user_username: user_username,
          user_email: user_email,
          productURL,
          description,
          price,
          farmerProfile,
          category,
          city,
          region,
          country
        }
      );

      console.log("Adding New Product Successful: ", product.$id);
      
      return product.$id;

   } catch (error) {
        console.error(error);
        return "";
   }
}

export async function getUserProduct(userId: string): Promise<Product[]> {
    try {
      const response = await database.listDocuments(
        '686156d00007a3127068',
        '686e4684002e599953dd',
        [Query.equal('user_id', userId)]
    );

    if (response.documents.length === 0) return [];
    
    const doc: Product[] = response.documents.map((doc)=>({
        $id: doc.$id,
        $createdAt: dayjs(doc.$createdAt),
        address: doc.address,
        user_id: doc.user_id,
        user_username: doc.user_username,
        user_email: doc.user_email,
        productURL: doc.productURL,
        description: doc.description,
        price: doc.price,
        farmerProfile: doc.farmerProfile,
        category: doc.category,
        city: doc.city,
        country: doc.country,
        region: doc.region,
    }));

    return doc;
    } catch (error) {
       return []      
    }
  }

  export async function getOthersProduct(userId: string): Promise<Product[]> {
    try {
      const response = await database.listDocuments(
        '686156d00007a3127068',
        '686e4684002e599953dd',
        [Query.notEqual('user_id', userId)]
    );

    if (response.documents.length === 0) return [];
    
    const doc: Product[] = response.documents.map((doc)=>({
        $id: doc.$id,
        $createdAt: dayjs(doc.$createdAt),
        address: doc.address,
        user_id: doc.user_id,
        user_username: doc.user_username,
        user_email: doc.user_email,
        productURL: doc.productURL,
        description: doc.description,
        price: doc.price,
        farmerProfile: doc.farmerProfile,
        category: doc.category,
        city: doc.city,
        country: doc.country,
        region: doc.region,
    }));

    return doc;
    } catch (error) {
       return []      
    }
  }