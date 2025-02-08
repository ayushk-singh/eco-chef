"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite"; // Appwrite instance
import { Loader } from "@mantine/core";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get(); // Check if user is logged in
        setIsLoading(false);
      } catch (error) {
        alert('Not authenticated. Redirecting...')
        router.push("/auth?mode=login"); // Redirect to login
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader size="xl" /> {/* Show a loader while checking auth */}
      </div>
    );
  }

  return <>{children}</>;
}
