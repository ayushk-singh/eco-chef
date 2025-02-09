import { useEffect, useState } from "react";
import { databases, account, storage, ID } from "@/lib/appwrite"; // Ensure Appwrite SDK is configured
import { Query } from "appwrite";
import { Groq } from "groq-sdk"; // Import Groq SDK

interface Item {
  id: string;
  name: string;
  quantity: number;
  expiry: string | null;
  purchase_date: string | null;
  isRefrigerator: boolean;
}

export default function RecipeGenerator() {
  const [items, setItems] = useState<Item[]>([]);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  const [recipeMessage, setRecipeMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

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
          expiry: doc.expiry || null,
          purchase_date: doc.purchase_date || null,
          isRefrigerator: doc.isRefrigerator || false,
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
        model: "llama-3.2-1b-preview",
      });

      setRecipe(response.choices[0].message.content);
    } catch (err: any) {
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserPoints = async () => {
    if (!userId) {
      setError("User is not logged in.");
      return;
    }
  
    try {
      // Get the current logged-in user's email
      const user = await account.get();
      const userEmail = user.email;
  
      if (!userEmail) {
        throw new Error("User email is missing.");
      }
  
      // Ensure the user is logged in and email is available
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS as string;
  
      if (!databaseId || !collectionId) {
        throw new Error("Appwrite Database or Collection ID is missing.");
      }
  
      // Fetch the user document using email
      const userResponse = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("email", userEmail), // Use email to query the collection
      ]);
  
      if (userResponse.documents.length === 0) {
        throw new Error("User not found.");
      }
  
      // Get the user's document ID (assuming the first document is the one we need)
      const userDocument = userResponse.documents[0];
      const userDocumentId = userDocument.$id;
  
      // Get the current points and increment
      const currentPoints = userDocument.points || 0;
      const updatedPoints = currentPoints + 10;
  
      // Update the user's points in the users collection
      await databases.updateDocument(
        databaseId,
        collectionId,
        userDocumentId,
        { points: updatedPoints }
      );
  
      setRecipeMessage("Points updated successfully!");
    } catch (err: any) {
      console.error('Error updating user points:', err);
      setError("Failed to update points. Please try again.");
    }
  };
  
  
  
  const createPost = async () => {
    if (!recipeImage || !recipeMessage || !recipe) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sanitize the image name by replacing invalid characters with '_'
      const sanitizedImageName = recipeImage.name
        .replace(/[^a-zA-Z0-9.-_]/g, '_') // Replace invalid chars with '_'
        .toLowerCase();

      // Create a file ID using Date.now() and sanitized image name, ensuring it's no longer than 36 characters
      const baseFileId = `${Date.now()}-${sanitizedImageName}`;
      const fileId = baseFileId.substring(0, 36); // Trim to 36 characters if it's too long

      // Upload the image to Appwrite Storage
      const imageUpload = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string,
        fileId, // Use sanitized and truncated fileId
        recipeImage
      );

      // Validate image upload
      if (!imageUpload || !imageUpload.$id) {
        throw new Error("Image upload failed.");
      }

      // Generate a unique ID for the post using Appwrite's ID.unique()
      const postId = ID.unique();

      // Create a post in Appwrite Database
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POST as string;

      const post = await databases.createDocument(databaseId, collectionId, postId, {
        imgUrl: imageUpload?.$id, // Changed from imageUrl to imgUrl as required by schema
        message: recipeMessage,
        user_id: userId,
      });

      // Update user points after post creation
      await updateUserPoints();

      setIsModalOpen(false);
      setRecipe(null);
      setRecipeImage(null);
      setRecipeMessage("");
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Generate a Recipe</h2>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={generateRecipe}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          Suggest Recipe
        </button>

        <button
          onClick={generateRecipe}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          Another Recipe
        </button>
      </div>

      {recipe && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold">Suggested Recipe:</h3>
          <p className="text-gray-700 dark:text-gray-300">{recipe}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-black p-6 rounded-lg w-1/2 text-white">
            <h3 className="text-lg font-semibold">Create a Post</h3>

            <textarea
              placeholder="Add a message..."
              value={recipeMessage}
              onChange={(e) => setRecipeMessage(e.target.value)}
              className="mt-2 w-full p-2 border border-gray-300 rounded-md bg-gray-700 text-white"
            />

            <input
              type="file"
              onChange={(e) => setRecipeImage(e.target.files?.[0] || null)}
              className="mt-2 w-full p-2 bg-gray-700 text-white"
            />

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={createPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Post Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
