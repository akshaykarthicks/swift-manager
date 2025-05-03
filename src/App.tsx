
import { AuthProvider } from "@/components/auth/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import AllTasks from "./pages/AllTasks";
import UpcomingTasks from "./pages/UpcomingTasks";
import TeamView from "./pages/TeamView";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Configure QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes (previously cacheTime)
    },
  },
});

const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="text-lg font-medium text-slate-600">Loading application...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/my-tasks" element={<AppLayout><MyTasks /></AppLayout>} />
              <Route path="/tasks" element={<AppLayout><AllTasks /></AppLayout>} />
              <Route path="/upcoming" element={<AppLayout><UpcomingTasks /></AppLayout>} />
              <Route path="/team" element={<AppLayout><TeamView /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
