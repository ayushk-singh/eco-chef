import { Client, Account, Storage, ID } from "appwrite";
import dotenv from "dotenv";

dotenv.config();

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export const storage = new Storage(client);

export { ID };
