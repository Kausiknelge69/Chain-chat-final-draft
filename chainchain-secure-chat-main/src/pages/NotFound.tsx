import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-foreground font-mono">404</h1>
          <p className="text-xl text-muted-foreground mt-2">Page not found</p>
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          Route: {location.pathname}
        </p>
        <Button variant="cyber" asChild>
          <Link to="/">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
