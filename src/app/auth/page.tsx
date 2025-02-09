"use client"

import dynamic from 'next/dynamic';

// Dynamically import AuthPage with ssr: false to disable server-side rendering
const AuthPage = dynamic(() => import("@/app/components/AuthComponent/AuthPage"), { ssr: false });

export default function Auth() {
  return <AuthPage />;
}
