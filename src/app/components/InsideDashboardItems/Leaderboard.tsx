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
    <div className="min-h-screen w-full bg-black text-white flex justify-center items-center p-4">
      <div className="w-full h-full max-w-4xl bg-gray-900 rounded-lg shadow-xl p-6 flex flex-col">
        <h2 className="text-3xl font-semibold text-center mb-6">Leaderboard</h2>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="overflow-auto shadow-md rounded-lg">
          <table className="w-full table-auto border-collapse bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <th className="px-6 py-3 text-left text-sm font-medium">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-medium">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                  } hover:bg-gray-600 transition-all border-b border-gray-600`}
                >
                  <td className="px-6 py-4 text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
