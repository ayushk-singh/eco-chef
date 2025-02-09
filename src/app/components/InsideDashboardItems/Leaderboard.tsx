import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite"; // Ensure Appwrite SDK is configured
import { Query } from "appwrite"; 

interface User {
  id: string;
  email: string;
  points: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS as string;

        if (!databaseId || !collectionId) {
          throw new Error("Appwrite Database or Collection ID is missing.");
        }

        // Fetch all users' data from the database
        const response = await databases.listDocuments(databaseId, collectionId);

        const allUsers: User[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          email: doc.email,
          points: doc.points || 0,
        }));

        // Sort users by points in descending order
        const sortedUsers = allUsers.sort((a, b) => b.points - a.points);

        setUsers(sortedUsers);
      } catch (err: any) {
        setError(err.message || "Failed to fetch leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Leaderboard</h2>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
