
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
  const [storeLoading, setStoreLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Initialize the store with mock data
    const initializeStore = async () => {
      try {
        setStoreLoading(true);
        await initStore();
        setStoreInitialized(true);
      } catch (error) {
        console.error("Failed to initialize store:", error);
      } finally {
        setStoreLoading(false);
      }
    };
    
    // Only initialize store if authenticated and not already initialized
    if (isAuthenticated && !storeInitialized) {
      initializeStore();
    }
    
    // If not authenticated and not loading, don't wait for store initialization
    if (!isAuthenticated && !loading) {
      setStoreLoading(false);
    }
  }, [isAuthenticated, storeInitialized, loading]);

  // Show loading spinner only if auth is initializing or if authenticated and store is loading
  if (loading || (isAuthenticated && storeLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="text-lg font-medium text-slate-600">
            {loading ? "Checking authentication..." : "Loading application data..."}
          </span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
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
