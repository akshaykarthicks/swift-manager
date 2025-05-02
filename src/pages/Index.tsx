
import { Navigate } from "react-router-dom";

// Redirect the index route to the dashboard
const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
