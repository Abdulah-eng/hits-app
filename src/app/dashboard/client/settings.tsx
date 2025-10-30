import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
export default function ClientSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/sign-in');
    }
  }, [user, loading, router]);
  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Client Settings</h1>
      <p className="mb-6">This page is a placeholder for client account and preferences settings. Add profile update, password change, etc. here.</p>
    </div>
  );
}
