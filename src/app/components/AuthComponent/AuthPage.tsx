"use client"; // Makes sure this file is client-side

import React, { Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import { AuthComponentLogin } from "./AuthComponentLogin";
import { AuthComponentSignup } from "./AuthComponentSignup";

export default function AuthPage() {
  // Get the mode from the URL search parameters
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  // Wrap the return statement inside Suspense to handle client-side loading
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {mode === "login" ? <AuthComponentLogin /> : <AuthComponentSignup />}
    </Suspense>
  );
}
