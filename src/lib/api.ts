/**
 * API client for connecting to Culi backend
 */

import type {
  Workspace,
  Conversation,
  ConversationListResponse,
  Message,
  ChatResponse,
  ConnectedApp,
  SupportedApp,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

export interface ApiError {
  detail: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    const storedToken = localStorage.getItem("culi_access_token");
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("culi_access_token", token);
    } else {
      localStorage.removeItem("culi_access_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      this.setToken(null);
      // Clear auth from storage
      localStorage.removeItem("culi_auth");
      localStorage.removeItem("culi_current_user");
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
      throw new Error("Unauthorized - Please login again");
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Handle JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return {} as T;
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  async register(username: string, password: string) {
    const response = await this.request<{ message: string; user_id: number }>(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
    return response;
  }

  async getCurrentUser() {
    return this.request<{ id: number; username: string; created_at: string }>(
      "/api/v1/auth/me"
    );
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  // Workspace endpoints
  async listWorkspaces(): Promise<Workspace[]> {
    return this.request<Workspace[]>("/api/v1/workspaces");
  }

  async getWorkspace(id: number): Promise<Workspace> {
    return this.request<Workspace>(`/api/v1/workspaces/${id}`);
  }

  async createWorkspace(data: { name: string }): Promise<Workspace> {
    return this.request<Workspace>("/api/v1/workspaces", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkspace(id: number, data: { name?: string }): Promise<Workspace> {
    return this.request<Workspace>(`/api/v1/workspaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkspace(id: number): Promise<void> {
    return this.request<void>(`/api/v1/workspaces/${id}`, {
      method: "DELETE",
    });
  }

  // Chat endpoints
  async sendMessage(
    workspaceId: number,
    message: string,
    conversationId?: number
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/api/v1/workspaces/${workspaceId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  }

  async listConversations(workspaceId: number): Promise<ConversationListResponse> {
    return this.request<ConversationListResponse>(
      `/api/v1/workspaces/${workspaceId}/chat/conversations`
    );
  }

  async getMessages(workspaceId: number, conversationId: number): Promise<Message[]> {
    return this.request<Message[]>(
      `/api/v1/workspaces/${workspaceId}/chat/conversations/${conversationId}/messages`
    );
  }

  // Connected Apps endpoints
  async listSupportedApps(workspaceId: number): Promise<SupportedApp[]> {
    return this.request<SupportedApp[]>(
      `/api/v1/workspaces/${workspaceId}/connected-apps/supported`
    );
  }

  async listConnections(workspaceId: number): Promise<ConnectedApp[]> {
    return this.request<ConnectedApp[]>(
      `/api/v1/workspaces/${workspaceId}/connected-apps/connections`
    );
  }

  async createConnection(
    workspaceId: number,
    data: {
      app_id: string;
      name: string;
      app_category: string;
      connection_method: string;
      client_id?: string;
      client_secret?: string;
      retailer?: string;
      mcp_server_url?: string;
      mcp_auth_type?: string;
      mcp_auth_config?: Record<string, any>;
      config_json?: Record<string, any>;
      is_default?: boolean;
    }
  ): Promise<ConnectedApp> {
    return this.request<ConnectedApp>(
      `/api/v1/workspaces/${workspaceId}/connected-apps/connect`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateConnection(
    workspaceId: number,
    connectionId: number,
    data: {
      name?: string;
      client_id?: string;
      client_secret?: string;
      retailer?: string;
      mcp_server_url?: string;
      mcp_auth_config?: Record<string, any>;
      config_json?: Record<string, any>;
      status?: string;
    }
  ): Promise<ConnectedApp> {
    return this.request<ConnectedApp>(
      `/api/v1/workspaces/${workspaceId}/connected-apps/connections/${connectionId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async testConnection(
    workspaceId: number,
    connectionId: number
  ): Promise<{ status: string; message: string; data?: any }> {
    return this.request<{ status: string; message: string; data?: any }>(
      `/api/v1/workspaces/${workspaceId}/connected-apps/connections/${connectionId}/test`,
      {
        method: "POST",
      }
    );
  }

  async deleteConnection(workspaceId: number, connectionId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/api/v1/workspaces/${workspaceId}/connected-apps/connections/${connectionId}`,
      {
        method: "DELETE",
      }
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

