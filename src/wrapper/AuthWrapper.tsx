import { Loader2 } from "lucide-react";
import {
  getQueryParamsAsObject,
  onSigninCallback,
  userManager,
} from "../config.ts";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Handle the callback SSO
      if (location.search.includes("code=")) {
        await userManager.signinCallback();
        onSigninCallback();
        setIsAuthenticated(true);
        return;
      }

      try {
        const user = await userManager.getUser();

        if (!user || user.expired) {
          // Store the current location to redirect back after login
          sessionStorage.setItem("redirectPath", location.pathname);
          await userManager.signinRedirect({
            extraQueryParams: getQueryParamsAsObject(),
          });
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    setTimeout(checkAuth, 100);
  }, [location]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center h-svh">
        <Loader2 className="h-16 w-16 animate-spin repeat-infinite" />
        <div className="m-5 text-center">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthWrapper;
