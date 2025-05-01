
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <AlertTriangle className="h-16 w-16 text-amber-600" />
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-3 text-xl text-slate-700">Page not found</p>
        <p className="mt-4 text-slate-500">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
