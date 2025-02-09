'use client'

import { useEffect, useState } from 'react';
import { account, databases } from '@/lib/appwrite'; // Assuming you're using the correct imports from Appwrite
import { Query } from 'appwrite';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS as string;

      // Fetch user profile from the database using email
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.equal('email', email), // Fetch using email
      ]);

      console.log('Response from Appwrite:', response); // Log the response

      if (response.documents.length === 0) {
        setError('No user found with this email.');
      } else {
        const userData = response.documents[0]; // Assuming only one document for the user
        console.log('User data:', userData); // Log the user data
        setUser(userData);
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the current logged-in user's data
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        // Get the current logged-in user
        const currentUser = await account.get();
        console.log('Logged-in user:', currentUser); // Log the current logged-in user

        const email = currentUser.email; // Get the email from the logged-in user
        fetchUserProfile(email); // Fetch user profile data from the database
      } catch (err) {
        console.error('Error fetching logged-in user:', err);
        setError('Failed to fetch logged-in user details.');
      }
    };

    fetchLoggedInUser(); // Call the function to fetch the logged-in user
  }, []); // Only run once when the component mounts

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-700">
        {loading && <p className="text-center text-gray-500">Loading profile...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {user && !loading && !error && (
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold text-indigo-600">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-4xl font-semibold text-gray-100">{user.name}'s Profile</h2>
            </div>
            <div className="bg-gray-700 p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-gray-300">Email:</p>
                <p className="text-lg text-gray-200">{user.email}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-gray-300">Points:</p>
                <p className="text-lg text-gray-200">{user.points}</p>
              </div>
            </div>

            {/* Action buttons */}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
