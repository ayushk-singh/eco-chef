import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite"; // Ensure Appwrite SDK is configured
import { Query } from "appwrite";

interface Item {
  id: string;
  name: any;  // You may want to refine this type
  quantity: any;  // You may want to refine this type
  isRefrigerated: any;  // You may want to refine this type
  expiry: string | null;
  purchase: string | null;  // Update to allow null
}

export default function GroceryList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Store user ID

  // Fetch logged-in user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get(); // Fetch current user
        setUserId(user.$id);
        console.log("User ID:", user.$id);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to get user. Please log in.");
      }
    };

    fetchUser();
  }, []);

  // Fetch grocery items for the logged-in user
  useEffect(() => {
    if (!userId) return; // Wait until userId is available

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string;

        if (!databaseId || !collectionId) {
          throw new Error("Appwrite Database or Collection ID is missing.");
        }

        console.log("Database ID:", databaseId);
        console.log("Collection ID:", collectionId);

        const response = await databases.listDocuments(databaseId, collectionId, [
          Query.equal("user_id", userId), // Fetch only the current user's items
        ]);

        console.log("Fetched Items:", response.documents);

        // Transform Appwrite documents into expected shape
        const formattedItems: Item[] = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.name,
          quantity: doc.quantity,
          isRefrigerated: doc.isRefrigerated,
          expiry: formatDate(doc.expiry) || null, // Handle null expiry
          purchase: formatDate(doc.purchase),
        }));

        setItems(formattedItems);
      } catch (err: any) {
        setError(err.message || "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [userId]); // Runs when userId changes

  // Format date in dd/mm/yyyy format
  const formatDate = (date: string | null): string | null => {
    if (!date) return null; // Return null if date is not provided

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Your Item List</h2>

      {loading && <p>Loading items...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Quantity</th>
            <th className="p-2 border-b">Refrigerated</th>
            <th className="p-2 border-b">Purchase Date</th>
            <th className="p-2 border-b">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{item.isRefrigerated ? "Yes" : "No"}</td>
                <td className="p-2">{item.purchase}</td>
                <td className="p-2">{item.expiry ? item.expiry : "Null"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-2 text-center text-gray-500">
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
