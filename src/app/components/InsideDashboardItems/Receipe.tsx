"use client";
import React, { useEffect, useState } from "react";
import { Button, Loader, Center, Text, Paper } from "@mantine/core";
import { databases } from "@/lib/appwrite";
import Groq from "groq-sdk";

export default function Recipe() {
  const [items, setItems] = useState<{ name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
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
        setItems(response.documents.map((doc: any) => ({ name: doc.name, quantity: doc.quantity })));
      } catch (err: any) {
        setError(err.message || "Failed to fetch items.");
      }
    };

    fetchItems();
  }, []);

  const getRecipe = async () => {
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error("Groq API key is missing.");

      const groq = new Groq({apiKey, dangerouslyAllowBrowser: true});

      const prompt = `
        Given the following list of ingredients: ${JSON.stringify(items)},
        identify which items are likely to expire soon and suggest a recipe using those ingredients.
        Provide a step-by-step guide for the recipe.
      `;

      const response = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768", // Groq’s latest LLM
        messages: [{ role: "system", content: prompt }],
        max_tokens: 300,
      });

      setRecipe(response.choices[0]?.message?.content || "No recipe found.");
    } catch (err: any) {
      setError(err.message || "Failed to generate recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">AI-Powered Recipe Suggestion</h2>
      {error && <Text color="red">{error}</Text>}

      <Button onClick={getRecipe} disabled={loading}>
        {loading ? "Generating..." : "Get Recipe"}
      </Button>

      {loading && (
        <Center>
          <Loader size="lg" />
        </Center>
      )}

      {recipe && (
        <Paper shadow="xs" p="md" className="mt-4">
          <Text size="lg" weight={600}>
            Suggested Recipe:
          </Text>
          <Text>{recipe}</Text>
        </Paper>
      )}
    </div>
  );
}
