
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Navigate, useLocation } from "react-router-dom";
import { initStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [storeInitialized, setStoreInitialized] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Initialize the store with mock data
    initStore();
    setStoreInitialized(true);
  }, []);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <span className="ml-2 text-lg text-slate-600">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
