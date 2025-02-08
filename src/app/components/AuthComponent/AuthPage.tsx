"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AuthComponentLogin } from "./AuthComponentLogin";
import { AuthComponentSignup } from "./AuthComponentSignup";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "login";

  return mode === "login" ? <AuthComponentLogin /> : <AuthComponentSignup />;
}
