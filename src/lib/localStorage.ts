const STORAGE_KEYS = {
  AUTH: "culi_auth",
  CURRENT_USER: "culi_current_user",
  // Deprecated - kept for backward compatibility
  WORKSPACES: "culi_workspaces",
  MESSAGES: "culi_messages",
  MCP_CONFIG: "culi_mcp_config",
};

export interface User {
  id: string;
  email: string;
  name: string;
}

export const storage = {
  // Auth
  setAuth: (isAuthenticated: boolean) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  },
  getAuth: (): boolean => {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
    return auth ? JSON.parse(auth) : false;
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // User
  setCurrentUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  // Deprecated: Workspace and Message storage methods
  // These are kept for backward compatibility but should not be used
  // Use API calls instead via apiClient
  // Workspaces are now fetched from API
  // Messages are now fetched from API
  // MCP Config is now managed via API
};
