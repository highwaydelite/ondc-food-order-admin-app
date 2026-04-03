import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

import { UserManager, WebStorageStateStore } from "oidc-client-ts";
export const userManager = new UserManager({
  authority: import.meta.env.VITE_AUTHORITY,
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: `${window.location.origin}${window.location.pathname}`,
  post_logout_redirect_uri: import.meta.env.VITE_LOGOUT_REDIRECT_URL,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  monitorSession: true,
  metadata: {
    issuer: import.meta.env.VITE_AUTHORITY,
    authorization_endpoint: `${import.meta.env.VITE_AUTHORITY
      }/protocol/openid-connect/auth`,
    token_endpoint: `${import.meta.env.VITE_AUTHORITY
      }/protocol/openid-connect/token`,
    userinfo_endpoint: `${import.meta.env.VITE_AUTHORITY
      }/protocol/openid-connect/userinfo`,
    end_session_endpoint: `${import.meta.env.VITE_AUTHORITY
      }/protocol/openid-connect/logout`,
    jwks_uri: `${import.meta.env.VITE_AUTHORITY}/protocol/openid-connect/certs`,
  },
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  revokeTokensOnSignout: false,
  includeIdTokenInSilentRenew: true,
  loadUserInfo: true,
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
  checkSessionIntervalInSeconds: 60 * 5,
});
export const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

userManager.events.addAccessTokenExpiring(() => {
  console.log("Token is about to expire");
  refreshToken();
});

userManager.events.addSilentRenewError((error) => {
  console.error("Silent renewal error:", error);
});

userManager.events.addUserSignedOut(async () => {
  console.log("User signed out from Keycloak");
  // Clear local storage and session storage
  localStorage.clear();
  sessionStorage.clear();
  // Redirect to logout URL
  window.location.href = import.meta.env.VITE_LOGOUT_REDIRECT_URL;
});

userManager.events.addUserUnloaded(() => {
  console.log("User session unloaded");
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = import.meta.env.VITE_LOGOUT_REDIRECT_URL;
});

// Add session monitoring events
userManager.events.addSilentRenewError((error) => {
  console.error("Silent renewal error:", error);
  handleSessionError();
});

const handleSessionError = async () => {
  try {
    const user = await userManager.getUser();
    if (user) {
      // Check if the session is still valid with Keycloak
      const response = await fetch(
        `${import.meta.env.VITE_AUTHORITY}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (!response.ok) {
        // Session is invalid, trigger logout
        console.log("Session invalid, logging out");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = import.meta.env.VITE_LOGOUT_REDIRECT_URL;
      }
    }
  } catch (error) {
    console.error("Error checking session:", error);
    // On error, assume session is invalid and logout
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = import.meta.env.VITE_LOGOUT_REDIRECT_URL;
  }
};

// Add periodic session check
setInterval(async () => {
  try {
    const user = await userManager.getUser();
    if (user) {
      const response = await fetch(
        `${import.meta.env.VITE_AUTHORITY}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (!response.ok) {
        console.log("Session check failed, logging out");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = import.meta.env.VITE_LOGOUT_REDIRECT_URL;
      }
    }
  } catch (error) {
    console.error("Error in periodic session check:", error);
  }
}, 1000 * 60 * 5);

const refreshToken = async () => {
  try {
    const user = await userManager.signinSilent();
    console.log("Token refreshed successfully");
    return user;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export const getKeyCloakToken = async () => {
  try {
    let user = await userManager.getUser();

    // Calculate seconds until expiration
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeUntilExpiry = user?.expires_at ? user.expires_at - now : 0;

    // If user exists but token is expired or about to expire (within 60 seconds)
    if (user && (user.expired || timeUntilExpiry < 60)) {
      console.log("Token expired or about to expire, attempting refresh");
      user = await refreshToken();
    }

    if (user && !user.expired) {
      console.log(
        "Valid token retrieved, expires in:",
        timeUntilExpiry,
        "seconds"
      );
      return user.access_token;
    } else {
      console.log("No valid user session");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const getQueryParamsAsObject = () => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};