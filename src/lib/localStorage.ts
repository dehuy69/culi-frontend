import { Workspace, Message } from "./mockData";

const STORAGE_KEYS = {
  AUTH: "culi_auth",
  WORKSPACES: "culi_workspaces",
  MESSAGES: "culi_messages",
  MCP_CONFIG: "culi_mcp_config",
  CURRENT_USER: "culi_current_user",
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

  // Workspaces
  setWorkspaces: (workspaces: Workspace[]) => {
    localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
  },
  getWorkspaces: (): Workspace[] => {
    const workspaces = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    return workspaces ? JSON.parse(workspaces) : [];
  },
  addWorkspace: (workspace: Workspace) => {
    const workspaces = storage.getWorkspaces();
    workspaces.push(workspace);
    storage.setWorkspaces(workspaces);
  },
  updateWorkspace: (id: string, updates: Partial<Workspace>) => {
    const workspaces = storage.getWorkspaces();
    const index = workspaces.findIndex((w) => w.id === id);
    if (index !== -1) {
      workspaces[index] = { ...workspaces[index], ...updates };
      storage.setWorkspaces(workspaces);
    }
  },
  deleteWorkspace: (id: string) => {
    const workspaces = storage.getWorkspaces();
    storage.setWorkspaces(workspaces.filter((w) => w.id !== id));
    // Also delete messages for this workspace
    const allMessages = storage.getAllMessages();
    delete allMessages[id];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
  },

  // Messages
  getAllMessages: (): Record<string, Message[]> => {
    const messages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return messages ? JSON.parse(messages) : {};
  },
  getMessages: (workspaceId: string): Message[] => {
    const allMessages = storage.getAllMessages();
    return allMessages[workspaceId] || [];
  },
  addMessage: (workspaceId: string, message: Message) => {
    const allMessages = storage.getAllMessages();
    if (!allMessages[workspaceId]) {
      allMessages[workspaceId] = [];
    }
    allMessages[workspaceId].push(message);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

    // Update message count
    storage.updateWorkspace(workspaceId, {
      messageCount: allMessages[workspaceId].length,
    });
  },

  // MCP Config
  setMCPConfig: (config: any) => {
    localStorage.setItem(STORAGE_KEYS.MCP_CONFIG, JSON.stringify(config));
  },
  getMCPConfig: (): any => {
    const config = localStorage.getItem(STORAGE_KEYS.MCP_CONFIG);
    return config ? JSON.parse(config) : { kiotviet: { clientId: "", clientSecret: "", isConnected: false } };
  },
};
