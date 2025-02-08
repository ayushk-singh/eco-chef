import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite"; // Ensure Appwrite SDK is configured
import { Query } from "appwrite";
import { Groq } from "groq-sdk"; // Import Groq SDK

interface Item {
  id: string;
  name: string;
  quantity: number;
  expiry: string | null; // Add expiry field
  purchase_date: string | null; // Add purchase_date field
  isRefrigerator: boolean; // Add isRefrigerator field
}

export default function RecipeGenerator() {
  const [items, setItems] = useState<Item[]>([]);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY; // Ensure API Key is set

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

  useEffect(() => {
    if (!userId) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string;

        if (!databaseId || !collectionId) {
          throw new Error("Appwrite Database or Collection ID is missing.");
        }

        const response = await databases.listDocuments(databaseId, collectionId, [
          Query.equal("user_id", userId),
        ]);

        const formattedItems: Item[] = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.name as string,
          quantity: doc.quantity as number,
          expiry: doc.expiry || null, // Handle null expiry
          purchase_date: doc.purchase_date || null, // Handle null purchase_date
          isRefrigerator: doc.isRefrigerator || false, // Default to false if not available
        }));

        setItems(formattedItems);
      } catch (err: any) {
        setError(err.message || "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [userId]);

  const generateRecipe = async () => {
    if (!groqApiKey) {
      setError("Groq API key is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });

      // Format the user's grocery list and expiry information for Groq
      const itemsDetails = items.map((item) => {
        return `${item.name} (Qty: ${item.quantity})${
          item.expiry ? `, Expiry: ${item.expiry}` : ""
        }${
          item.purchase_date
            ? `, Purchased on: ${item.purchase_date}`
            : ""
        }${
          item.isRefrigerator ? `, Needs refrigeration` : ""
        }`;
      }).join(", ");

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI chef. Suggest a recipe using ingredients that might expire soon. If items have expiry dates, prioritize those ingredients. Also, consider refrigeration needs and item purchase dates.",
          },
          {
            role: "user",
            content: `Here is my grocery list: ${itemsDetails}. Suggest a recipe using these ingredients.`,
          },
        ],
        model: "llama-3.2-1b-preview", // Update this with the best model available
      });

      setRecipe(response.choices[0].message.content);
    } catch (err: any) {
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Generate a Recipe</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={generateRecipe}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Suggest Recipe
      </button>

      {recipe && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
          <h3 className="text-lg font-semibold">Suggested Recipe:</h3>
          <p>{recipe}</p>
        </div>
      )}
    </div>
  );
}
