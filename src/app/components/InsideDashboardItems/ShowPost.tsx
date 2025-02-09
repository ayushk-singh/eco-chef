'use client'

import { useEffect, useState } from 'react';
import { databases, storage } from '@/lib/appwrite'; // Make sure you have Appwrite client set up

const PostsList = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from the database
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch posts from the database
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POST as string;
      const response = await databases.listDocuments(databaseId, collectionId);

      // For each post, fetch the image from the storage
      const postsWithImages = await Promise.all(
        response.documents.map(async (post: any) => {
          const imageUrl = await getImageUrl(post.imgUrl); // Get image URL using the imgUrl field
          return {
            ...post,
            imageUrl,
          };
        })
      );

      setPosts(postsWithImages);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the image URL from Appwrite Storage
  const getImageUrl = async (imgId: string) => {
    try {
      const url = await storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string,
        imgId
      );
      return url;
    } catch (err) {
      console.error('Error fetching image URL:', err);
      return ''; // Return empty string if error
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      {loading && <p className="text-center text-gray-500">Loading posts...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-center text-gray-500">No posts to display.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post, index) => (
          <div
            key={index}
            className="bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-xl font-semibold">{post.name}</div>
            </div>
            <div className="space-y-4">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="w-32 h-32 object-cover rounded-lg shadow-md mx-auto"
                />
              )}
              <p className="text-gray-300">{post.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsList;
