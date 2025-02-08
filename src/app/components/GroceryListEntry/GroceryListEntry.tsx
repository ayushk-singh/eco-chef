"use client";
import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, NumberInput, Button } from "@mantine/core";
import { databases, ID } from "@/lib/appwrite";

export function GroceryListEntry() {
  const form = useForm({
    initialValues: {
      name: "",
      quantity: 1,
    },
    validate: {
      name: (value) => (value ? null : "Item name is required"),
      quantity: (value) => (value > 0 ? null : "Quantity must be a positive number"),
    },
  });

  const [items, setItems] = useState<{ name: string; quantity: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = async () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const newItem = { name: form.values.name, quantity: form.values.quantity };
    setItems([...items, newItem]);
    form.reset();
    setError(null);

    try {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string;
      
      if (!databaseId || !collectionId) {
        throw new Error("Appwrite Database or Collection ID is missing.");
      }
      
      await databases.createDocument(databaseId, collectionId, ID.unique(), newItem);
    } catch (err: any) {
      setError(err.message || "Error adding item to database.");
    }
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Enter Items and Quantities</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
        <TextInput label="Item Name" {...form.getInputProps("name")} />
        <NumberInput label="Quantity" min={1} {...form.getInputProps("quantity")} />
        <Button onClick={handleAddItem}>Add</Button>
      </form>
      <ul className="mt-4">
        {items.map((item, index) => (
          <li key={index} className="p-2 border-b border-gray-200">
            {item.name} - {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}