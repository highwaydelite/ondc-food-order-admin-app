import { userManager } from "../config";

export const handleLogout = async () => {
  try {
    await userManager.signoutRedirect({
      id_token_hint: (await userManager.getUser())?.id_token,
      post_logout_redirect_uri: import.meta.env.VITE_LOGOUT_REDIRECT_URL,
    });

    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};