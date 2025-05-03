
import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract tab from URL pathname
  useEffect(() => {
    if (location.pathname === '/signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Extract redirect path from location state
  const from = location.state?.from || '/';

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-slate-600">Checking authentication...</span>
        </div>
      </div>
    );
  }
  
  // Redirect to dashboard or previous page if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Handle tab change with URL navigation
  const handleTabChange = (value: string) => {
    const newTab = value as "login" | "signup";
    setActiveTab(newTab);
    navigate(newTab === "login" ? "/login" : "/signup", { state: { from } });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 p-4 items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Task Manager</h1>
          <p className="text-slate-500">Manage your tasks efficiently</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
