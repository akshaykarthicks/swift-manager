
import { AuthProvider } from "@/components/auth/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import AllTasks from "./pages/AllTasks";
import UpcomingTasks from "./pages/UpcomingTasks";
import TeamView from "./pages/TeamView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/my-tasks" element={<AppLayout><MyTasks /></AppLayout>} />
            <Route path="/tasks" element={<AppLayout><AllTasks /></AppLayout>} />
            <Route path="/upcoming" element={<AppLayout><UpcomingTasks /></AppLayout>} />
            <Route path="/team" element={<AppLayout><TeamView /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
