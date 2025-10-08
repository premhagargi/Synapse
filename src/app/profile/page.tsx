'use client';

import { useUser } from '@/firebase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="container mx-auto max-w-2xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight">Profile</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your account settings.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-xl font-semibold">{user.displayName}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold">Subscription Plan</h3>
                <p className="text-muted-foreground">You are currently on the <span className="font-bold text-primary">Pro Tier</span> plan.</p>
            </div>
            
            <Button variant="destructive" onClick={handleLogout}>
              Log Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
