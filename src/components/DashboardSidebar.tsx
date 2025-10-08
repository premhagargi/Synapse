'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  HelpCircle, 
  LifeBuoy,
  LogOut,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SidebarLink = ({ 
  href, 
  children, 
  icon: Icon 
}: { 
  href: string, 
  children: React.ReactNode,
  icon: React.ComponentType<{ className?: string }>
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100",
        isActive && "bg-gray-100 font-medium"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{children}</span>
    </Link>
  );
};

export function DashboardSidebar() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-black"></div>
          <div className="h-2 w-2 rounded-full bg-black"></div>
          <span className="font-headline font-bold">Synapse AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <SidebarLink href="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </SidebarLink>
        <SidebarLink href="/documents" icon={FileText}>
          Documents
        </SidebarLink>
        <SidebarLink href="/profile" icon={User}>
          Profile
        </SidebarLink>
      </nav>

      {/* Support Links */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <SidebarLink href="/help" icon={HelpCircle}>
          Help
        </SidebarLink>
        <SidebarLink href="/support" icon={LifeBuoy}>
          Support
        </SidebarLink>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Log out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
