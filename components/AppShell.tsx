"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/components/AuthProvider";

const LOGIN_ROUTE = "/login";
const PUBLIC_ROUTES = new Set([LOGIN_ROUTE]);

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const shouldShowSidebar = !isPublicRoute && !!user;

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) {
      router.replace(LOGIN_ROUTE);
    }
  }, [isPublicRoute, loading, router, user]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(124,58,237,0.2)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {shouldShowSidebar ? <Sidebar /> : null}
      <main className={`flex-1 transition-all duration-300 ${shouldShowSidebar ? "lg:ml-64" : ""}`}>
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}
