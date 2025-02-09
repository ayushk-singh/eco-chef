'use client'

import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { ID } from "appwrite";

export function GroceryListEntry() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isRefrigerated, setIsRefrigerated] = useState<boolean>(false);
  const [expiry, setExpiry] = useState<string>("");
  const [purchase, setPurchase] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (err) {
        setError("Failed to fetch user. Please log in.");
      }
    };

    fetchUser();
  }, []);

  const addItem = async () => {
    if (!userId) {
      setError("User not authenticated.");
      return;
    }
    if (!name || !quantity || !purchase) {
      setError("Name, quantity, and purchase date are required.");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
  
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string;
  
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        user_id: userId,
        name,
        quantity,
        isRefrigerated,
        expiry: expiry || null, // Store null if expiry is empty
        purchase,
      });
  
      setSuccess(true);
      setName("");
      setQuantity(1);
      setIsRefrigerated(false);
      setExpiry("");
      setPurchase("");
    } catch (err: any) {
      setError("Failed to add item.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="mt-10 w-full max-w-lg mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Add Grocery Item</h2>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Item added successfully!</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium">Item Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter item name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter quantity"
        />
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={isRefrigerated}
          onChange={(e) => setIsRefrigerated(e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm font-medium">Is Refrigerated?</label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Purchase Date:</label>
        <input
          type="date"
          value={purchase}
          onChange={(e) => setPurchase(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Expiry Date:</label>
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        onClick={addItem}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
}
