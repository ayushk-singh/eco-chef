"use client";
import React, { useEffect, useState } from "react";
import { Table, Loader, Center, Text } from "@mantine/core";
import { databases } from "@/lib/appwrite";

export default function GroceryList() {
  const [items, setItems] = useState<{ id: string; name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string;

        if (!databaseId || !collectionId) {
          throw new Error("Appwrite Database or Collection ID is missing.");
        }

        const response = await databases.listDocuments(databaseId, collectionId);
        setItems(response.documents.map((doc: any) => ({ id: doc.$id, ...doc })));
      } catch (err: any) {
        setError(err.message || "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading)
    return (
      <Center>
        <Loader size="lg" />
      </Center>
    );

  if (error)
    return (
      <Center>
        <Text color="red">{error}</Text>
      </Center>
    );

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Available Items</h2>
      {items.length === 0 ? (
        <Text align="center">No items found.</Text>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
